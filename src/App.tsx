import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { DemoBanner } from './components/common/DemoBanner';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AppRoutes } from './routes/AppRoutes';
import { PwaInstallPrompt } from './components/common/PwaInstallPrompt';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
            <DemoBanner />
            <Navbar />
            <main className="flex-1">
              <AppRoutes />
            </main>
            <Footer />
            {/* PWA Install Promotion Card */}
            <PwaInstallPrompt />
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
