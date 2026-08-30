import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl space-y-4">
        <div className="p-4 bg-slate-100 text-slate-600 rounded-full w-fit mx-auto">
          <HelpCircle className="w-12 h-12" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          Page Not Found (404)
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          The requested URL path does not exist on the Community Food Donation Network.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Button variant="primary" onClick={() => navigate('/')}>
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
};
