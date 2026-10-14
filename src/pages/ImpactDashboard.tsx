import React, { useEffect, useState } from 'react';
import { DashboardStats } from '../types';
import { api } from '../services/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  CartesianGrid 
} from 'recharts';
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  Share2, 
  Download, 
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';

const COLORS = ['#14B8A6', '#0284C7', '#F59E0B', '#EF4444', '#8B5CF6', '#10B981', '#EC4899', '#64748B'];

export const ImpactDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const handleShareSummary = () => {
    if (!stats) return;
    setIsExporting(true);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1200;
    canvas.height = 630;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 1200, 630);
    grad.addColorStop(0, '#060B18');
    grad.addColorStop(1, '#0B132B');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 630);

    // Frame
    ctx.strokeStyle = '#14B8A6';
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, 1160, 590);

    // Brand
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('CivicShield AI • Community Safety Impact', 60, 90);

    ctx.fillStyle = '#14B8A6';
    ctx.font = '20px sans-serif';
    ctx.fillText('“Spot the Risk. Alert the Community. Prevent the Harm.”', 60, 130);

    // Metrics Grid
    ctx.fillStyle = '#2DD4BF';
    ctx.font = 'bold 64px monospace';
    ctx.fillText(String(stats.total_reports), 80, 240);
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('Total Hazard Reports', 80, 280);

    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 64px monospace';
    ctx.fillText(String(stats.verified_hazards), 450, 240);
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('Verified Hazards', 450, 280);

    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 64px monospace';
    ctx.fillText(String(stats.confirmed_resolutions), 800, 240);
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('Confirmed Resolutions', 800, 280);

    // Review speed
    ctx.fillStyle = '#CBD5E1';
    ctx.font = '22px sans-serif';
    ctx.fillText(`⚡ Average Ward Triage Speed: ${stats.average_review_hours} hours`, 80, 380);

    // Footer note
    ctx.fillStyle = '#64748B';
    ctx.font = '16px monospace';
    ctx.fillText('Calculated from verified database records. Illustrative Demonstration Data.', 80, 550);

    const link = document.createElement('a');
    link.download = `CivicShield-Community-Impact-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setIsExporting(false);
  };

  if (loading || !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">
        <p>Loading community impact analytics...</p>
      </div>
    );
  }

  // Transform category counts for Recharts
  const categoryChartData = Object.entries(stats.category_counts).map(([name, value]) => ({
    name: name.split('/')[0].trim(),
    count: value
  }));

  // Transform severity counts
  const severityChartData = Object.entries(stats.severity_counts).map(([name, value]) => ({
    name,
    count: value
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
              Community Impact Analytics
            </h1>
            <span className="text-xs font-mono text-teal-400 bg-teal-500/20 px-2 py-0.5 rounded border border-teal-500/30 uppercase">
              Demo Data
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Real calculated metrics derived from active database incident reports and resolution timestamps.
          </p>
        </div>

        <button
          onClick={handleShareSummary}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-civic-teal hover:bg-civic-teal-light text-navy-950 font-bold text-xs uppercase tracking-wider shadow-glow-teal transition-all self-start sm:self-auto"
        >
          <Share2 className="w-4 h-4" />
          <span>{isExporting ? 'Generating...' : 'Export Impact Card'}</span>
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="glass-panel rounded-xl p-5 border border-white/10 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Total Submitted</span>
          <p className="text-3xl font-mono font-bold text-white">{stats.total_reports}</p>
          <span className="text-[11px] text-civic-teal-cyan">Community reports</span>
        </div>

        <div className="glass-panel rounded-xl p-5 border border-white/10 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Awaiting Review</span>
          <p className="text-3xl font-mono font-bold text-amber-400">{stats.awaiting_review}</p>
          <span className="text-[11px] text-amber-300/80">Pending triage</span>
        </div>

        <div className="glass-panel rounded-xl p-5 border border-white/10 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Verified Hazards</span>
          <p className="text-3xl font-mono font-bold text-teal-400">{stats.verified_hazards}</p>
          <span className="text-[11px] text-teal-300/80">Confirmed on-site</span>
        </div>

        <div className="glass-panel rounded-xl p-5 border border-white/10 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Confirmed Resolutions</span>
          <p className="text-3xl font-mono font-bold text-emerald-400">{stats.confirmed_resolutions}</p>
          <span className="text-[11px] text-emerald-300/80">With evidence photo</span>
        </div>

        <div className="glass-panel rounded-xl p-5 border border-white/10 space-y-1 col-span-2 lg:col-span-1">
          <span className="text-xs text-slate-400 font-medium">Avg Review Time</span>
          <p className="text-3xl font-mono font-bold text-purple-400">{stats.average_review_hours}h</p>
          <span className="text-[11px] text-purple-300/80">Submission to verification</span>
        </div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Category Breakdown (BarChart) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Hazard Reports by Category</h3>
            <span className="text-xs text-slate-400">Total: {stats.total_reports}</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94A3B8" 
                  fontSize={10} 
                  angle={-25} 
                  textAnchor="end"
                  interval={0}
                />
                <YAxis stroke="#94A3B8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111B38',
                    borderColor: 'rgba(20, 184, 166, 0.4)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" fill="#14B8A6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution (PieChart) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Severity Distribution</h3>
            <span className="text-xs text-slate-400">Priority Tiers</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {severityChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        entry.name === 'Critical' ? '#EF4444' :
                        entry.name === 'High' ? '#F59E0B' :
                        entry.name === 'Medium' ? '#0284C7' : '#10B981'
                      } 
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111B38',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500" /> Critical</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500" /> High</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-sky-500" /> Medium</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Low</span>
          </div>
        </div>

        {/* Trend Over Time (AreaChart) */}
        <div className="lg:col-span-12 glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white">7-Day Activity & Resolution Trends</h3>
              <p className="text-xs text-slate-400">Submissions compared against confirmed field repairs</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-teal-500" /> Submissions
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500" /> Resolutions
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.recent_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111B38',
                    borderColor: 'rgba(20, 184, 166, 0.4)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="submitted" stroke="#14B8A6" fillOpacity={1} fill="url(#colorSub)" />
                <Area type="monotone" dataKey="resolved" stroke="#10B981" fillOpacity={1} fill="url(#colorRes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Ethics & Transparent Metrics Disclosure */}
      <div className="p-4 rounded-xl bg-navy-900/60 border border-white/5 flex items-start gap-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-civic-teal shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Data Integrity Principle:</strong> All metrics shown in this dashboard reflect actual database records. We do not extrapolate hypothetical “lives saved” or fabricate arbitrary statistics. Sample demonstration data is explicitly labeled.
        </p>
      </div>

    </div>
  );
};
