import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HeartHandshake, 
  Utensils, 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Search,
  Package,
  Heart,
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { FoodSafetyBanner } from '../../components/common/FoodSafetyBanner';
import { useAuth } from '../../context/AuthContext';

export const HomePage: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-16 pb-16 bg-slate-50 dark:bg-slate-950">
      
      {/* HERO SECTION MATCHING SCREENSHOT */}
      <section className="bg-[#133e2b] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Column Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold tracking-wider uppercase text-emerald-100 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ZERO FOOD WASTE MOVEMENT
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
              SAVE FOOD.<br />
              SHARE FOOD.<br />
              <span className="text-[#ea7a63]">SERVE LIVES.</span>
            </h1>

            <p className="text-base sm:text-lg text-emerald-100/90 max-w-xl font-medium leading-relaxed">
              Turn surplus food into meaningful community impact by connecting donors with organizations ready to distribute it.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to={userProfile?.role === 'DONOR' ? '/donor/donate' : '/register'}>
                <button className="bg-[#ea7a63] hover:bg-[#d96952] text-white font-extrabold px-8 py-4 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center gap-2.5 text-base">
                  <Package className="w-5 h-5" /> Donate Food Now
                </button>
              </Link>

              <Link to="/ngo/donations">
                <button className="border-2 border-white/40 hover:border-white text-white font-bold px-8 py-4 rounded-full transition-all hover:bg-white/10 flex items-center gap-2.5 text-base backdrop-blur-sm">
                  <Search className="w-5 h-5" /> Find Food Donations
                </button>
              </Link>
            </div>
          </div>

          {/* Right Hero Card Container matching screenshot */}
          <div className="lg:col-span-5">
            <div className="bg-[#1b4a35]/90 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-emerald-600/40 shadow-2xl space-y-6">
              <div>
                <h3 className="text-2xl font-extrabold text-white tracking-tight uppercase">
                  HAVE SURPLUS FOOD?
                </h3>
                <p className="text-xs text-emerald-100/80 mt-2 leading-relaxed">
                  Register in 60 seconds, upload a photo verified via Cloudinary, and alert local relief NGOs instantly.
                </p>
              </div>

              {/* Feature Box Card */}
              <div className="bg-white text-slate-900 p-4 rounded-2xl flex items-center gap-3.5 shadow-xl">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-full shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Real-Time NGO Matching</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Atomic acceptance prevents duplicate claims
                  </p>
                </div>
              </div>

              <Link to={userProfile ? (userProfile.role === 'DONOR' ? '/donor/donate' : '/ngo/donations') : '/register'} className="block">
                <button className="w-full bg-[#133e2b] hover:bg-[#0c291c] text-white font-extrabold py-4 px-6 rounded-2xl shadow-lg border border-emerald-500/30 transition-all hover:border-emerald-400 text-center text-sm">
                  Post Surplus Donation Entry
                </button>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* PROBLEM STATEMENT & MISSION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                The Challenge & Purpose
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                Tackling Food Waste with Structured Local Coordination
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Tons of high-quality, freshly catered food from corporate banquets, weddings, and institutional events go unconsumed daily while local shelters and community centers face shortages.
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Our platform provides a seamless digital workflow ensuring surplus meals move from donors to NGOs before expiration, governed by transparent pickup deadlines and single-NGO atomic reservation.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/40">
                <Utensils className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-3" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Surplus Rescue</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Connecting event caterers directly to verified community distribution points.
                </p>
              </div>

              <div className="bg-teal-50 dark:bg-teal-950/40 p-6 rounded-2xl border border-teal-100 dark:border-teal-800/40">
                <Building2 className="w-8 h-8 text-teal-600 dark:text-teal-400 mb-3" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Verified NGOs</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Authorized organizations ready to collect and serve local families.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS LIFECYCLE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Workflow Architecture
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            How The Donation Lifecycle Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">1. Donor Posts Surplus</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Donor specifies quantity, prepared time, pickup deadline, location, food type (Veg/Non-Veg), and food safety confirmation.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center justify-center mb-4">
              2
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">2. NGO Atomic Claim</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              NGO accepts donation via Firestore transaction. Single-NGO lock guarantees no duplicate claims can occur.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center justify-center mb-4">
              3
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">3. Scheduled Pickup</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Assigned NGO collects food at specified address before deadline and updates status to <strong>PICKED UP</strong>.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center justify-center mb-4">
              4
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">4. Community Serving</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Food is distributed to beneficiary communities and marked as <strong>COMPLETED</strong> in the network ledger.
            </p>
          </div>
        </div>
      </section>

      {/* FOOD SAFETY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FoodSafetyBanner />
      </section>

      {/* ROLE HIGHLIGHT CTA CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-[#133e2b] to-slate-900 text-white rounded-3xl p-8 shadow-xl border border-emerald-700/50 flex flex-col justify-between space-y-6">
          <div>
            <div className="p-3 bg-emerald-500/20 w-fit rounded-2xl border border-emerald-400/30 mb-4">
              <Utensils className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-extrabold">For Event Organizers & Donors</h3>
            <p className="text-sm text-emerald-100/90 mt-2 leading-relaxed">
              Turn unavoidable event surplus into positive social impact. Post food listings with photos, location, and clear pickup windows in under 2 minutes.
            </p>
          </div>
          <Link to="/register">
            <button className="bg-[#ea7a63] hover:bg-[#d96952] text-white font-bold px-6 py-3 rounded-xl transition-transform hover:scale-105">
              Register as Food Donor
            </button>
          </Link>
        </div>

        <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white rounded-3xl p-8 shadow-xl border border-teal-700/50 flex flex-col justify-between space-y-6">
          <div>
            <div className="p-3 bg-teal-500/20 w-fit rounded-2xl border border-teal-400/30 mb-4">
              <Building2 className="w-8 h-8 text-teal-400" />
            </div>
            <h3 className="text-2xl font-extrabold">For NGOs & Relief Organizations</h3>
            <p className="text-sm text-teal-100/90 mt-2 leading-relaxed">
              Access real-time feeds of available catered food in your area. Secure reservations instantly with atomic single-NGO acceptance.
            </p>
          </div>
          <Link to="/register">
            <button className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-xl transition-transform hover:scale-105">
              Register as Partner NGO
            </button>
          </Link>
        </div>
      </section>

    </div>
  );
};
