import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Public Pages
import { HomePage } from '../pages/public/HomePage';
import { AboutPage } from '../pages/public/AboutPage';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';

// Donor Pages
import { DonorDashboardPage } from '../pages/donor/DonorDashboardPage';
import { CreateDonationPage } from '../pages/donor/CreateDonationPage';
import { DonorDonationsPage } from '../pages/donor/DonorDonationsPage';
import { DonorProfilePage } from '../pages/donor/DonorProfilePage';

// NGO Pages
import { NgoDashboardPage } from '../pages/ngo/NgoDashboardPage';
import { AvailableDonationsPage } from '../pages/ngo/AvailableDonationsPage';
import { DonationDetailsPage } from '../pages/ngo/DonationDetailsPage';
import { NgoMyDonationsPage } from '../pages/ngo/NgoMyDonationsPage';
import { NgoProfilePage } from '../pages/ngo/NgoProfilePage';

// Admin Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminDonationsPage } from '../pages/admin/AdminDonationsPage';

// Error Pages
import { AccessDeniedPage } from '../pages/errors/AccessDeniedPage';
import { NotFoundPage } from '../pages/errors/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Donor Protected Routes */}
      <Route
        path="/donor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['DONOR']}>
            <DonorDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/donor/donate"
        element={
          <ProtectedRoute allowedRoles={['DONOR']}>
            <CreateDonationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/donor/donations"
        element={
          <ProtectedRoute allowedRoles={['DONOR']}>
            <DonorDonationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/donor/profile"
        element={
          <ProtectedRoute allowedRoles={['DONOR']}>
            <DonorProfilePage />
          </ProtectedRoute>
        }
      />

      {/* NGO Protected Routes */}
      <Route
        path="/ngo/dashboard"
        element={
          <ProtectedRoute allowedRoles={['NGO']}>
            <NgoDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ngo/donations"
        element={
          <ProtectedRoute allowedRoles={['NGO']}>
            <AvailableDonationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ngo/donations/:id"
        element={
          <ProtectedRoute allowedRoles={['NGO', 'DONOR', 'ADMIN']}>
            <DonationDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ngo/my-donations"
        element={
          <ProtectedRoute allowedRoles={['NGO']}>
            <NgoMyDonationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ngo/profile"
        element={
          <ProtectedRoute allowedRoles={['NGO']}>
            <NgoProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Admin Protected Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminUsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/donations"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDonationsPage />
          </ProtectedRoute>
        }
      />

      {/* Errors & Fallbacks */}
      <Route path="/access-denied" element={<AccessDeniedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
