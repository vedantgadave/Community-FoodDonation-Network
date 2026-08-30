import React from 'react';
import { ShieldCheck, HeartHandshake, Utensils, CheckCircle } from 'lucide-react';
import { FoodSafetyBanner } from '../../components/common/FoodSafetyBanner';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100">
          About Community Food Donation Network
        </h1>
        <p className="text-sm font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
          “Save Food. Share Food. Serve Lives.”
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
          Our Core Mission
        </h2>
        <p>
          The Community Food Donation Network is a dedicated platform designed to eliminate food waste by connecting event caterers, hotels, institutions, and individual donors directly with verified Non-Governmental Organizations (NGOs).
        </p>
        <p>
          Instead of letting safe, high-quality surplus meals be discarded after banquets or corporate events, our platform enables donors to publish immediate donation listings. Partner NGOs can quickly browse, filter by location and quantity, and claim available donations for prompt collection and community distribution.
        </p>

        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 pt-4">
          Architectural Guarantees
        </h2>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Single-NGO Atomic Acceptance:</strong> Built using Firebase Firestore atomic transactions, guaranteeing that no two NGOs can ever successfully claim the same food listing simultaneously.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Strict Lifecycle Enforcement:</strong> State transitions move securely from <em>AVAILABLE</em> → <em>ACCEPTED</em> → <em>PICKED UP</em> → <em>COMPLETED</em>, protected by server-side Firestore security rules.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Cloudinary Image Media:</strong> Unsigned, client-validated photo uploads ensure clear visual confirmation of donated meals.
            </span>
          </li>
        </ul>
      </div>

      <FoodSafetyBanner />
    </div>
  );
};
