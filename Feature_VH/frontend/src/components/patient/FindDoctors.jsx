import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Heart, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
// import { mockDoctors } from '../../data/mockData';
import DoctorCard from './DoctorCard';
import BookingModal from './BookingModal';
import Footer from '../shared/Footer';

const FindDoctors = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpeciality, setSelectedSpeciality] = useState('all');
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/doctors/');
                if (response.ok) {
                    const data = await response.json();
                    setDoctors(data);
                }
            } catch (error) {
                console.error("Failed to fetch doctors:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    const specialities = ['all', 'Cardiologist', 'Pediatrician', 'Dermatologist', 'Neurologist', 'Anesthesiologist'];

    const filteredDoctors = doctors.filter((doctor) => {
        // Adapter for backend data structure if needed, assuming backend returns similar fields or we map them
        // Backend Doctor model: user (nested), speciality, etc.
        // DoctorCard expects: name, speciality, image, rating...
        // We might need to map backend data to DoctorCard props expected format.
        // Backend: { user: { first_name, last_name }, speciality, ... }
        const name = doctor.user ? `${doctor.user.first_name} ${doctor.user.last_name}` : 'Unknown Doctor';
        const matchesSearch =
            name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.speciality.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSpeciality = selectedSpeciality === 'all' || doctor.speciality === selectedSpeciality;
        return matchesSearch && matchesSpeciality;
    });

    const handleBookAppointment = (doctor) => {
        setSelectedDoctor(doctor);
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-navy-50">
            {/* Top Banner */}
            <div
                className="bg-gradient-to-r from-navy-900 via-navy-800 to-teal-900 text-white py-10"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link to="/patient/dashboard" className="inline-flex items-center text-navy-200 hover:text-white mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold mb-2">
                        Find a Doctor
                    </h1>
                    <p className="text-navy-200 max-w-2xl">
                        Search and book appointments with top specialists. Filter by speciality or search by name.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mb-6 max-w-3xl mx-auto"
                >
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-navy-400" />
                        <input
                            type="text"
                            placeholder="Search by doctor name or speciality..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl text-navy-900 focus:outline-none focus:ring-4 focus:ring-teal-300 shadow-md bg-white"
                        />
                    </div>
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center justify-center space-x-2 mb-8 overflow-x-auto pb-2"
                >
                    <Filter className="w-5 h-5 text-navy-600 flex-shrink-0" />
                    {specialities.map((spec) => (
                        <button
                            key={spec}
                            onClick={() => setSelectedSpeciality(spec)}
                            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-300 ${selectedSpeciality === spec
                                ? 'bg-teal-600 text-white shadow-md'
                                : 'bg-white text-navy-600 hover:bg-navy-100'
                                }`}
                        >
                            {spec === 'all' ? 'All Specialities' : spec}
                        </button>
                    ))}
                </motion.div>

                {/* Results Count */}
                <div className="flex items-center justify-between mb-6 border-b border-navy-200 pb-2">
                    <p className="text-navy-600">
                        <span className="font-bold text-navy-900">{filteredDoctors.length}</span> doctors found
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-navy-600">
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                        <span>Available now</span>
                    </div>
                </div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: {
                            transition: {
                                staggerChildren: 0.05,
                            },
                        },
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {loading ? (
                        <p className="text-center text-navy-600 col-span-3">Loading doctors...</p>
                    ) : (
                        filteredDoctors.map((doctor) => {
                            // Map backend data to frontend props if necessary
                            const mappedDoctor = {
                                ...doctor,
                                name: doctor.user ? `Dr. ${doctor.user.first_name || ''} ${doctor.user.last_name || ''}` : 'Doctor',
                                image: doctor.image_url || 'https://via.placeholder.com/150', // Fallback image
                                // Ensure other fields match
                            };
                            return (
                                <motion.div
                                    key={doctor.id}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 },
                                    }}
                                >
                                    <DoctorCard doctor={mappedDoctor} onBookAppointment={handleBookAppointment} />
                                </motion.div>
                            );
                        })
                    )}
                </motion.div>

                {filteredDoctors.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                    >
                        <Heart className="w-12 h-12 text-navy-300 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-navy-900 mb-1">No doctors found</h3>
                        <p className="text-navy-600 text-sm">Try adjusting your search or filters.</p>
                    </motion.div>
                )}
            </div>

            {/* Booking Modal */}
            {selectedDoctor && (
                <BookingModal
                    doctor={selectedDoctor}
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedDoctor(null);
                    }}
                />
            )}

            <Footer />
        </div>
    );
};

export default FindDoctors;
