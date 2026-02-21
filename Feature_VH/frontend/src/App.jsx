import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import useAuthStore from './store/authStore';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Signup from './components/auth/Signup';

// Patient Components
import PatientOverview from './components/patient/PatientOverview';
import FindDoctors from './components/patient/FindDoctors';

// Doctor Components
import DoctorDashboard from './components/doctor/DoctorDashboard';

// Consultation Component
import ConsultationRoom from './components/consultation/ConsultationRoom';

// Shared Components
import Navbar from './components/shared/Navbar';
import Home from './components/home/Home';
import AdminDashboard from './components/admin/AdminDashboard';

function App() {
  const { isAuthenticated, userRole } = useAuthStore();

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow pt-16">
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />

              <Route
                path="/login"
                element={!isAuthenticated ? <Login /> : <Navigate to={`/${userRole}`} />}
              />
              <Route
                path="/signup"
                element={!isAuthenticated ? <Signup /> : <Navigate to={`/${userRole}`} />}
              />
              <Route
                path="/register"
                element={!isAuthenticated ? <Register /> : <Navigate to={`/${userRole}`} />}
              />

              {/* Protected Routes */}
              <Route
                path="/patient"
                element={
                  isAuthenticated && userRole === 'patient'
                    ? <PatientOverview />
                    : <Navigate to="/login" />
                }
              />
              <Route
                path="/patient/find-doctors"
                element={
                  isAuthenticated && userRole === 'patient'
                    ? <FindDoctors />
                    : <Navigate to="/login" />
                }
              />
              <Route
                path="/doctor"
                element={
                  isAuthenticated && userRole === 'doctor'
                    ? <DoctorDashboard />
                    : <Navigate to="/login" />
                }
              />

              <Route
                path="/consultation/:appointmentId"
                element={isAuthenticated ? <ConsultationRoom /> : <Navigate to="/login" />}
              />

              <Route
                path="/admin"
                element={
                  isAuthenticated && userRole === 'admin'
                    ? <AdminDashboard />
                    : <Navigate to="/login" />
                }
              />
              <Route path="/Admin" element={<Navigate to="/admin" />} />

              {/* Default Route */}
              <Route
                path="*"
                element={
                  isAuthenticated
                    ? <Navigate to={`/${userRole}`} />
                    : <Navigate to="/login" />
                }
              />
            </Routes>
          </AnimatePresence>
        </div>
      </div>
    </Router>
  );
}

export default App;
