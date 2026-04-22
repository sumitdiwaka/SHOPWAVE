import { Link } from 'react-router-dom';
import { Store, Mail, Phone, MapPin,   } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Store className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Shop<span className="text-indigo-400">Wave</span></span>
            </div>
            <p className="text-sm leading-relaxed mb-4">India's trusted multi-vendor marketplace. Shop from thousands of verified sellers across all categories.</p>
            <div className="flex gap-3">
              {[ ].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-indigo-600 transition">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[['Home', '/'], ['Products', '/products'], ['Vendors', '/vendors'], ['Become a Seller', '/vendor/register']].map(([label, path]) => (
                <li key={label}><Link to={path} className="hover:text-indigo-400 transition">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Customer */}
          <div>
            <h4 className="text-white font-semibold mb-4">Customer</h4>
            <ul className="space-y-2 text-sm">
              {[['My Account', '/account'], ['My Orders', '/account/orders'], ['Wishlist', '/account/wishlist'], ['Track Order', '/account/orders']].map(([label, path]) => (
                <li key={label}><Link to={path} className="hover:text-indigo-400 transition">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-indigo-400 shrink-0" /> support@shopwave.in</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-indigo-400 shrink-0" /> +91 98765 43210</li>
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" /> 123 MG Road, Bengaluru, Karnataka 560001</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} ShopWave. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span className="flex items-center gap-1">
              Powered by <span className="text-indigo-400 font-medium ml-1">Razorpay</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
