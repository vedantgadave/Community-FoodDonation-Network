import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { UserRole } from '../../types';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { HeartHandshake, Mail, Lock, User, Phone, MapPin, Building, ShieldCheck } from 'lucide-react';
import { FoodSafetyBanner } from '../../components/common/FoodSafetyBanner';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>('DONOR');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [orgName, setOrgName] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [safetyAgreed, setSafetyAgreed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !location || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!safetyAgreed) {
      setError('You must acknowledge the Food Safety & Hygiene Agreement.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const profile = await register(
        email,
        password,
        name,
        phone,
        role,
        role === 'NGO' ? (orgName || name) : orgName,
        location
      );

      showToast(`Account created successfully as ${role}!`, 'success');

      if (profile.role === 'DONOR') navigate('/donor/dashboard');
      else if (profile.role === 'NGO') navigate('/ngo/dashboard');
      else navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      showToast(err.message || 'Registration error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-emerald-600 text-white rounded-2xl shadow-md">
            <HeartHandshake className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            Create Your Account
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Join the Food Donation Network as a Donor or Partner NGO
          </p>
        </div>

        {/* Role Switcher Selector */}
        <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setRole('DONOR')}
            className={`py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
              role === 'DONOR'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" /> Donor / Event Caterer
          </button>
          <button
            type="button"
            onClick={() => setRole('NGO')}
            className={`py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
              role === 'NGO'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Building className="w-4 h-4" /> Partner NGO / Shelter
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={role === 'NGO' ? 'Representative Name' : 'Full Name'}
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<User className="w-4 h-4 text-slate-400" />}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="name@organization.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
              required
            />

            <Input
              label={role === 'NGO' ? 'NGO / Organization Name *' : 'Company / Venue Name (Optional)'}
              placeholder={role === 'NGO' ? 'e.g. City Food Rescue' : 'e.g. Horizon Banquets'}
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              leftIcon={<Building className="w-4 h-4 text-slate-400" />}
              required={role === 'NGO'}
            />
          </div>

          <Input
            label="Primary Address / Location Hub"
            placeholder="City, Street address or Region"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              required
            />
          </div>

          {/* Safety Pledge */}
          <FoodSafetyBanner compact />

          <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <input
              type="checkbox"
              id="safetyAgreed"
              checked={safetyAgreed}
              onChange={(e) => setSafetyAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <label htmlFor="safetyAgreed" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              I confirm that all food donated through this platform will be handled safely, hygienic standards observed, and applicable transport safety guidelines followed.
            </label>
          </div>

          {error && (
            <p className="text-xs text-rose-500 font-medium p-2.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800">
              ⚠️ {error}
            </p>
          )}

          <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
            Create Account as {role}
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-emerald-600 hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
