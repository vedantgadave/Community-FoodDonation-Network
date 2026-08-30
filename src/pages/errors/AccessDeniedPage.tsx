import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export const AccessDeniedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl space-y-4">
        <div className="p-4 bg-rose-100 text-rose-600 rounded-full w-fit mx-auto">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          Access Restricted
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          You do not have permission to access this page or administrative operation.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button variant="primary" onClick={() => navigate('/')}>
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
};
