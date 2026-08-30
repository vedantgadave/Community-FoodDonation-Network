import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { HeartHandshake, Lock, Mail, Sparkles } from 'lucide-react';
import { isDemoMode } from '../../services/firebase';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const profile = await login(email, password);
      showToast(`Welcome back, ${profile.name}!`, 'success');

      const from = (location.state as any)?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
        return;
      }

      if (profile.role === 'DONOR') navigate('/donor/dashboard');
      else if (profile.role === 'NGO') navigate('/ngo/dashboard');
      else if (profile.role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Demo shortcut helper
  const handleQuickDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl">
        
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-emerald-600 text-white rounded-2xl shadow-md">
            <HeartHandshake className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            Sign In to FoodDonation
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Access your donor, NGO, or admin dashboard
          </p>
        </div>

        {isDemoMode && (
          <div className="bg-amber-50 dark:bg-amber-950/40 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-800/60 text-xs">
            <p className="font-bold text-amber-900 dark:text-amber-300 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Demo Quick Logins:
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('donor@communityfood.org')}
                className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg border border-amber-300 dark:border-amber-700 font-semibold text-amber-900 dark:text-amber-200 hover:bg-amber-100"
              >
                Donor Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('ngo@communityfood.org')}
                className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg border border-amber-300 dark:border-amber-700 font-semibold text-amber-900 dark:text-amber-200 hover:bg-amber-100"
              >
                NGO Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin@communityfood.org')}
                className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg border border-amber-300 dark:border-amber-700 font-semibold text-amber-900 dark:text-amber-200 hover:bg-amber-100"
              >
                Admin Demo
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
            required
          />

          {error && (
            <p className="text-xs text-rose-500 font-medium p-2.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800">
              ⚠️ {error}
            </p>
          )}

          <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
            Sign In
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-800">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-emerald-600 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
