import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HeartPulse,
  ShieldCheck,
  Users,
  Stethoscope,
  Clock,
  PhoneCall,
  Pill,
  Video,
} from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-navy-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-navy-900 via-navy-800 to-teal-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="inline-flex items-center px-3 py-1 rounded-full bg-teal-500/10 border border-teal-400/40 text-sm font-medium mb-4">
              <HeartPulse className="w-4 h-4 mr-2" />
              Premium Virtual Hospital & Pharmacy
            </p>

            {/* 2-line short, crisp intro */}
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              World‑class healthcare,
              <span className="block text-teal-300">accessible from anywhere.</span>
            </h1>
            <p className="text-navy-200 text-lg max-w-xl">
              Consult top specialists, manage prescriptions, and track your health journey
              through a single, trusted digital hospital experience.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/login"
                className="btn-primary inline-flex items-center justify-center"
              >
                <Video className="w-5 h-5 mr-2" />
                Book a Virtual Consultation
              </Link>
              <a
                href="#services"
                className="btn-outline inline-flex items-center justify-center"
              >
                <Stethoscope className="w-5 h-5 mr-2" />
                Explore Our Services
              </a>
            </div>

            {/* Trust badges */}
            <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-navy-100">
              <div>
                <p className="font-semibold text-white text-lg">120K+</p>
                <p>Consultations completed</p>
              </div>
              <div>
                <p className="font-semibold text-white text-lg">150+</p>
                <p>Board‑certified doctors</p>
              </div>
              <div>
                <p className="font-semibold text-white text-lg">4.9/5</p>
                <p>Average patient rating</p>
              </div>
            </div>
          </motion.div>

          {/* Right: Highlight Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 lg:p-8 shadow-premium-lg"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2 text-teal-300" />
              End‑to‑end secure care
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-start space-x-3">
                <Clock className="w-4 h-4 text-teal-300 mt-1" />
                <div>
                  <p className="font-semibold text-white">24/7 virtual consultations</p>
                  <p className="text-navy-200">
                    Access specialists around the clock without waiting rooms or travel.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Pill className="w-4 h-4 text-teal-300 mt-1" />
                <div>
                  <p className="font-semibold text-white">Integrated digital pharmacy</p>
                  <p className="text-navy-200">
                    Receive prescriptions instantly and manage medicines in one place.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Users className="w-4 h-4 text-teal-300 mt-1" />
                <div>
                  <p className="font-semibold text-white">Personalized care history</p>
                  <p className="text-navy-200">
                    Securely store visits, reports, and medications for continuity of care.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-black/30 border border-white/10 text-sm">
              <p className="flex items-center">
                <PhoneCall className="w-4 h-4 mr-2 text-teal-300" />
                Emergency triage support and fast doctor routing during critical cases.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-navy-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl font-bold text-navy-900 mb-3">Everything you need in one virtual hospital</h2>
            <p className="text-navy-600">
              A single, seamless platform that connects consultations, prescriptions, and your
              longitudinal health record.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Stethoscope,
                title: 'Specialist consultations',
                desc: 'Access cardiologists, pediatricians, neurologists, dermatologists, and more.',
              },
              {
                icon: Video,
                title: 'HD virtual visits',
                desc: 'Secure, high‑quality video calls optimized for low bandwidth networks.',
              },
              {
                icon: Pill,
                title: 'Smart prescriptions',
                desc: 'Instant digital prescriptions with integrated pharmacy recommendations.',
              },
              {
                icon: ShieldCheck,
                title: 'Hospital‑grade security',
                desc: 'Encryption, audit trails, and strict access controls for your data.',
              },
            ].map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: idx * 0.05 }}
                className="card h-full"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-teal-700" />
                </div>
                <h3 className="text-lg font-semibold text-navy-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-navy-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-white border-t border-navy-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-3xl font-bold text-navy-900 mb-3">Services designed for continuous care</h2>
              <p className="text-navy-600 mb-6">
                From first consult to follow‑up and medication adherence, the platform is
                engineered to support every step of your health journey.
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-teal-600" />
                  <p className="text-navy-700">
                    Virtual OPD clinics, follow‑up reviews, and second opinions with senior specialists.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-teal-600" />
                  <p className="text-navy-700">
                    Digital prescriptions synchronized with your patient dashboard for easy re‑ordering.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-teal-600" />
                  <p className="text-navy-700">
                    Integrated pharmacy view for dosage guidance, interactions, and refill reminders.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="card">
                <p className="text-xs font-semibold text-teal-600 uppercase mb-1">Virtual care</p>
                <h3 className="text-lg font-semibold text-navy-900 mb-2">On‑demand consultations</h3>
                <p className="text-sm text-navy-600 mb-4">
                  Smart triage and time‑slot booking with reminders and structured visit notes.
                </p>
              </div>
              <div className="card">
                <p className="text-xs font-semibold text-teal-600 uppercase mb-1">Pharmacy</p>
                <h3 className="text-lg font-semibold text-navy-900 mb-2">Medication management</h3>
                <p className="text-sm text-navy-600 mb-4">
                  Curated medication lists, prescription history, and adherence support tools.
                </p>
              </div>
              <div className="card">
                <p className="text-xs font-semibold text-teal-600 uppercase mb-1">Records</p>
                <h3 className="text-lg font-semibold text-navy-900 mb-2">Unified health record</h3>
                <p className="text-sm text-navy-600 mb-4">
                  Visit history, lab summaries, and clinical notes organized chronologically.
                </p>
              </div>
              <div className="card">
                <p className="text-xs font-semibold text-teal-600 uppercase mb-1">In‑person</p>
                <h3 className="text-lg font-semibold text-navy-900 mb-2">Real‑world visits</h3>
                <p className="text-sm text-navy-600 mb-4">
                  Schedule in‑person appointments directly from the same dashboard when needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Trust Us Section */}
      <section id="trust" className="py-16 bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-bold mb-3">Why patients and doctors trust this platform</h2>
              <p className="text-navy-200 mb-6">
                Built with clinical workflows, safety, and reliability at its core—so every consult
                feels like a visit to a top‑tier hospital.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start space-x-3">
                  <ShieldCheck className="w-5 h-5 text-teal-300 mt-0.5" />
                  <p>
                    End‑to‑end encryption, strict authentication, and role‑based access for all users.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-teal-300 mt-0.5" />
                  <p>
                    Curated network of licensed, board‑certified specialists across key disciplines.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-teal-300 mt-0.5" />
                  <p>
                    Reliable uptime and performance tuned for both metro and low‑bandwidth regions.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <HeartPulse className="w-5 h-5 text-teal-300 mt-0.5" />
                  <p>
                    Patient‑centric design focused on clarity, safety, and ease of follow‑up.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-sm text-navy-100 mb-4">
                “The virtual hospital experience feels like walking into a premium clinic—only now
                it lives securely on your screen.”
              </p>
              <p className="text-sm font-semibold text-white">Clinical UX Design Principle</p>
              <p className="text-xs text-navy-300">Virtual Care Design Playbook</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/login" className="btn-primary">
              Get Started as Patient
            </Link>
            <Link to="/login" className="btn-secondary">
              Join as Doctor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
