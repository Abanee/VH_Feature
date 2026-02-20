import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Mail, Lock, User, Phone } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const Signup = () => {
  const navigate = useNavigate();
  const signup = useAuthStore((state) => state.signup);
  const login = useAuthStore((state) => state.login);
  const error = useAuthStore((state) => state.error);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirmPassword: '',
    role: 'patient'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    const userData = {
      username: formData.username,
      email: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
      password: formData.password,
      role: formData.role
    };

    const success = await signup(userData);
    if (success) {
      // Auto login after signup
      await login(formData.username, formData.password);
      navigate(`/${formData.role}`);
    } else {
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 via-navy-800 to-teal-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-premium-lg"
      >
        {/* Logo & Title */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center"
          >
            <div className="bg-teal-600 p-4 rounded-2xl">
              <Heart className="w-12 h-12 text-white" fill="white" />
            </div>
          </motion.div>
          <h2 className="mt-6 text-3xl font-bold text-navy-900">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-navy-600">
            Join our healthcare platform today
          </p>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        {/* Role Selection */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'patient' })}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${formData.role === 'patient'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-navy-100 text-navy-600 hover:bg-navy-200'
              }`}
          >
            <User className="w-5 h-5 mx-auto mb-1" />
            Patient
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'doctor' })}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${formData.role === 'doctor'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-navy-100 text-navy-600 hover:bg-navy-200'
              }`}
          >
            <Heart className="w-5 h-5 mx-auto mb-1" />
            Doctor
          </button>
        </div>

        {/* Registration Form */}
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-navy-700 mb-2">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-navy-400" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="input-field pl-10"
                placeholder="johndoe"
              />
            </div>
          </div>

          {/* First Name */}
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-navy-700 mb-2">
              First Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-navy-400" />
              </div>
              <input
                id="first_name"
                name="first_name"
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="input-field pl-10"
                placeholder="John"
              />
            </div>
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-navy-700 mb-2">
              Last Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-navy-400" />
              </div>
              <input
                id="last_name"
                name="last_name"
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="input-field pl-10"
                placeholder="Doe"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-navy-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-navy-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field pl-10"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-navy-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-navy-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-field pl-10"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-navy-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-navy-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="input-field pl-10"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn-primary w-full mt-6">
            Create Account
          </button>

          {/* Login Link */}
          <p className="text-center text-sm text-navy-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-teal-600 hover:text-teal-500">
              Sign in here
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Signup;
