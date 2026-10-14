import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShieldAlert, 
  MapPin, 
  BarChart3, 
  PlusCircle, 
  HelpCircle, 
  Menu, 
  X, 
  Users, 
  ShieldCheck,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { RoleSwitcher, useAuth } from './RoleSwitcher';
import { api } from '../services/api';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const location = useLocation();
  const { isModerator } = useAuth();

  const navLinks = [
    { to: '/', label: 'Home', icon: Sparkles },
    { to: '/map', label: 'Safety Map', icon: MapPin },
    { to: '/feed', label: 'Community Feed', icon: Users },
    { to: '/impact', label: 'Impact Dashboard', icon: BarChart3 },
    { to: '/how-it-works', label: 'How It Works', icon: HelpCircle },
  ];

  if (isModerator) {
    navLinks.push({ to: '/moderator', label: 'Moderator Desk', icon: ShieldCheck });
  }

  const handleResetDemo = async () => {
    if (confirm("Reset demo database back to realistic sample hazards?")) {
      setIsResetting(true);
      await api.resetDemoData();
      setIsResetting(false);
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-civic-teal to-navy-800 p-0.5 shadow-glow-teal flex items-center justify-center transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-navy-900 rounded-[10px] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-civic-teal-light group-hover:text-civic-teal transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-lg tracking-tight text-white group-hover:text-civic-teal-light transition-colors">
                  CivicShield <span className="text-civic-teal-cyan">AI</span>
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-civic-teal/20 text-civic-teal-cyan border border-civic-teal/30">
                  Demo
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block -mt-0.5">
                Spot the Risk. Alert the Community.
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white/10 text-civic-teal-cyan font-semibold border border-white/10'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-civic-teal-cyan' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions & Role Switcher */}
          <div className="hidden md:flex items-center gap-3">
            <RoleSwitcher />

            <button
              onClick={handleResetDemo}
              disabled={isResetting}
              title="Reset sample demo data"
              className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg border border-slate-700/50 transition-colors"
            >
              <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin text-civic-teal' : ''}`} />
            </button>

            <Link
              to="/report"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-civic-teal to-teal-500 hover:from-teal-500 hover:to-civic-teal-light text-navy-950 font-bold text-xs uppercase tracking-wider shadow-glow-teal hover:shadow-lg transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-navy-950 stroke-[2.5]" />
              <span>Report Hazard</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/report"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-civic-teal text-navy-950 font-bold text-xs"
            >
              <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Report</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-white" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-white/10 px-4 pt-2 pb-6 space-y-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="pb-2 border-b border-white/10">
            <p className="text-xs text-slate-400 mb-2 font-medium">Active Perspective:</p>
            <RoleSwitcher />
          </div>

          <div className="grid grid-cols-1 gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-civic-teal/20 text-civic-teal-cyan border border-civic-teal/30'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 text-civic-teal-cyan" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={handleResetDemo}
              className="flex items-center gap-2 text-xs text-slate-400 hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Hazards</span>
            </button>
            <span className="text-[11px] text-slate-500 font-mono">v1.0.0 CivicTech</span>
          </div>
        </div>
      )}
    </header>
  );
};
