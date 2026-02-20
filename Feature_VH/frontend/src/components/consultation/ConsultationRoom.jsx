import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Calendar, MapPin, Video as VideoIcon } from 'lucide-react';
import ChatSidebar from './ChatSidebar';
import VideoWindow from './VideoWindow';

const ConsultationRoom = () => {
  const { appointmentId } = useParams();
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');

  const handleScheduleMeeting = (e) => {
    e.preventDefault();
    alert(`In-person meeting scheduled for ${meetingDate} at ${meetingTime}`);
    setShowScheduleModal(false);
  };

  return (
    <div className="min-h-screen bg-navy-50 pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-navy-900">Consultation Room</h1>
              <p className="text-navy-600 mt-1">Appointment #{appointmentId}</p>
            </div>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition-colors shadow-md"
            >
              <MapPin className="w-5 h-5" />
              <span>Schedule In-Person Meet</span>
            </button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
          {/* Video Window - Takes 2 columns */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 h-[600px]"
          >
            <VideoWindow />
          </motion.div>

          {/* Chat Sidebar - Takes 1 column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="h-[600px]"
          >
            <ChatSidebar />
          </motion.div>
        </div>

        {/* Schedule Meeting Modal */}
        {showScheduleModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowScheduleModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-premium-lg max-w-md w-full p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-teal-100 p-3 rounded-full">
                    <MapPin className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-navy-900">Schedule In-Person Visit</h2>
                    <p className="text-sm text-navy-600">Set up a physical consultation</p>
                  </div>
                </div>

                <form onSubmit={handleScheduleMeeting} className="space-y-4">
                  <div>
                    <label htmlFor="meetingDate" className="block text-sm font-medium text-navy-700 mb-2">
                      Meeting Date
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-navy-400" />
                      </div>
                      <input
                        id="meetingDate"
                        type="date"
                        required
                        value={meetingDate}
                        onChange={(e) => setMeetingDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="input-field pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="meetingTime" className="block text-sm font-medium text-navy-700 mb-2">
                      Meeting Time
                    </label>
                    <input
                      id="meetingTime"
                      type="time"
                      required
                      value={meetingTime}
                      onChange={(e) => setMeetingTime(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Location:</strong> Virtual Hospital Main Branch<br />
                      123 Healthcare Street, Mumbai, MH 400001
                    </p>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowScheduleModal(false)}
                      className="flex-1 btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 btn-primary"
                    >
                      Confirm Schedule
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default ConsultationRoom;
