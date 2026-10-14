import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthProvider } from './components/RoleSwitcher';

// Pages
import { LandingPage } from './pages/LandingPage';
import { MapPage } from './pages/MapPage';
import { ReportHazardPage } from './pages/ReportHazardPage';
import { ReportDetailPage } from './pages/ReportDetailPage';
import { CommunityFeedPage } from './pages/CommunityFeedPage';
import { ImpactDashboard } from './pages/ImpactDashboard';
import { ModeratorPage } from './pages/ModeratorPage';
import { HowItWorksPage } from './pages/HowItWorksPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-navy-950 text-slate-100 font-sans selection:bg-civic-teal selection:text-white">
        <Navbar />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/report" element={<ReportHazardPage />} />
            <Route path="/reports/:id" element={<ReportDetailPage />} />
            <Route path="/feed" element={<CommunityFeedPage />} />
            <Route path="/impact" element={<ImpactDashboard />} />
            <Route path="/moderator" element={<ModeratorPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </AuthProvider>
  );
};

export default App;
