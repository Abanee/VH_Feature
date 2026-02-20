import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Clock, TrendingUp, FileText } from 'lucide-react';
import useAppointmentStore from '../../store/appointmentStore';
import AppointmentCard from './AppointmentCard';
import PrescriptionForm from './PrescriptionForm';
import Footer from '../shared/Footer';

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState('appointments');
  const { appointments, updateAppointmentStatus } = useAppointmentStore();

  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
  const approvedAppointments = appointments.filter(apt => apt.status === 'approved');
  const todayAppointments = appointments.filter(apt => 
    new Date(apt.date).toDateString() === new Date().toDateString()
  );

  const handleApprove = (id) => {
    updateAppointmentStatus(id, 'approved');
  };

  const handleDecline = (id) => {
    updateAppointmentStatus(id, 'declined');
  };

  const stats = [
    {
      title: "Today's Appointments",
      value: todayAppointments.length,
      icon: Calendar,
      color: "bg-blue-500",
      bgLight: "bg-blue-100",
      textColor: "text-blue-600"
    },
    {
      title: "Pending Requests",
      value: pendingAppointments.length,
      icon: Clock,
      color: "bg-yellow-500",
      bgLight: "bg-yellow-100",
      textColor: "text-yellow-600"
    },
    {
      title: "Total Patients",
      value: appointments.length,
      icon: Users,
      color: "bg-teal-500",
      bgLight: "bg-teal-100",
      textColor: "text-teal-600"
    },
    {
      title: "Approved Today",
      value: approvedAppointments.length,
      icon: TrendingUp,
      color: "bg-green-500",
      bgLight: "bg-green-100",
      textColor: "text-green-600"
    }
  ];

  return (
    <div className="min-h-screen bg-navy-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-teal-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h1 className="text-4xl font-bold mb-2">Doctor Dashboard</h1>
            <p className="text-navy-200">Manage your appointments and patient care</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ y: -5 }}
              className="card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-navy-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-navy-900">{stat.value}</p>
                </div>
                <div className={`${stat.bgLight} p-4 rounded-xl`}>
                  <stat.icon className={`w-8 h-8 ${stat.textColor}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 border-b border-navy-200">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-6 py-3 font-semibold transition-all duration-300 border-b-2 ${
              activeTab === 'appointments'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-navy-600 hover:text-navy-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Appointments</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('prescription')}
            className={`px-6 py-3 font-semibold transition-all duration-300 border-b-2 ${
              activeTab === 'prescription'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-navy-600 hover:text-navy-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Prescribe Medicine</span>
            </div>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'appointments' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Pending Appointments */}
            {pendingAppointments.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-navy-900 mb-4">
                  Pending Requests ({pendingAppointments.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onApprove={handleApprove}
                      onDecline={handleDecline}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Approved Appointments */}
            {approvedAppointments.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-navy-900 mb-4">
                  Upcoming Appointments ({approvedAppointments.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {approvedAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onApprove={handleApprove}
                      onDecline={handleDecline}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* No Appointments */}
            {appointments.length === 0 && (
              <div className="text-center py-20">
                <Calendar className="w-16 h-16 text-navy-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-navy-900 mb-2">No appointments yet</h3>
                <p className="text-navy-600">New appointment requests will appear here</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'prescription' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <PrescriptionForm />
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default DoctorDashboard;
