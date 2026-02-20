import { motion } from 'framer-motion';
import { Calendar, Clock, User, FileText, Video, MapPin, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AppointmentCard = ({ appointment, onApprove, onDecline }) => {
  const navigate = useNavigate();

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    declined: 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      {/* Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <span className={`badge ${statusColors[appointment.status]} border capitalize`}>
          {appointment.status}
        </span>
        <div className="flex items-center space-x-2 text-sm text-navy-600">
          {appointment.type === 'video' ? (
            <>
              <Video className="w-4 h-4" />
              <span>Video Call</span>
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4" />
              <span>In-Person</span>
            </>
          )}
        </div>
      </div>

      {/* Patient Info */}
      <div className="flex items-start space-x-3 mb-4">
        <div className="bg-teal-100 p-3 rounded-full">
          <User className="w-6 h-6 text-teal-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-navy-900">{appointment.patientName}</h3>
          <p className="text-sm text-navy-600">
            {appointment.patientAge ? `${appointment.patientAge} years • ` : ''}{appointment.patientGender || ''}
          </p>
        </div>
      </div>

      {/* Appointment Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-sm text-navy-600">
          <Calendar className="w-4 h-4 text-navy-400" />
          <span>{new Date(appointment.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-navy-600">
          <Clock className="w-4 h-4 text-navy-400" />
          <span>{appointment.time}</span>
        </div>
      </div>

      {/* Reason */}
      <div className="bg-navy-50 p-3 rounded-lg mb-4">
        <div className="flex items-start space-x-2">
          <FileText className="w-4 h-4 text-navy-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-navy-700 mb-1">Reason for Visit</p>
            <p className="text-sm text-navy-600">{appointment.reason}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {appointment.status === 'pending' && (
        <div className="flex space-x-3">
          <button
            onClick={() => onApprove(appointment.id)}
            className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all duration-300"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approve</span>
          </button>
          <button
            onClick={() => onDecline(appointment.id)}
            className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-300"
          >
            <XCircle className="w-4 h-4" />
            <span>Decline</span>
          </button>
        </div>
      )}

      {appointment.status === 'approved' && (
        <button
          onClick={() => navigate(`/consultation/${appointment.id}`)}
          className="w-full btn-primary"
        >
          Start Consultation
        </button>
      )}
    </motion.div>
  );
};

export default AppointmentCard;
