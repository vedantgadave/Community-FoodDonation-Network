import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  HeartHandshake, 
  PlusCircle, 
  LayoutDashboard, 
  Search, 
  Users, 
  LogOut, 
  Menu, 
  X, 
  User, 
  ShieldAlert,
  Info
} from 'lucide-react';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand Title */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-xl shadow-md group-hover:scale-105 transition-transform duration-200">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-emerald-950 dark:from-white dark:to-emerald-400 bg-clip-text text-transparent block">
                FoodDonation
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-600 dark:text-emerald-400 font-semibold block -mt-1">
                Save Food. Share Food.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive('/') ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Home
            </Link>

            <Link
              to="/about"
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/about') ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Info className="w-4 h-4" /> About
            </Link>

            {/* DONOR Nav items */}
            {userProfile?.role === 'DONOR' && (
              <>
                <Link
                  to="/donor/dashboard"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/donor/dashboard') ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>

                <Link
                  to="/donor/donate"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-100/60 dark:bg-emerald-950/80 hover:bg-emerald-200/60`}
                >
                  <PlusCircle className="w-4 h-4" /> Donate Food
                </Link>

                <Link
                  to="/donor/donations"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/donor/donations') ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  My Donations
                </Link>
              </>
            )}

            {/* NGO Nav items */}
            {userProfile?.role === 'NGO' && (
              <>
                <Link
                  to="/ngo/dashboard"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/ngo/dashboard') ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" /> NGO Dashboard
                </Link>

                <Link
                  to="/ngo/donations"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/ngo/donations') ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Search className="w-4 h-4" /> Find Food
                </Link>

                <Link
                  to="/ngo/my-donations"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/ngo/my-donations') ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Accepted Pickups
                </Link>
              </>
            )}

            {/* ADMIN Nav items */}
            {userProfile?.role === 'ADMIN' && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/admin/dashboard') ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" /> Admin Console
                </Link>

                <Link
                  to="/admin/users"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/admin/users') ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Users className="w-4 h-4" /> Users
                </Link>

                <Link
                  to="/admin/donations"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/admin/donations') ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  All Donations
                </Link>
              </>
            )}
          </nav>

          {/* User Auth Buttons / Profile Menu */}
          <div className="hidden md:flex items-center gap-3">
            {userProfile ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
                <Link
                  to={userProfile.role === 'DONOR' ? '/donor/profile' : userProfile.role === 'NGO' ? '/ngo/profile' : '/admin/dashboard'}
                  className="flex items-center gap-2 group p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                    {userProfile.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                      {userProfile.name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {userProfile.role}
                    </p>
                  </div>
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  leftIcon={<LogOut className="w-4 h-4" />}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Register NGO / Donor
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-6 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            Home
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            About Network
          </Link>

          {userProfile?.role === 'DONOR' && (
            <>
              <Link
                to="/donor/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                Donor Dashboard
              </Link>
              <Link
                to="/donor/donate"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60"
              >
                + Donate Food
              </Link>
              <Link
                to="/donor/donations"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                My Donations
              </Link>
            </>
          )}

          {userProfile?.role === 'NGO' && (
            <>
              <Link
                to="/ngo/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                NGO Dashboard
              </Link>
              <Link
                to="/ngo/donations"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                Browse Food
              </Link>
              <Link
                to="/ngo/my-donations"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                Accepted Pickups
              </Link>
            </>
          )}

          {userProfile?.role === 'ADMIN' && (
            <>
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-purple-600"
              >
                Admin Dashboard
              </Link>
              <Link
                to="/admin/users"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                User Moderation
              </Link>
            </>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            {userProfile ? (
              <div className="space-y-2">
                <div className="px-3 py-2 text-xs font-bold text-slate-500">
                  Signed in as {userProfile.name} ({userProfile.role})
                </div>
                <Button variant="danger" size="sm" className="w-full" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
