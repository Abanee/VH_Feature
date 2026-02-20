import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Video, MapPin } from 'lucide-react';
import useAppointmentStore from '../../store/appointmentStore';
import useAuthStore from '../../store/authStore';

const BookingModal = ({ doctor, isOpen, onClose }) => {
  const addAppointment = useAppointmentStore((state) => state.addAppointment);
  const user = useAuthStore((state) => state.user);

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    reason: '',
    type: 'video'
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const appointment = {
      doctorId: doctor.id,
      doctorName: doctor.name,
      patientName: user.name,
      patientAge: 35, // Mock data
      patientGender: 'Male', // Mock data
      ...formData
    };

    addAppointment(appointment);
    alert('Appointment request submitted successfully!');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-premium-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-navy-100">
                <div>
                  <h2 className="text-2xl font-bold text-navy-900">Book Appointment</h2>
                  <p className="text-sm text-navy-600 mt-1">with {doctor.name}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-navy-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-navy-600" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Consultation Type */}
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-3">
                    Consultation Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'video' })}
                      className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                        formData.type === 'video'
                          ? 'bg-teal-600 text-white shadow-md'
                          : 'bg-navy-100 text-navy-600 hover:bg-navy-200'
                      }`}
                    >
                      <Video className="w-5 h-5" />
                      <span>Video Call</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'in-person' })}
                      className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                        formData.type === 'in-person'
                          ? 'bg-teal-600 text-white shadow-md'
                          : 'bg-navy-100 text-navy-600 hover:bg-navy-200'
                      }`}
                    >
                      <MapPin className="w-5 h-5" />
                      <span>In-Person</span>
                    </button>
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-navy-700 mb-2">
                    Preferred Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-navy-400" />
                    </div>
                    <input
                      id="date"
                      name="date"
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                {/* Time */}
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-navy-700 mb-2">
                    Preferred Time
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-navy-400" />
                    </div>
                    <input
                      id="time"
                      name="time"
                      type="time"
                      required
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-navy-700 mb-2">
                    Reason for Consultation
                  </label>
                  <textarea
                    id="reason"
                    name="reason"
                    rows="4"
                    required
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="input-field resize-none"
                    placeholder="Please describe your symptoms or reason for consultation..."
                  />
                </div>

                {/* Submit Button */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;
