import React, { useState, useRef, useEffect } from 'react';
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
  Info,
  ChevronDown
} from 'lucide-react';
import { Button } from '../ui/Button';
import { RoleSwitcher } from '../common/RoleSwitcher';

export const Navbar: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                  aria-expanded={profileDropdownOpen}
                >
                  <div className={`w-8 h-8 rounded-full text-white font-bold flex items-center justify-center text-xs shadow-sm ${
                    userProfile.role === 'DONOR' ? 'bg-emerald-600' : userProfile.role === 'NGO' ? 'bg-teal-600' : 'bg-purple-600'
                  }`}>
                    {userProfile.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1 max-w-[120px]">
                      {userProfile.name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {userProfile.role}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Profile & Role Switcher Dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 space-y-3 animate-in fade-in zoom-in-95 duration-150 z-50">
                    <div className="px-2 py-1 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{userProfile.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{userProfile.email}</p>
                    </div>

                    {/* Integrated Role Switcher */}
                    {userProfile.role !== 'ADMIN' && (
                      <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                        <RoleSwitcher onClose={() => setProfileDropdownOpen(false)} />
                      </div>
                    )}

                    {/* Navigation links inside menu */}
                    <div className="space-y-1 text-xs font-medium">
                      <Link
                        to={userProfile.role === 'DONOR' ? '/donor/profile' : userProfile.role === 'NGO' ? '/ngo/profile' : '/admin/dashboard'}
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        Account & Profile
                      </Link>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={handleLogout}
                        leftIcon={<LogOut className="w-3.5 h-3.5 text-rose-500" />}
                      >
                        Logout
                      </Button>
                    </div>
                  </div>
                )}
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
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-6 space-y-3">
          
          {/* Mobile Role Switcher for Authenticated Users */}
          {userProfile && userProfile.role !== 'ADMIN' && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <RoleSwitcher onClose={() => setMobileMenuOpen(false)} />
            </div>
          )}

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
              <Link
                to="/donor/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                My Profile
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
              <Link
                to="/ngo/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                NGO Profile
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
                <div className="px-3 py-1 text-xs font-bold text-slate-500">
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
