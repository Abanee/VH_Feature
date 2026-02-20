import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Settings, Maximize2, Circle, Square, Upload } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import useRecordingStore from '../../store/recordingStore';
import useAuthStore from '../../store/authStore';

const VideoWindow = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [peerConnected, setPeerConnected] = useState(false);

  const videoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const streamRef = useRef(null);
  const peerRef = useRef(null);
  const wsRef = useRef(null);
  const timerRef = useRef(null);

  const user = useAuthStore((state) => state.user);
  const { isRecording, recordingBlob, recordingUrl, isUploading, uploadProgress, error: recError,
    startRecording, stopRecording, uploadRecording, resetRecording } = useRecordingStore();

  // Format duration
  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Start call timer
  useEffect(() => {
    timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Initialize local media
  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Error accessing media devices:", err);
      }
    };
    startVideo();

    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (wsRef.current) wsRef.current.close();
      resetRecording();
    };
  }, []);

  // WebRTC signaling
  useEffect(() => {
    if (!appointmentId) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    const ws = new WebSocket(`ws://localhost:8001/ws/signal/${appointmentId}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Signaling connected');
    };

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'peer-joined') {
        setPeerConnected(true);
        // Create offer if we're the one who was already here
        if (streamRef.current && !peerRef.current) {
          await createPeerConnection();
          const offer = await peerRef.current.createOffer();
          await peerRef.current.setLocalDescription(offer);
          ws.send(JSON.stringify({ type: 'offer', sdp: offer.sdp }));
        }
      }

      if (data.type === 'offer') {
        await createPeerConnection();
        await peerRef.current.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: data.sdp }));
        const answer = await peerRef.current.createAnswer();
        await peerRef.current.setLocalDescription(answer);
        ws.send(JSON.stringify({ type: 'answer', sdp: answer.sdp }));
      }

      if (data.type === 'answer') {
        if (peerRef.current) {
          await peerRef.current.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: data.sdp }));
        }
      }

      if (data.type === 'ice-candidate') {
        if (peerRef.current) {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      }

      if (data.type === 'peer-left') {
        setPeerConnected(false);
      }

      if (data.type === 'call-ended') {
        handleEndCall();
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) ws.close();
    };
  }, [appointmentId]);

  const createPeerConnection = async () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => pc.addTrack(track, streamRef.current));
    }

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      setPeerConnected(true);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ice-candidate', candidate: event.candidate }));
      }
    };

    peerRef.current = pc;
  };

  // Video/Audio toggles
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(t => t.enabled = isVideoOn);
    }
  }, [isVideoOn]);

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(t => t.enabled = isAudioOn);
    }
  }, [isAudioOn]);

  // Recording handlers
  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else if (streamRef.current) {
      startRecording(streamRef.current);
    }
  };

  const handleUploadRecording = async () => {
    if (appointmentId) {
      await uploadRecording(appointmentId);
    }
  };

  const handleEndCall = () => {
    if (isRecording) stopRecording();
    if (peerRef.current) peerRef.current.close();
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'call-ended' }));
      wsRef.current.close();
    }
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    clearInterval(timerRef.current);

    // Navigate back based on role
    const role = user?.role || 'patient';
    navigate(role === 'doctor' ? '/doctor' : '/patient');
  };

  return (
    <div className="h-full bg-navy-900 rounded-xl overflow-hidden relative shadow-lg">
      {/* Remote Video / Placeholder */}
      <div className="w-full h-full bg-gradient-to-br from-navy-800 to-navy-900 flex items-center justify-center">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover ${peerConnected ? '' : 'hidden'}`}
        />
        {!peerConnected && (
          <div className="text-center">
            <div className="w-32 h-32 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl font-bold text-white">
                {peerConnected ? 'DR' : '?'}
              </span>
            </div>
            <p className="text-white text-lg font-semibold">Waiting for peer...</p>
            <p className="text-navy-300 text-sm">Share the consultation link to connect</p>
          </div>
        )}
      </div>

      {/* Self Video (PiP) */}
      <motion.div
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute bottom-24 right-4 w-48 h-36 bg-navy-800 rounded-lg overflow-hidden border-2 border-navy-700 shadow-xl cursor-move z-10"
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover transform scale-x-[-1]"
        />
        {!isVideoOn && (
          <div className="absolute inset-0 flex items-center justify-center bg-navy-800">
            <p className="text-white text-xs">Camera Off</p>
          </div>
        )}
      </motion.div>

      {/* Call Duration & Recording indicator */}
      <div className="absolute top-4 left-4 flex items-center space-x-3 z-20">
        <div className="bg-black bg-opacity-50 px-4 py-2 rounded-full backdrop-blur-sm">
          <p className="text-white text-sm font-semibold">{formatDuration(callDuration)}</p>
        </div>
        {isRecording && (
          <div className="bg-red-600 bg-opacity-80 px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center space-x-2 animate-pulse">
            <Circle className="w-3 h-3 text-white fill-white" />
            <span className="text-white text-xs font-semibold">REC</span>
          </div>
        )}
      </div>

      {/* Upload recording button (after recording stops) */}
      {recordingBlob && !isRecording && (
        <div className="absolute top-4 right-4 z-20 flex items-center space-x-2">
          {recordingUrl && (
            <a
              href={recordingUrl}
              download={`call_recording_${appointmentId}.webm`}
              className="bg-navy-700 hover:bg-navy-600 text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center space-x-1"
            >
              <span>Download</span>
            </a>
          )}
          <button
            onClick={handleUploadRecording}
            disabled={isUploading}
            className="bg-teal-600 hover:bg-teal-700 disabled:bg-navy-600 text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center space-x-1"
          >
            <Upload className="w-3 h-3" />
            <span>{isUploading ? `${uploadProgress}%` : 'Save to Server'}</span>
          </button>
        </div>
      )}

      {recError && (
        <div className="absolute top-16 right-4 z-20 bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs">
          {recError}
        </div>
      )}

      {/* Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 z-20">
        <div className="flex items-center justify-center space-x-4">
          {/* Video Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`p-4 rounded-full transition-colors ${isVideoOn
              ? 'bg-navy-700 hover:bg-navy-600'
              : 'bg-red-600 hover:bg-red-700'
              }`}
          >
            {isVideoOn ? <Video className="w-6 h-6 text-white" /> : <VideoOff className="w-6 h-6 text-white" />}
          </motion.button>

          {/* Audio Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAudioOn(!isAudioOn)}
            className={`p-4 rounded-full transition-colors ${isAudioOn
              ? 'bg-navy-700 hover:bg-navy-600'
              : 'bg-red-600 hover:bg-red-700'
              }`}
          >
            {isAudioOn ? <Mic className="w-6 h-6 text-white" /> : <MicOff className="w-6 h-6 text-white" />}
          </motion.button>

          {/* Record Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleRecording}
            className={`p-4 rounded-full transition-colors ${isRecording
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-navy-700 hover:bg-navy-600'
              }`}
            title={isRecording ? 'Stop Recording' : 'Start Recording'}
          >
            {isRecording ? <Square className="w-6 h-6 text-white" /> : <Circle className="w-6 h-6 text-white" />}
          </motion.button>

          {/* End Call */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEndCall}
            className="p-5 bg-red-600 hover:bg-red-700 rounded-full"
          >
            <PhoneOff className="w-7 h-7 text-white" />
          </motion.button>

          {/* Settings */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-4 bg-navy-700 hover:bg-navy-600 rounded-full"
          >
            <Settings className="w-6 h-6 text-white" />
          </motion.button>

          {/* Fullscreen */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-4 bg-navy-700 hover:bg-navy-600 rounded-full"
          >
            <Maximize2 className="w-6 h-6 text-white" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default VideoWindow;
