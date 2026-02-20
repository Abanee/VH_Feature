import { create } from 'zustand';
import { recordingAPI } from '../api/api';

const MAX_SIZE_MB = 50;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const useRecordingStore = create((set, get) => ({
    isRecording: false,
    mediaRecorder: null,
    recordedChunks: [],
    recordingBlob: null,
    recordingUrl: null,
    uploadProgress: 0,
    isUploading: false,
    error: null,
    startTime: null,

    /**
     * Start recording from a MediaStream.
     */
    startRecording: (stream) => {
        try {
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp8,opus',
            });

            const chunks = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);

                    // Check total size
                    const totalSize = chunks.reduce((acc, chunk) => acc + chunk.size, 0);
                    if (totalSize > MAX_SIZE_BYTES) {
                        console.warn('Recording approaching 50MB limit, stopping...');
                        mediaRecorder.stop();
                        set({ error: 'Recording stopped: 50MB limit reached' });
                    }
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                set({
                    recordedChunks: chunks,
                    recordingBlob: blob,
                    recordingUrl: url,
                    isRecording: false,
                });
            };

            mediaRecorder.start(1000); // Capture in 1s intervals
            set({
                isRecording: true,
                mediaRecorder,
                recordedChunks: [],
                recordingBlob: null,
                recordingUrl: null,
                error: null,
                startTime: Date.now(),
            });
        } catch (error) {
            console.error('Failed to start recording:', error);
            set({ error: 'Failed to start recording' });
        }
    },

    /**
     * Stop recording.
     */
    stopRecording: () => {
        const { mediaRecorder } = get();
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
    },

    /**
     * Upload the recorded call to the backend.
     */
    uploadRecording: async (appointmentId) => {
        const { recordingBlob, startTime } = get();
        if (!recordingBlob) {
            set({ error: 'No recording to upload' });
            return false;
        }

        if (recordingBlob.size > MAX_SIZE_BYTES) {
            set({ error: `Recording exceeds ${MAX_SIZE_MB}MB limit` });
            return false;
        }

        set({ isUploading: true, uploadProgress: 0 });

        try {
            const duration = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
            const formData = new FormData();
            formData.append('recording_file', recordingBlob, `call_${appointmentId}_${Date.now()}.webm`);
            formData.append('appointment', appointmentId);
            formData.append('duration_seconds', duration);

            await recordingAPI.upload(formData);

            set({ isUploading: false, uploadProgress: 100, error: null });
            return true;
        } catch (error) {
            console.error('Upload failed:', error);
            set({ isUploading: false, error: 'Upload failed' });
            return false;
        }
    },

    /**
     * Reset recording state.
     */
    resetRecording: () => {
        const { recordingUrl } = get();
        if (recordingUrl) URL.revokeObjectURL(recordingUrl);
        set({
            isRecording: false,
            mediaRecorder: null,
            recordedChunks: [],
            recordingBlob: null,
            recordingUrl: null,
            uploadProgress: 0,
            isUploading: false,
            error: null,
            startTime: null,
        });
    },
}));

export default useRecordingStore;
