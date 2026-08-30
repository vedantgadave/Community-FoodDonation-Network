import React from 'react';
import { HeartHandshake, ShieldCheck, Github, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 text-white">
              <div className="p-1.5 bg-emerald-600 rounded-lg">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-base tracking-tight">FoodDonation Network</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Connecting surplus food donors with registered NGOs to prevent edible food waste and serve communities in need.
            </p>
            <p className="text-xs font-mono font-bold text-emerald-400">
              “Save Food. Share Food. Serve Lives.”
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/" className="hover:text-emerald-400 transition-colors">Home Page</Link></li>
              <li><Link to="/about" className="hover:text-emerald-400 transition-colors">About Our Platform</Link></li>
              <li><Link to="/register" className="hover:text-emerald-400 transition-colors">Register as Donor / NGO</Link></li>
              <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Account Login</Link></li>
            </ul>
          </div>

          {/* Food Safety Policy */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Food Safety Pledge
            </h4>
            <p className="text-xs leading-relaxed text-slate-400">
              Only fresh, safe, and hygienically handled food should be donated. Donors and NGOs must strictly observe applicable food handling and transportation guidelines.
            </p>
          </div>

          {/* Standards & Transparency */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Architecture</h4>
            <p className="text-xs text-slate-400">
              Built with React 18, TypeScript, Tailwind CSS, Cloud Firestore Atomic Transactions, and Cloudinary.
            </p>
          </div>

        </div>

        <div className="pt-8 mt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Community Food Donation Network. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for community impact
          </p>
        </div>
      </div>
    </footer>
  );
};
