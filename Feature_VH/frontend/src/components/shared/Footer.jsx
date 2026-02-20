import { Heart, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-navy-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-teal-600 p-2 rounded-lg">
                <Heart className="w-6 h-6 text-white" fill="white" />
              </div>
              <span className="text-xl font-bold">Virtual Hospital</span>
            </div>
            <p className="text-navy-300">
              Premium healthcare services at your fingertips. 
              Connecting patients with top doctors virtually.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-navy-300 hover:text-teal-400 transition-colors">About Us</a></li>
              <li><a href="#" className="text-navy-300 hover:text-teal-400 transition-colors">Our Doctors</a></li>
              <li><a href="#" className="text-navy-300 hover:text-teal-400 transition-colors">Services</a></li>
              <li><a href="#" className="text-navy-300 hover:text-teal-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-teal-400" />
                <span className="text-navy-300">+91 1800-123-4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-teal-400" />
                <span className="text-navy-300">support@virtualhospital.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-teal-400" />
                <span className="text-navy-300">Mumbai, Maharashtra, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-navy-700 mt-8 pt-8 text-center text-navy-400">
          <p>&copy; 2026 Virtual Hospital. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
