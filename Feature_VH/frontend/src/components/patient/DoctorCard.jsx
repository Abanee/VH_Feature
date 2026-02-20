import { motion } from 'framer-motion';
import { Star, Award, Clock, CheckCircle2 } from 'lucide-react';

const DoctorCard = ({ doctor, onBookAppointment }) => {
  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)" }}
      transition={{ duration: 0.3 }}
      className="card cursor-pointer"
    >
      <div className="flex items-start space-x-4">
        {/* Doctor Photo */}
        <div className="relative">
          <img
            src={doctor.photo}
            alt={doctor.name}
            className="w-20 h-20 rounded-full object-cover border-4 border-teal-100"
          />
          {doctor.available && (
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        {/* Doctor Info */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-navy-900">{doctor.name}</h3>
          <p className="text-sm text-teal-600 font-semibold">{doctor.speciality}</p>
          <p className="text-xs text-navy-500 mt-1">{doctor.education}</p>

          {/* Stats */}
          <div className="flex items-center space-x-4 mt-3">
            <div className="flex items-center space-x-1">
              <Award className="w-4 h-4 text-navy-400" />
              <span className="text-sm text-navy-600">{doctor.experience} yrs</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4 text-navy-400" />
              <span className="text-sm text-navy-600">{doctor.consultations} consults</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
              <span className="text-sm font-semibold text-navy-900">{doctor.rating}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      <p className="text-sm text-navy-600 mt-4 line-clamp-2">{doctor.bio}</p>

      {/* Action Buttons */}
      <div className="flex space-x-3 mt-4">
        <button
          onClick={() => onBookAppointment(doctor)}
          disabled={!doctor.available}
          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${
            doctor.available
              ? 'bg-teal-600 hover:bg-teal-700 text-white'
              : 'bg-navy-200 text-navy-400 cursor-not-allowed'
          }`}
        >
          {doctor.available ? 'Book Appointment' : 'Unavailable'}
        </button>
        <button className="px-4 py-2 border-2 border-navy-200 rounded-lg font-semibold text-navy-700 hover:border-navy-300 transition-all duration-300">
          View Profile
        </button>
      </div>
    </motion.div>
  );
};

export default DoctorCard;
