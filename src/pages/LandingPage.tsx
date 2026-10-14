import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HazardReport, DashboardStats } from '../types';
import { api } from '../services/api';
import { HazardCard } from '../components/HazardCard';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { SafetyCardModal } from '../components/SafetyCardModal';
import { 
  ShieldAlert, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  AlertTriangle, 
  Layers, 
  Eye, 
  BarChart2, 
  ChevronRight,
  Shield,
  Activity,
  ThumbsUp,
  Cpu,
  Lock,
  HeartHandshake
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [reports, setReports] = useState<HazardReport[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [shareReport, setShareReport] = useState<HazardReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [repData, statData] = await Promise.all([
          api.getReports(),
          api.getDashboardStats()
        ]);
        setReports(repData);
        setStats(statData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const recentlySubmitted = reports.find(r => r.status === 'Submitted') || reports[1];
  const verifiedHazard = reports.find(r => r.status === 'Verified') || reports[0];
  const resolvedHazard = reports.find(r => r.status === 'Resolved') || reports[5];

  return (
    <div className="space-y-24 pb-16">
      
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-8 overflow-hidden">
        
        {/* Ambient Gradient Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-civic-teal/20 via-blue-600/10 to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-amber-500/10 blur-3xl pointer-events-none -z-10 rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Civic Tech Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-civic-teal/15 border border-civic-teal/30 text-civic-teal-cyan text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Next-Gen Community Safety & Risk Intelligence</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.12]">
                Safer streets start with <span className="bg-gradient-to-r from-civic-teal-cyan via-teal-300 to-white bg-clip-text text-transparent">someone speaking up.</span>
              </h1>

              {/* Supporting Copy */}
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                An AI-assisted community safety platform that helps people report everyday public hazards, discover nearby risks, and turn local awareness into collective action.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/map"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-civic-teal hover:bg-civic-teal-light text-navy-950 font-bold text-sm uppercase tracking-wider shadow-glow-teal flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:scale-95"
                >
                  <MapPin className="w-4 h-4 stroke-[2.5]" />
                  <span>Explore Safety Map</span>
                </Link>

                <Link
                  to="/report"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/10 flex items-center justify-center gap-2 transition-all hover:border-white/25"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Report a Hazard</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-civic-teal" />
                  <span>Transparent AI Triage</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-civic-teal" />
                  <span>Spatial Duplicate Detection</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-civic-teal" />
                  <span>Human Moderator Verified</span>
                </div>
              </div>

            </div>

            {/* Right: Interactive Safety Map Overlay Card Preview */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl p-1 bg-gradient-to-b from-civic-teal/40 via-white/10 to-transparent shadow-2xl">
                <div className="glass-panel rounded-2xl p-5 space-y-4">
                  
                  {/* Mock Map Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                      <span className="font-display font-bold text-sm text-white">Live Ward Safety Radar</span>
                    </div>
                    <span className="text-[11px] font-mono text-civic-teal-cyan bg-civic-teal/20 px-2 py-0.5 rounded border border-civic-teal/30">
                      7 Active Hazards
                    </span>
                  </div>

                  {/* Simulated Map Visual */}
                  <div className="relative h-60 rounded-xl overflow-hidden border border-white/10 bg-navy-900 group">
                    <img 
                      src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80" 
                      alt="City Street Map" 
                      className="w-full h-full object-cover opacity-35 group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/50 to-transparent" />

                    {/* Floating Pins */}
                    <div className="absolute top-1/4 left-1/3">
                      <div className="relative flex items-center justify-center">
                        <span className="w-8 h-8 rounded-full bg-rose-500/40 animate-ping absolute" />
                        <span className="w-6 h-6 rounded-full bg-rose-500 border-2 border-white text-[10px] text-white font-bold flex items-center justify-center shadow-lg">!</span>
                      </div>
                    </div>

                    <div className="absolute bottom-1/3 right-1/4">
                      <div className="w-6 h-6 rounded-full bg-amber-500 border-2 border-white text-[10px] text-white font-bold flex items-center justify-center shadow-lg">!</div>
                    </div>

                    <div className="absolute top-1/3 right-1/3">
                      <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white text-[10px] text-white font-bold flex items-center justify-center shadow-lg">!</div>
                    </div>

                    {/* Active Hazard Floating Preview Box */}
                    <div className="absolute bottom-3 left-3 right-3 glass-card rounded-lg p-2.5 border border-civic-teal/40">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-rose-400">Critical: Waterlogging</span>
                        <span className="text-slate-400">Underpass #4</span>
                      </div>
                      <p className="text-xs text-slate-200 truncate mt-0.5">
                        Storm drain blockage causing 1.5ft water accumulation
                      </p>
                    </div>

                  </div>

                  {/* Quick Triage Counters */}
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-[10px] text-slate-400 uppercase">Verified</span>
                      <p className="text-base font-bold text-teal-400 mt-0.5">
                        {stats?.verified_hazards ?? 3}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-[10px] text-slate-400 uppercase">In Progress</span>
                      <p className="text-base font-bold text-blue-400 mt-0.5">
                        {stats?.in_progress ?? 1}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-[10px] text-slate-400 uppercase">Resolved</span>
                      <p className="text-base font-bold text-emerald-400 mt-0.5">
                        {stats?.confirmed_resolutions ?? 1}
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/map"
                    className="w-full py-2.5 rounded-lg bg-civic-teal/20 hover:bg-civic-teal/30 text-civic-teal-cyan border border-civic-teal/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Launch Full Interactive Map</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ==================== TRI-STAGE PREVIEW (SUBMITTED / VERIFIED / RESOLVED) ==================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs uppercase font-mono tracking-widest text-civic-teal-cyan font-bold">
            Transparent Lifecycle
          </h2>
          <h3 className="font-display font-bold text-3xl sm:text-4xl text-white">
            From First Alert to Confirmed Resolution
          </h3>
          <p className="text-sm text-slate-300">
            CivicShield AI bridges the gap between everyday citizen awareness and municipal verification. See actual lifecycle states below:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Recently Submitted */}
          {recentlySubmitted && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">1. Recently Submitted</span>
              </div>
              <HazardCard 
                report={recentlySubmitted} 
                onShare={setShareReport} 
              />
            </div>
          )}

          {/* Card 2: Verified Hazard */}
          {verifiedHazard && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                <span className="text-xs font-semibold text-teal-300 uppercase tracking-wide">2. Moderator Verified</span>
              </div>
              <HazardCard 
                report={verifiedHazard} 
                onShare={setShareReport} 
              />
            </div>
          )}

          {/* Card 3: Resolved Community Issue */}
          {resolvedHazard && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wide">3. Confirmed Resolved</span>
              </div>
              <HazardCard 
                report={resolvedHazard} 
                onShare={setShareReport} 
              />
            </div>
          )}

        </div>
      </section>

      {/* ==================== THE PUBLIC PROBLEM ==================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-2xl p-8 sm:p-12 border border-white/10 space-y-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">The Problem We Solve</span>
            <h3 className="font-display font-bold text-2xl sm:text-3xl text-white">
              Everyday urban hazards shouldn't catch citizens by surprise.
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Communities face everyday risks that threaten pedestrian safety, vehicle travel, and public health:
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { title: "Waterlogged Roads", desc: "Monsoon flooding & stalled transit", icon: "🌊" },
              { title: "Deep Potholes", desc: "Damaged tires & sudden vehicle skids", icon: "🕳️" },
              { title: "Open Drains & Manholes", desc: "Critical fall danger for walkers & kids", icon: "⚠️" },
              { title: "Electrical Hazards", desc: "Dangling wires & sparking transformers", icon: "⚡" },
              { title: "Fallen Trees", desc: "Blocked footpaths & storm obstruction", icon: "🌳" },
              { title: "Broken Streetlights", desc: "Dark pedestrian crossings at night", icon: "💡" },
              { title: "Blocked Walkways", desc: "Forces pedestrians onto busy roads", icon: "🚶" },
              { title: "Waste Accumulation", desc: "Sanitation spills blocking ramps", icon: "🗑️" },
            ].map((p, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-navy-900/60 border border-white/5 space-y-1.5 hover:border-civic-teal/30 transition-colors">
                <span className="text-2xl">{p.icon}</span>
                <h4 className="font-semibold text-sm text-white pt-1">{p.title}</h4>
                <p className="text-xs text-slate-400">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Scattered social media complaints cause duplicate chaos and delay critical field dispatch.</span>
            </div>
            <Link to="/how-it-works" className="text-civic-teal-cyan hover:underline font-semibold flex items-center gap-1 shrink-0">
              <span>Read how CivicShield solves this</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== HOW CIVICSHIELD AI WORKS ==================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-civic-teal-cyan font-bold">Four-Stage Flow</span>
          <h3 className="font-display font-bold text-3xl sm:text-4xl text-white">How CivicShield AI Works</h3>
          <p className="text-sm text-slate-300">
            Empowering neighbors to spot hazards while giving city moderators intelligent tools to act swiftly.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: "01",
              title: "Spot & Submit",
              desc: "A citizen observes an open drain or waterlogging, takes a photo, confirms location, and submits.",
              badge: "Citizen Action",
              icon: MapPin,
            },
            {
              step: "02",
              title: "AI Triage & Clustering",
              desc: "Our engine evaluates severity, detects potential duplicate reports within 500m, and scores risk.",
              badge: "Intelligence Engine",
              icon: Cpu,
            },
            {
              step: "03",
              title: "Moderator Verification",
              desc: "Ward safety moderators review evidence, merge duplicates, verify accuracy, and dispatch work orders.",
              badge: "Human Oversight",
              icon: Shield,
            },
            {
              step: "04",
              title: "Resolution & Cards",
              desc: "Issue is marked resolved with photographic proof. Community generates safety awareness cards.",
              badge: "Public Awareness",
              icon: CheckCircle2,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="glass-card rounded-xl p-6 border border-white/10 space-y-4 relative">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-extrabold text-white/20">{item.step}</span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-civic-teal-cyan bg-civic-teal/15 px-2 py-0.5 rounded border border-civic-teal/30">
                    {item.badge}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-civic-teal/15 border border-civic-teal/30 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-civic-teal-cyan" />
                </div>
                <h4 className="font-bold text-base text-white">{item.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================== COMMUNITY IMPACT METRICS ==================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl p-8 bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-civic-teal/30 shadow-glass space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-civic-teal-cyan font-bold">Real-time Analytics</span>
              <h3 className="text-2xl font-bold text-white mt-1">Community Impact Dashboard</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 bg-white/5 px-2 py-1 rounded border border-white/10">
                Calculated from SQLite DB records
              </span>
              <span className="text-xs font-mono text-teal-400 bg-teal-500/20 px-2 py-1 rounded border border-teal-500/30 uppercase">
                Demo Data
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-xl bg-navy-950/70 border border-white/5 space-y-1">
              <span className="text-xs text-slate-400">Total Submissions</span>
              <p className="text-3xl font-bold font-mono text-white">{stats?.total_reports ?? 7}</p>
              <span className="text-[11px] text-civic-teal-cyan">Community reports</span>
            </div>

            <div className="p-4 rounded-xl bg-navy-950/70 border border-white/5 space-y-1">
              <span className="text-xs text-slate-400">Awaiting Review</span>
              <p className="text-3xl font-bold font-mono text-amber-400">{stats?.awaiting_review ?? 3}</p>
              <span className="text-[11px] text-amber-300/80">Pending triage</span>
            </div>

            <div className="p-4 rounded-xl bg-navy-950/70 border border-white/5 space-y-1">
              <span className="text-xs text-slate-400">Verified Hazards</span>
              <p className="text-3xl font-bold font-mono text-teal-400">{stats?.verified_hazards ?? 3}</p>
              <span className="text-[11px] text-teal-300/80">Active field response</span>
            </div>

            <div className="p-4 rounded-xl bg-navy-950/70 border border-white/5 space-y-1">
              <span className="text-xs text-slate-400">Confirmed Resolved</span>
              <p className="text-3xl font-bold font-mono text-emerald-400">{stats?.confirmed_resolutions ?? 1}</p>
              <span className="text-[11px] text-emerald-300/80">With photographic proof</span>
            </div>

            <div className="p-4 rounded-xl bg-navy-950/70 border border-white/5 space-y-1 col-span-2 lg:col-span-1">
              <span className="text-xs text-slate-400">Avg Review Time</span>
              <p className="text-3xl font-bold font-mono text-purple-400">{stats?.average_review_hours ?? 3.8}h</p>
              <span className="text-[11px] text-purple-300/80">Fast triage response</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Link
              to="/impact"
              className="text-xs font-semibold text-civic-teal-cyan hover:underline flex items-center gap-1"
            >
              <span>View Full Impact Trends & Category Charts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== RESPONSIBLE PARTICIPATION CTA ==================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-8 sm:p-14 overflow-hidden border border-civic-teal/40 bg-gradient-to-br from-navy-900 via-navy-950 to-navy-900 shadow-2xl text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-civic-teal/20 border border-civic-teal/50 flex items-center justify-center mx-auto shadow-glow-teal">
            <HeartHandshake className="w-7 h-7 text-civic-teal-cyan" />
          </div>

          <div className="max-w-2xl mx-auto space-y-3">
            <h3 className="font-display font-bold text-3xl sm:text-4xl text-white">
              “Small actions. Safer neighborhoods.”
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Your report could help a cyclist avoid a crash, protect a child from an uncovered drain, or redirect evening commuter buses before an underpass floods.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/report"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-civic-teal hover:bg-civic-teal-light text-navy-950 font-bold text-xs uppercase tracking-wider shadow-glow-teal transition-all active:scale-95"
            >
              Report a Public Hazard Now
            </Link>
            <Link
              to="/feed"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 transition-colors"
            >
              Browse Community Feed
            </Link>
          </div>
        </div>
      </section>

      {/* Share Modal */}
      <SafetyCardModal
        report={shareReport}
        isOpen={Boolean(shareReport)}
        onClose={() => setShareReport(null)}
      />

    </div>
  );
};
