import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Calendar,
  Users,
  Stethoscope,
  Pill,
  ShieldCheck,
  Search,
  Filter,
} from 'lucide-react';
import Footer from '../shared/Footer';
import { doctorAPI, medicineAPI, adminAPI } from '../../api/api';
import useAppointmentStore from '../../store/appointmentStore';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [appointmentFilter, setAppointmentFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [doctors, setDoctors] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [apiStats, setApiStats] = useState(null);

  const { appointments, fetchAppointments } = useAppointmentStore();

  useEffect(() => {
    fetchAppointments();

    const fetchDoctors = async () => {
      try {
        const response = await doctorAPI.getAll();
        const data = response.data.results || response.data;
        setDoctors(data.map(doc => ({
          id: doc.id,
          name: doc.name || `Dr. ${doc.user?.first_name || ''} ${doc.user?.last_name || ''}`,
          speciality: doc.speciality,
          experience: doc.experience,
          consultations: doc.consultations,
          rating: doc.rating,
          available: doc.available,
          photo: doc.photo || doc.image_url,
        })));
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
      }
    };

    const fetchMedicines = async () => {
      try {
        const response = await medicineAPI.getAll();
        const data = response.data.results || response.data;
        setMedicines(data);
      } catch (error) {
        console.error('Failed to fetch medicines:', error);
      }
    };

    const fetchStats = async () => {
      try {
        const response = await adminAPI.getStats();
        setApiStats(response.data);
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      }
    };

    fetchDoctors();
    fetchMedicines();
    fetchStats();
  }, [fetchAppointments]);

  const stats = useMemo(() => {
    if (apiStats) {
      return {
        totalDoctors: apiStats.total_doctors,
        totalAppointments: apiStats.total_appointments,
        completedAppointments: apiStats.approved_appointments,
        pendingAppointments: apiStats.pending_appointments,
        uniquePatients: apiStats.total_patients,
      };
    }

    const totalDoctors = doctors.length;
    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter((a) => a.status === 'approved').length;
    const pendingAppointments = appointments.filter((a) => a.status === 'pending').length;
    const uniquePatients = new Set(appointments.map((a) => a.patientName)).size;

    return {
      totalDoctors,
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      uniquePatients,
    };
  }, [appointments, doctors, apiStats]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.speciality.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = doctorFilter === 'all' || doc.speciality === doctorFilter;
      return matchesSearch && matchesFilter;
    });
  }, [doctorFilter, searchTerm, doctors]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const matchesStatus = appointmentFilter === 'all' || apt.status === appointmentFilter;
      const matchesSearch =
        (apt.patientName && apt.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (apt.reason && apt.reason.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [appointmentFilter, searchTerm, appointments]);

  const patientAggregates = useMemo(() => {
    const map = new Map();
    appointments.forEach((apt) => {
      if (!apt.patientName) return;
      if (!map.has(apt.patientName)) {
        map.set(apt.patientName, {
          name: apt.patientName,
          visits: 0,
          lastVisit: apt.date,
        });
      }
      const entry = map.get(apt.patientName);
      entry.visits += 1;
      if (new Date(apt.date) > new Date(entry.lastVisit)) {
        entry.lastVisit = apt.date;
      }
      map.set(apt.patientName, entry);
    });
    return Array.from(map.values()).sort((a, b) => b.visits - a.visits);
  }, [appointments]);

  const specialities = useMemo(() => {
    return [...new Set(doctors.map(d => d.speciality))].sort();
  }, [doctors]);

  return (
    <div className="min-h-screen bg-navy-50">
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-teal-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Admin Control Center</h1>
            <p className="text-navy-200 max-w-xl">
              Monitor platform health, manage doctors and appointments, and keep a real‑time pulse
              on your virtual hospital.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-3">
              <p className="text-navy-200">Total doctors</p>
              <p className="text-xl font-semibold text-white">{stats.totalDoctors}</p>
            </div>
            <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-3">
              <p className="text-navy-200">Total patients</p>
              <p className="text-xl font-semibold text-white">{stats.uniquePatients}</p>
            </div>
            <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-3">
              <p className="text-navy-200">Appointments</p>
              <p className="text-xl font-semibold text-white">{stats.totalAppointments}</p>
            </div>
            <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-3">
              <p className="text-navy-200">Pending</p>
              <p className="text-xl font-semibold text-yellow-300">{stats.pendingAppointments}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-2 mb-6 border-b border-navy-200 pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 transition-all ${activeTab === 'overview'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white text-navy-700 hover:bg-navy-100'
              }`}
          >
            <Activity className="w-4 h-4" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('doctors')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 transition-all ${activeTab === 'doctors'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white text-navy-700 hover:bg-navy-100'
              }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Doctors</span>
          </button>
          <button
            onClick={() => setActiveTab('patients')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 transition-all ${activeTab === 'patients'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white text-navy-700 hover:bg-navy-100'
              }`}
          >
            <Users className="w-4 h-4" />
            <span>Patients</span>
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 transition-all ${activeTab === 'appointments'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white text-navy-700 hover:bg-navy-100'
              }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Appointments</span>
          </button>
          <button
            onClick={() => setActiveTab('pharmacy')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 transition-all ${activeTab === 'pharmacy'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white text-navy-700 hover:bg-navy-100'
              }`}
          >
            <Pill className="w-4 h-4" />
            <span>Pharmacy</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-3 items-center mb-6">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
            <input
              type="text"
              placeholder="Search by doctor, patient, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border-2 border-navy-200 focus:border-teal-500 focus:outline-none text-sm bg-white"
            />
          </div>

          {activeTab === 'doctors' && (
            <div className="flex items-center space-x-2 text-sm">
              <Filter className="w-4 h-4 text-navy-500" />
              <select
                value={doctorFilter}
                onChange={(e) => setDoctorFilter(e.target.value)}
                className="border-2 border-navy-200 rounded-lg px-3 py-2 text-sm bg-white focus:border-teal-500 focus:outline-none"
              >
                <option value="all">All specialities</option>
                {specialities.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="flex items-center space-x-2 text-sm">
              <Filter className="w-4 h-4 text-navy-500" />
              <select
                value={appointmentFilter}
                onChange={(e) => setAppointmentFilter(e.target.value)}
                className="border-2 border-navy-200 rounded-lg px-3 py-2 text-sm bg-white focus:border-teal-500 focus:outline-none"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="declined">Declined</option>
              </select>
            </div>
          )}
        </div>

        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 space-y-6">
              <div className="card">
                <h2 className="text-lg font-semibold text-navy-900 mb-3 flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-teal-600" />
                  <span>Platform health snapshot</span>
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-navy-500">Total doctors</p>
                    <p className="text-2xl font-bold text-navy-900">{stats.totalDoctors}</p>
                  </div>
                  <div>
                    <p className="text-navy-500">Active patients</p>
                    <p className="text-2xl font-bold text-navy-900">{stats.uniquePatients}</p>
                  </div>
                  <div>
                    <p className="text-navy-500">Completed consults</p>
                    <p className="text-2xl font-bold text-navy-900">
                      {stats.completedAppointments}
                    </p>
                  </div>
                  <div>
                    <p className="text-navy-500">Pending requests</p>
                    <p className="text-2xl font-bold text-yellow-500">
                      {stats.pendingAppointments}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-base font-semibold text-navy-900 mb-3">
                  Recent appointments
                </h3>
                <div className="overflow-x-auto text-sm">
                  <table className="min-w-full text-left">
                    <thead className="text-navy-500 text-xs uppercase border-b border-navy-100">
                      <tr>
                        <th className="py-2 pr-4">Patient</th>
                        <th className="py-2 pr-4">Reason</th>
                        <th className="py-2 pr-4">Date</th>
                        <th className="py-2 pr-4">Time</th>
                        <th className="py-2 pr-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.slice(0, 5).map((apt) => (
                        <tr key={apt.id} className="border-b border-navy-50">
                          <td className="py-2 pr-4 text-navy-800">{apt.patientName}</td>
                          <td className="py-2 pr-4 text-navy-600 truncate max-w-[180px]">
                            {apt.reason}
                          </td>
                          <td className="py-2 pr-4 text-navy-600">{apt.date}</td>
                          <td className="py-2 pr-4 text-navy-600">{apt.time}</td>
                          <td className="py-2 pr-4 text-xs">
                            <span
                              className={`badge capitalize ${apt.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : apt.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                                }`}
                            >
                              {apt.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card">
                <h3 className="text-base font-semibold text-navy-900 mb-3">
                  Top patients by visits
                </h3>
                <ul className="space-y-2 text-sm max-h-64 overflow-y-auto">
                  {patientAggregates.slice(0, 6).map((p) => (
                    <li
                      key={p.name}
                      className="flex items-center justify-between border border-navy-100 rounded-lg px-3 py-2 bg-navy-50"
                    >
                      <div>
                        <p className="font-semibold text-navy-900">{p.name}</p>
                        <p className="text-xs text-navy-600">Last visit: {p.lastVisit}</p>
                      </div>
                      <span className="text-xs font-semibold text-teal-700 bg-teal-100 rounded-full px-3 py-1">
                        {p.visits} visits
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <h3 className="text-base font-semibold text-navy-900 mb-3">Pharmacy snapshot</h3>
                <p className="text-sm text-navy-600 mb-2">
                  Total medicines configured:{' '}
                  <span className="font-semibold">{medicines.length}</span>
                </p>
                <ul className="text-xs text-navy-600 max-h-32 overflow-y-auto space-y-1">
                  {medicines.map((m) => (
                    <li key={m.id}>
                      {m.name} <span className="text-navy-400">({m.category})</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'doctors' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-navy-900">Doctors directory</h2>
              <p className="text-sm text-navy-600">{filteredDoctors.length} doctors</p>
            </div>
            <div className="overflow-x-auto text-sm">
              <table className="min-w-full text-left">
                <thead className="text-xs uppercase text-navy-500 border-b border-navy-100">
                  <tr>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Speciality</th>
                    <th className="py-2 pr-4">Experience</th>
                    <th className="py-2 pr-4">Consultations</th>
                    <th className="py-2 pr-4">Rating</th>
                    <th className="py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoctors.map((doc) => (
                    <tr key={doc.id} className="border-b border-navy-50">
                      <td className="py-2 pr-4 text-navy-900 font-semibold">{doc.name}</td>
                      <td className="py-2 pr-4 text-navy-700">{doc.speciality}</td>
                      <td className="py-2 pr-4 text-navy-700">{doc.experience} yrs</td>
                      <td className="py-2 pr-4 text-navy-700">{doc.consultations}</td>
                      <td className="py-2 pr-4 text-navy-700">{doc.rating}</td>
                      <td className="py-2 pr-4 text-xs">
                        <span
                          className={`badge ${doc.available
                            ? 'bg-green-100 text-green-800'
                            : 'bg-navy-100 text-navy-700'
                            }`}
                        >
                          {doc.available ? 'Active' : 'Offline'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'patients' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-navy-900">Patients overview</h2>
              <p className="text-sm text-navy-600">{patientAggregates.length} patients</p>
            </div>
            <div className="overflow-x-auto text-sm max-h-[420px]">
              <table className="min-w-full text-left">
                <thead className="text-xs uppercase text-navy-500 border-b border-navy-100">
                  <tr>
                    <th className="py-2 pr-4">Patient</th>
                    <th className="py-2 pr-4">Visits</th>
                    <th className="py-2 pr-4">Last visit</th>
                  </tr>
                </thead>
                <tbody>
                  {patientAggregates.map((p) => (
                    <tr key={p.name} className="border-b border-navy-50">
                      <td className="py-2 pr-4 text-navy-900 font-semibold">{p.name}</td>
                      <td className="py-2 pr-4 text-navy-700">{p.visits}</td>
                      <td className="py-2 pr-4 text-navy-700">{p.lastVisit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'appointments' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-navy-900">Appointments management</h2>
              <p className="text-sm text-navy-600">{filteredAppointments.length} records</p>
            </div>
            <div className="overflow-x-auto text-sm max-h-[420px]">
              <table className="min-w-full text-left">
                <thead className="text-xs uppercase text-navy-500 border-b border-navy-100">
                  <tr>
                    <th className="py-2 pr-4">Patient</th>
                    <th className="py-2 pr-4">Reason</th>
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Time</th>
                    <th className="py-2 pr-4">Type</th>
                    <th className="py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((apt) => (
                    <tr key={apt.id} className="border-b border-navy-50">
                      <td className="py-2 pr-4 text-navy-900 font-semibold">{apt.patientName}</td>
                      <td className="py-2 pr-4 text-navy-600 truncate max-w-[200px]">
                        {apt.reason}
                      </td>
                      <td className="py-2 pr-4 text-navy-700">{apt.date}</td>
                      <td className="py-2 pr-4 text-navy-700">{apt.time}</td>
                      <td className="py-2 pr-4 text-xs capitalize">
                        <span className="badge-info">{apt.type}</span>
                      </td>
                      <td className="py-2 pr-4 text-xs">
                        <span
                          className={`badge capitalize ${apt.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : apt.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                            }`}
                        >
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'pharmacy' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-navy-900">Pharmacy catalogue</h2>
              <p className="text-sm text-navy-600">{medicines.length} items</p>
            </div>
            <div className="overflow-x-auto text-sm max-h-[420px]">
              <table className="min-w-full text-left">
                <thead className="text-xs uppercase text-navy-500 border-b border-navy-100">
                  <tr>
                    <th className="py-2 pr-4">Medicine</th>
                    <th className="py-2 pr-4">Category</th>
                    <th className="py-2 pr-4">Price</th>
                    <th className="py-2 pr-4">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map((m) => (
                    <tr key={m.id} className="border-b border-navy-50">
                      <td className="py-2 pr-4 text-navy-900 font-semibold">{m.name}</td>
                      <td className="py-2 pr-4 text-navy-700">{m.category}</td>
                      <td className="py-2 pr-4 text-navy-700">${m.price}</td>
                      <td className="py-2 pr-4 text-navy-700">{m.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
