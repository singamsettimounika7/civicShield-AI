import React, { useEffect, useState } from 'react';
import { HazardReport, ReportCategory } from '../types';
import { api } from '../services/api';
import { HazardCard } from '../components/HazardCard';
import { SafetyCardModal } from '../components/SafetyCardModal';
import { 
  Users, 
  Search, 
  Filter, 
  PlusCircle, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  Clock,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES: Array<'All' | ReportCategory> = [
  'All',
  'Road Damage / Pothole',
  'Waterlogging',
  'Open Drain / Manhole',
  'Electrical Hazard',
  'Fallen Tree',
  'Broken Streetlight',
  'Waste Accumulation',
  'Blocked Footpath'
];

type FeedTab = 'all' | 'verified' | 'in_progress' | 'resolved';

export const CommunityFeedPage: React.FC = () => {
  const [reports, setReports] = useState<HazardReport[]>([]);
  const [activeTab, setActiveTab] = useState<FeedTab>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [shareReport, setShareReport] = useState<HazardReport | null>(null);
  const [loading, setLoading] = useState(true);

  const loadFeed = async () => {
    setLoading(true);
    try {
      const data = await api.getReports();
      setReports(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  // Filter logic
  const filtered = reports.filter(r => {
    // Tab filter
    if (activeTab === 'verified' && r.status !== 'Verified') return false;
    if (activeTab === 'in_progress' && r.status !== 'In Progress') return false;
    if (activeTab === 'resolved' && r.status !== 'Resolved') return false;

    // Category filter
    if (categoryFilter !== 'All' && r.category !== categoryFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.general_location.toLowerCase().includes(q) ||
        r.report_code.toLowerCase().includes(q)
      );
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Feed Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
              Public Community Feed
            </h1>
            <span className="text-xs font-mono text-civic-teal-cyan bg-civic-teal/20 px-2 py-0.5 rounded border border-civic-teal/30">
              Live Updates
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Browse recent hazards flagged by citizens, confirm issues you observe, and track resolution progress.
          </p>
        </div>

        <Link
          to="/report"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-civic-teal hover:bg-civic-teal-light text-navy-950 font-bold text-xs uppercase tracking-wider shadow-glow-teal self-start sm:self-auto transition-all"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          <span>Report a Hazard</span>
        </Link>
      </div>

      {/* Tabs & Search Controls */}
      <div className="space-y-4">
        
        {/* State Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-2">
          {[
            { id: 'all', label: 'All Incidents', icon: Clock },
            { id: 'verified', label: 'Verified Hazards', icon: ShieldCheck },
            { id: 'in_progress', label: 'In Progress (Field Crew)', icon: RefreshCw },
            { id: 'resolved', label: 'Recently Resolved', icon: CheckCircle2 },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as FeedTab)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-civic-teal text-navy-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Category Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reports by description, road name, or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg glass-input"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg glass-input"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat} className="bg-navy-900 text-slate-200">
                  {cat === 'All' ? 'All Hazard Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(report => (
          <HazardCard
            key={report.id}
            report={report}
            onShare={setShareReport}
          />
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-400 glass-panel rounded-2xl space-y-2">
            <Users className="w-8 h-8 mx-auto text-slate-500" />
            <p className="font-semibold text-white">No reports match your current filters</p>
            <p className="text-xs text-slate-400">Try switching tabs or resetting the category filter.</p>
          </div>
        )}
      </div>

      {/* Safety Card Modal */}
      <SafetyCardModal
        report={shareReport}
        isOpen={Boolean(shareReport)}
        onClose={() => setShareReport(null)}
      />

    </div>
  );
};
