import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { HazardReport, AIAnalysisData, ReportStatus } from '../types';
import { api, clientSideAIAnalyze } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { AIAnalysisCard } from '../components/AIAnalysisCard';
import { MapView } from '../components/MapView';
import { SafetyCardModal } from '../components/SafetyCardModal';
import { useAuth } from '../components/RoleSwitcher';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  User, 
  ThumbsUp, 
  Share2, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Activity,
  Layers,
  ChevronRight,
  Shield,
  Edit3
} from 'lucide-react';

export const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isModerator, user } = useAuth();

  const [report, setReport] = useState<HazardReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [hasSupported, setHasSupported] = useState(false);
  const [supportCount, setSupportCount] = useState(0);

  // Moderator Inline Action Form State
  const [modStatus, setModStatus] = useState<ReportStatus>('Verified');
  const [modNotes, setModNotes] = useState('');
  const [modResolutionNotes, setModResolutionNotes] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    async function loadReport() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await api.getReportById(id);
        if (data) {
          setReport(data);
          setSupportCount(data.support_count);
          setModStatus(data.status);
          setModNotes(data.moderator_notes || '');
          setModResolutionNotes(data.resolution_notes || '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [id]);

  const handleSupport = async () => {
    if (!report) return;
    try {
      const res = await api.supportReport(report.id, 'user_detail_session');
      setSupportCount(res.count);
      setHasSupported(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleModeratorStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report) return;

    setIsUpdatingStatus(true);
    try {
      const updated = await api.updateReportStatus(report.id, {
        status: modStatus,
        moderator_notes: modNotes,
        resolution_notes: modStatus === 'Resolved' ? modResolutionNotes : undefined,
        moderator_name: user.name
      });
      setReport(updated);
      alert(`Report status successfully updated to ${modStatus}!`);
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center text-slate-400">
        <Activity className="w-8 h-8 animate-spin mx-auto text-civic-teal mb-3" />
        <p className="text-sm">Loading hazard report record...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 mx-auto text-amber-400" />
        <h2 className="text-xl font-bold text-white">Report Not Found</h2>
        <p className="text-sm text-slate-400">The requested report ID could not be located in the database.</p>
        <Link to="/map" className="inline-flex items-center gap-2 text-civic-teal-cyan font-semibold text-xs hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Community Map</span>
        </Link>
      </div>
    );
  }

  const aiData: AIAnalysisData = {
    report_id: report.id,
    report_code: report.report_code,
    suggested_category: report.ai_suggested_category || report.category,
    suggested_priority: report.ai_suggested_priority || report.severity,
    risk_score: report.ai_risk_score,
    explanation: report.ai_explanation || 'Comprehensive multi-factor risk assessment calculated.',
    duplicates: [],
    recommended_action: report.status === 'Resolved' ? 'Hazard resolved. Ongoing community monitoring.' : 'Priority verification by city safety moderator.',
    confidence_score: report.ai_confidence,
    limitations_note: 'Transparent deterministic evaluation based on spatial clustering and vulnerability keywords. Not an official municipal dispatch.',
    provider_name: 'CivicShield Community Risk Intelligence Engine',
    is_fallback: report.is_ai_fallback
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Breadcrumb & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-civic-teal-cyan bg-civic-teal/15 px-2 py-0.5 rounded border border-civic-teal/30">
                {report.report_code}
              </span>
              <span className="text-xs text-slate-400">• {report.category}</span>
            </div>
            <h1 className="font-display font-bold text-xl sm:text-2xl text-white mt-1">
              {report.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSupport}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              hasSupported
                ? 'bg-civic-teal text-navy-950 font-bold'
                : 'bg-white/10 hover:bg-white/15 text-slate-200'
            }`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${hasSupported ? 'fill-navy-950' : ''}`} />
            <span>{supportCount} Confirmed</span>
          </button>

          <button
            onClick={() => setShareModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Card</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Details & Right Intelligence/Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (8 cols): Photo, Description, Location Map */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Photo & Status Banner */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
            {report.image_url ? (
              <div className="h-80 sm:h-96 w-full bg-navy-900 overflow-hidden relative">
                <img
                  src={report.image_url}
                  alt={report.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2">
                  <StatusBadge status={report.status} size="lg" />
                  <PriorityBadge priority={report.severity} score={report.ai_risk_score} size="lg" />
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 bg-navy-900/50">
                <p className="text-xs">No photographic evidence was submitted with this report.</p>
              </div>
            )}

            {/* Core Metadata Row */}
            <div className="p-6 space-y-4">
              <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400 border-b border-white/10 pb-4">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-civic-teal" />
                  Submitted: {new Date(report.created_at).toLocaleString()}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-civic-teal" />
                  Reporter: {report.reporter_name || 'Community Citizen'}
                </span>
                {report.is_demo_data && (
                  <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    Demonstration Record
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                  Hazard Description & Context
                </h3>
                <p className="text-sm text-slate-200 leading-relaxed bg-navy-950/60 p-4 rounded-xl border border-white/5">
                  {report.description}
                </p>
              </div>

              {/* Location Details & Map Preview */}
              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-civic-teal" />
                  <span>Location: {report.general_location}</span>
                </h3>
                {report.landmark && (
                  <p className="text-xs text-slate-400">Landmark reference: {report.landmark}</p>
                )}
                {report.latitude && report.longitude && (
                  <div className="rounded-xl overflow-hidden border border-white/10 pt-2">
                    <MapView
                      reports={[report]}
                      selectedReport={report}
                      height="260px"
                    />
                  </div>
                )}
              </div>

              {/* Confirmed Resolution Section (if resolved) */}
              {report.status === 'Resolved' && (
                <div className="p-5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Confirmed Resolution Report</span>
                  </div>
                  <p className="text-xs text-emerald-200 leading-relaxed">
                    {report.resolution_notes || 'Municipal field maintenance confirmed this hazard has been cleared and road safety standards restored.'}
                  </p>
                  {report.resolution_evidence_url && (
                    <div className="mt-2 h-44 rounded-lg overflow-hidden border border-emerald-500/30">
                      <img
                        src={report.resolution_evidence_url}
                        alt="Resolution evidence"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {report.resolved_at && (
                    <span className="text-[11px] text-emerald-400/80 block">
                      Resolved on: {new Date(report.resolved_at).toLocaleString()}
                    </span>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* AI Analysis Full Card */}
          <AIAnalysisCard analysis={aiData} />

        </div>

        {/* Right Column (4 cols): Status Timeline & Moderator Control Desk */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* STATUS TIMELINE */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-5">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Clock className="w-4 h-4 text-civic-teal-cyan" />
              <h3 className="font-bold text-sm text-white">Event Audit Timeline</h3>
            </div>

            <div className="space-y-6 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-white/10">
              {report.status_history && report.status_history.map((event, idx) => (
                <div key={event.id || idx} className="relative flex items-start gap-4 text-xs">
                  <div className="w-6 h-6 rounded-full bg-navy-900 border-2 border-civic-teal flex items-center justify-center shrink-0 z-10 text-civic-teal-cyan">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{event.to_status}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(event.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block">
                      By: {event.changed_by}
                    </span>
                    {event.notes && (
                      <p className="text-slate-300 bg-white/5 p-2 rounded text-[11px] mt-1">
                        {event.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* INLINE MODERATOR CONTROL DESK (Available for authorized moderators or demo evaluator) */}
          <div className="glass-panel rounded-2xl p-6 border border-amber-500/40 space-y-4 shadow-glow-amber">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>City Moderator Controls</span>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                {isModerator ? 'Authorized' : 'Demo Switcher'}
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Update report verification state, transition workflow, or log resolution notes.
            </p>

            <form onSubmit={handleModeratorStatusUpdate} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Transition Status To:</label>
                <select
                  value={modStatus}
                  onChange={(e) => setModStatus(e.target.value as ReportStatus)}
                  className="w-full glass-input rounded-lg p-2 text-xs"
                >
                  <option value="Submitted" className="bg-navy-900">Submitted (Queue)</option>
                  <option value="Needs Review" className="bg-navy-900">Needs Review</option>
                  <option value="Verified" className="bg-navy-900">Verified Hazard (On-site confirmed)</option>
                  <option value="In Progress" className="bg-navy-900">In Progress (Field crew assigned)</option>
                  <option value="Resolved" className="bg-navy-900">Resolved (Fixed & confirmed)</option>
                  <option value="Rejected" className="bg-navy-900">Rejected / Closed</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Moderator Inspection Note:</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Field inspector confirmed 1.5m pothole. Work order dispatched."
                  value={modNotes}
                  onChange={(e) => setModNotes(e.target.value)}
                  className="w-full glass-input rounded-lg p-2 text-xs"
                />
              </div>

              {modStatus === 'Resolved' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-emerald-300">Resolution Confirmation Note:</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Road surface patched with hot asphalt. Luminance verified."
                    value={modResolutionNotes}
                    onChange={(e) => setModResolutionNotes(e.target.value)}
                    className="w-full glass-input rounded-lg p-2 text-xs"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isUpdatingStatus}
                className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
              >
                {isUpdatingStatus ? 'Recording Transition...' : 'Apply Status Transition'}
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* Share Modal */}
      <SafetyCardModal
        report={report}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />

    </div>
  );
};
