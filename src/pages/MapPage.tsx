import React, { useState, useEffect } from 'react';
import { HazardReport, ReportCategory, ReportStatus } from '../types';
import { api } from '../services/api';
import { MapView } from '../components/MapView';
import { HazardCard } from '../components/HazardCard';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { SafetyCardModal } from '../components/SafetyCardModal';
import { 
  Search, 
  Filter, 
  Map as MapIcon, 
  List, 
  X, 
  PlusCircle, 
  ExternalLink, 
  Layers, 
  Calendar, 
  MapPin, 
  ShieldCheck,
  Share2,
  RefreshCw,
  Info
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

const STATUSES: Array<'All' | ReportStatus> = [
  'All',
  'Verified',
  'In Progress',
  'Needs Review',
  'Submitted',
  'Resolved'
];

export const MapPage: React.FC = () => {
  const [reports, setReports] = useState<HazardReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<HazardReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<HazardReport | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [shareReport, setShareReport] = useState<HazardReport | null>(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
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
    loadData();
  }, []);

  // Filter effect
  useEffect(() => {
    let result = reports;

    if (categoryFilter !== 'All') {
      result = result.filter(r => r.category === categoryFilter);
    }
    if (statusFilter !== 'All') {
      result = result.filter(r => r.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.general_location.toLowerCase().includes(q) ||
        r.report_code.toLowerCase().includes(q)
      );
    }

    setFilteredReports(result);
  }, [reports, categoryFilter, statusFilter, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Header & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
              Community Safety Map
            </h1>
            <span className="text-xs font-mono text-civic-teal-cyan bg-civic-teal/20 px-2 py-0.5 rounded border border-civic-teal/30">
              Demo Metro Ward
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Explore live and verified public hazards across urban corridors. Markers updated in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* List / Map Toggle */}
          <div className="flex items-center p-1 rounded-lg bg-navy-900 border border-slate-700/60">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'map'
                  ? 'bg-civic-teal text-navy-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-civic-teal text-navy-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List ({filteredReports.length})</span>
            </button>
          </div>

          <Link
            to="/report"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-civic-teal hover:bg-civic-teal-light text-navy-950 font-bold text-xs uppercase tracking-wider shadow-glow-teal transition-all"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Report Hazard</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel rounded-xl p-4 border border-white/10 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          
          {/* Search Input */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by area, title, or code (e.g. Oakridge, CS-2025)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg glass-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="sm:col-span-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg glass-input"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat} className="bg-navy-900 text-slate-200">
                  Category: {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg glass-input"
            >
              {STATUSES.map(stat => (
                <option key={stat} value={stat} className="bg-navy-900 text-slate-200">
                  Status: {stat}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Legend & Count Info */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-slate-300">Marker Legend:</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span>Critical Hazard</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Road Damage</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span>Waterlogging</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Resolved</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span>Showing <strong>{filteredReports.length}</strong> of {reports.length} reports</span>
            {(categoryFilter !== 'All' || statusFilter !== 'All' || searchQuery) && (
              <button
                onClick={() => {
                  setCategoryFilter('All');
                  setStatusFilter('All');
                  setSearchQuery('');
                }}
                className="text-civic-teal-cyan hover:underline text-xs"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main View Area: Map or List */}
      {viewMode === 'map' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Map Container */}
          <div className={selectedReport ? "lg:col-span-8" : "lg:col-span-12"}>
            <MapView
              reports={filteredReports}
              selectedReport={selectedReport}
              onSelectReport={(rep) => setSelectedReport(rep)}
              height="650px"
            />
          </div>

          {/* Selected Hazard Detail Drawer */}
          {selectedReport && (
            <div className="lg:col-span-4 glass-panel rounded-xl p-5 border border-civic-teal/40 space-y-4 shadow-xl animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-mono text-xs text-civic-teal-cyan font-bold">
                  {selectedReport.report_code}
                </span>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {selectedReport.image_url && (
                <div className="h-40 rounded-lg overflow-hidden border border-white/10 bg-navy-900">
                  <img
                    src={selectedReport.image_url}
                    alt={selectedReport.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge status={selectedReport.status} size="sm" />
                  <PriorityBadge priority={selectedReport.severity} score={selectedReport.ai_risk_score} size="sm" />
                </div>
                <h3 className="font-bold text-base text-white pt-1">{selectedReport.title}</h3>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-civic-teal shrink-0 mt-0.5" />
                  <span>{selectedReport.general_location}</span>
                </div>
                {selectedReport.landmark && (
                  <p className="text-[11px] text-slate-400 pl-5">
                    Landmark: {selectedReport.landmark}
                  </p>
                )}
              </div>

              <p className="text-xs text-slate-300 bg-navy-950/70 p-3 rounded-lg border border-white/5 leading-relaxed">
                {selectedReport.description}
              </p>

              {/* AI Triage Snippet */}
              <div className="bg-civic-teal/10 border border-civic-teal/30 p-3 rounded-lg text-xs space-y-1">
                <span className="font-semibold text-civic-teal-light">AI Risk Assessment:</span>
                <p className="text-slate-300 leading-normal text-[11px]">
                  {selectedReport.ai_explanation}
                </p>
              </div>

              {selectedReport.verification_status === 'Verified' && (
                <div className="flex items-center gap-1.5 text-xs text-teal-300 bg-teal-950/40 p-2 rounded border border-teal-500/20">
                  <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Verified by: {selectedReport.verified_by || 'City Safety Moderator'}</span>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-white/10">
                <button
                  onClick={() => setShareReport(selectedReport)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-200 border border-white/10"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Card</span>
                </button>

                <Link
                  to={`/reports/${selectedReport.id}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-civic-teal hover:bg-civic-teal-light text-navy-950 font-bold text-xs uppercase tracking-wider"
                >
                  <span>Full Report</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          )}

        </div>
      ) : (
        /* List Mode View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map(rep => (
            <HazardCard
              key={rep.id}
              report={rep}
              onShare={setShareReport}
            />
          ))}
          {filteredReports.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-400 glass-panel rounded-xl">
              <Info className="w-8 h-8 mx-auto mb-2 text-slate-500" />
              <p className="text-sm font-semibold text-slate-200">No hazard reports match your current filters</p>
              <p className="text-xs text-slate-400 mt-1">Try resetting the category, status, or search query.</p>
            </div>
          )}
        </div>
      )}

      {/* Share Modal */}
      <SafetyCardModal
        report={shareReport}
        isOpen={Boolean(shareReport)}
        onClose={() => setShareReport(null)}
      />

    </div>
  );
};
