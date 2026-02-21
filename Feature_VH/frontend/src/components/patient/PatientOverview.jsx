import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Pill, ClipboardList, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useAppointmentStore from '../../store/appointmentStore';
import { mockPatientHistory, mockMedicines } from '../../data/mockData';
import Footer from '../shared/Footer';

const PatientOverview = () => {
    const { user } = useAuthStore();
    const { appointments, fetchAppointments } = useAppointmentStore();

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    // API already filters by current user, so we use appointments directly
    const patientAppointments = appointments;

    const upcomingAppointments = patientAppointments
        .filter((apt) => apt.status === 'approved' || apt.status === 'pending')
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);

    return (
        <div className="min-h-screen bg-navy-50">
            {/* Top Banner */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gradient-to-r from-navy-900 via-navy-800 to-teal-900 text-white py-10"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">
                            Welcome back, {user?.name || 'Patient'}
                        </h1>
                        <p className="text-navy-200">
                            Your health overview. Check appointments, medications, and history.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Link to="/patient/find-doctors" className="btn-primary inline-flex items-center space-x-2">
                            <Stethoscope className="w-5 h-5" />
                            <span>Find a Doctor</span>
                        </Link>
                    </div>
                </div>
            </motion.div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Upcoming Appointments */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                                <Calendar className="w-5 h-5 text-teal-600" />
                                <h2 className="text-base font-semibold text-navy-900">Your appointments</h2>
                            </div>
                            <span className="badge-info text-xs">
                                {upcomingAppointments.length} upcoming
                            </span>
                        </div>
                        {upcomingAppointments.length === 0 ? (
                            <p className="text-sm text-navy-600">
                                You have no upcoming appointments.
                            </p>
                        ) : (
                            <ul className="space-y-3 max-h-56 overflow-y-auto">
                                {upcomingAppointments.map((apt) => (
                                    <li
                                        key={apt.id}
                                        className="border border-navy-100 rounded-lg px-3 py-2 text-xs bg-navy-50"
                                    >
                                        <p className="font-semibold text-navy-900">{apt.reason}</p>
                                        <p className="text-navy-600">
                                            {new Date(apt.date).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                            })}{' '}
                                            • {apt.time}
                                        </p>
                                        <p className="capitalize text-navy-500">Status: {apt.status}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </motion.div>

                    {/* Medical History */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="card"
                    >
                        <div className="flex items-center space-x-2 mb-3">
                            <ClipboardList className="w-5 h-5 text-teal-600" />
                            <h2 className="text-base font-semibold text-navy-900">Medical history</h2>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="font-semibold text-navy-800">Conditions</p>
                                <p className="text-navy-600">
                                    {mockPatientHistory.medicalConditions.join(', ')}
                                </p>
                            </div>
                            <div>
                                <p className="font-semibold text-navy-800">Allergies</p>
                                <p className="text-red-700">
                                    {mockPatientHistory.allergies.length
                                        ? mockPatientHistory.allergies.join(', ')
                                        : 'No known allergies'}
                                </p>
                            </div>
                            <div>
                                <p className="font-semibold text-navy-800">Previous visits</p>
                                <ul className="mt-1 space-y-1 text-xs text-navy-600 max-h-24 overflow-y-auto">
                                    {mockPatientHistory.previousVisits.map((visit, idx) => (
                                        <li key={idx}>
                                            {visit.date} – {visit.reason} ({visit.doctor})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </motion.div>

                    {/* Current Medications */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="card"
                    >
                        <div className="flex items-center space-x-2 mb-3">
                            <Pill className="w-5 h-5 text-teal-600" />
                            <h2 className="text-base font-semibold text-navy-900">Medicines & prescriptions</h2>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="font-semibold text-navy-800">Current medications</p>
                                <ul className="mt-1 space-y-1 text-xs text-navy-600">
                                    {mockPatientHistory.currentMedications.map((med, idx) => (
                                        <li key={idx}>• {med}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <p className="font-semibold text-navy-800">Recommended medicines library</p>
                                <ul className="mt-1 space-y-1 text-xs text-navy-600 max-h-24 overflow-y-auto">
                                    {mockMedicines.slice(0, 6).map((m) => (
                                        <li key={m.id}>
                                            {m.name} <span className="text-navy-400">({m.category})</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PatientOverview;
