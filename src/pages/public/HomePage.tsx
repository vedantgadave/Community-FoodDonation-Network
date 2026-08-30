import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartHandshake, 
  Utensils, 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle, 
  Sparkles,
  Truck,
  Heart,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { FoodSafetyBanner } from '../../components/common/FoodSafetyBanner';
import { useAuth } from '../../context/AuthContext';

export const HomePage: React.FC = () => {
  const { userProfile } = useAuth();

  return (
    <div className="space-y-16 pb-16">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white py-20 px-4 sm:px-6 lg:px-8 rounded-b-3xl shadow-2xl border-b border-emerald-800/40">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Social Impact Surplus Food Network
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            “Save Food. Share Food. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
              Serve Lives.”
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            Bridging the gap between event organizers with edible surplus food and registered NGOs capable of rapid collection and community distribution.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {userProfile?.role === 'DONOR' ? (
              <Link to="/donor/donate">
                <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Donate Food Now
                </Button>
              </Link>
            ) : userProfile?.role === 'NGO' ? (
              <Link to="/ngo/donations">
                <Button size="lg" variant="secondary" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Browse Available Food
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
                    Join as Donor / NGO
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="border-slate-700 text-white hover:bg-slate-800">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
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
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">1. Donor Posts Surplus</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Donor specifies quantity, prepared time, pickup deadline, location, food type (Veg/Non-Veg), and food safety confirmation.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center justify-center mb-4">
              2
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">2. NGO Atomic Claim</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              NGO accepts donation via Firestore transaction. Single-NGO lock guarantees no duplicate claims can occur.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center justify-center mb-4">
              3
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">3. Scheduled Pickup</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Assigned NGO collects food at specified address before deadline and updates status to <strong>PICKED UP</strong>.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
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
        <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-3xl p-8 shadow-xl border border-emerald-700/50 flex flex-col justify-between space-y-6">
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
            <Button variant="primary" size="md">
              Register as Food Donor
            </Button>
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
            <Button variant="secondary" size="md">
              Register as Partner NGO
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
};
