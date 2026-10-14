import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Heart, Shield, Sparkles, ExternalLink, AlertOctagon } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-white/10 bg-navy-950/90 text-slate-400">
      {/* Top Banner: Responsible Community Notice */}
      <div className="border-b border-white/5 bg-navy-900/40 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-300/90">
            <AlertOctagon className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Important Safety Notice:</strong> CivicShield AI is a community reporting and awareness tool, not an official emergency service. For life-threatening emergencies, dial 911 or local emergency services immediately.
            </span>
          </div>
          <span className="shrink-0 text-slate-500 font-mono text-[11px]">
            Demo Environment • AI-Assisted Triage
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Vision */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-civic-teal/20 border border-civic-teal/40 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-civic-teal-cyan" />
              </div>
              <span className="font-display font-bold text-lg text-white">
                CivicShield <span className="text-civic-teal-cyan">AI</span>
              </span>
            </div>
            
            <p className="text-sm text-slate-300 max-w-md leading-relaxed">
              “Safer streets start with someone speaking up.” An AI-assisted community safety platform empowering citizens to document public hazards, assist moderators with duplicate detection, and turn local awareness into collective action.
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
              <Shield className="w-4 h-4 text-civic-teal" />
              <span>Transparent AI • Human-Verified Triaging • Open Standards</span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/map" className="hover:text-civic-teal-light transition-colors">
                  Community Safety Map
                </Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-civic-teal-light transition-colors">
                  Report a Public Hazard
                </Link>
              </li>
              <li>
                <Link to="/feed" className="hover:text-civic-teal-light transition-colors">
                  Live Community Feed
                </Link>
              </li>
              <li>
                <Link to="/impact" className="hover:text-civic-teal-light transition-colors">
                  Community Impact Analytics
                </Link>
              </li>
              <li>
                <Link to="/moderator" className="hover:text-civic-teal-light transition-colors flex items-center gap-1.5">
                  <span>City Moderator Desk</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 rounded">Auth</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Ethics & Community */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Ethics & Trust</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/how-it-works" className="hover:text-civic-teal-light transition-colors">
                  How AI Triage Works
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-civic-teal-light transition-colors">
                  AI Limitations & Ethics
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-civic-teal-light transition-colors">
                  Privacy Safeguards
                </Link>
              </li>
              <li>
                <span className="text-slate-500 text-xs block pt-2">
                  No private home addresses exposed. Geolocation requested strictly upon explicit consent.
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2025–2026 CivicShield AI Platform. Built with public safety and empathy.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-slate-400">
              Made for resilient communities <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/30" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
