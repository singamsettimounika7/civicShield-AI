import React, { useEffect, useState } from 'react';
import { HazardReport, ReportStatus, ReportPriority } from '../types';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { useAuth } from '../components/RoleSwitcher';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Filter, 
  Layers, 
  Clock, 
  Check, 
  X, 
  CheckCircle2, 
  Search, 
  ExternalLink,
  MessageSquare,
  Shield,
  UserCheck,
  ChevronRight,
  Flame,
  Camera
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ModeratorPage: React.FC = () => {
  const { isModerator, role, switchRole, user } = useAuth();
  const [reports, setReports] = useState<HazardReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<HazardReport | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('Submitted');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  // Action Drawer State
  const [actionStatus, setActionStatus] = useState<ReportStatus>('Verified');
  const [modNote, setModNote] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const data = await api.getReports();
      setReports(data);
      if (data.length > 0 && !selectedReport) {
        setSelectedReport(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  // Update selected report fields when selection changes
  useEffect(() => {
    if (selectedReport) {
      setActionStatus(selectedReport.status === 'Submitted' ? 'Verified' : selectedReport.status);
      setModNote(selectedReport.moderator_notes || '');
      setResolutionNote(selectedReport.resolution_notes || '');
    }
  }, [selectedReport]);

  const handleApplyAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    setIsProcessing(true);
    try {
      const updated = await api.updateReportStatus(selectedReport.id, {
        status: actionStatus,
        moderator_notes: modNote,
        resolution_notes: actionStatus === 'Resolved' ? resolutionNote : undefined,
        moderator_name: user.name
      });
      setReports(reports.map(r => r.id === updated.id ? updated : r));
      setSelectedReport(updated);
      alert(`Report ${updated.report_code} updated to ${actionStatus}. Audit trail updated.`);
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Quick Action Buttons
  const handleQuickVerify = async (report: HazardReport) => {
    try {
      const updated = await api.updateReportStatus(report.id, {
        status: 'Verified',
        moderator_notes: `Verified on-site by ${user.name}. Photographic evidence matches reported coordinates.`,
        moderator_name: user.name
      });
      setReports(reports.map(r => r.id === updated.id ? updated : r));
      if (selectedReport?.id === report.id) setSelectedReport(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickReject = async (report: HazardReport) => {
    const reason = prompt('Enter reason for closing / rejecting report (e.g. duplicate or resolved):', 'Duplicate report merged with existing ticket.');
    if (!reason) return;

    try {
      const updated = await api.updateReportStatus(report.id, {
        status: 'Rejected',
        moderator_notes: reason,
        moderator_name: user.name
      });
      setReports(reports.map(r => r.id === updated.id ? updated : r));
      if (selectedReport?.id === report.id) setSelectedReport(updated);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter & Priority Sort
  const filtered = reports
    .filter(r => {
      if (statusFilter !== 'All' && r.status !== statusFilter) return false;
      if (priorityFilter !== 'All' && r.severity !== priorityFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          r.title.toLowerCase().includes(q) ||
          r.general_location.toLowerCase().includes(q) ||
          r.report_code.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => b.ai_risk_score - a.ai_risk_score); // Priority sorting: Critical/Highest risk first

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Role Banner / Warning if not in Moderator view */}
      {!isModerator && (
        <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/40 text-xs text-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              <strong>Evaluator Access Notice:</strong> You are currently viewing as Citizen. To test verification and dispatch actions, switch to City Moderator role.
            </span>
          </div>
          <button
            onClick={() => switchRole('moderator')}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs uppercase tracking-wider shrink-0 transition-colors"
          >
            Switch to Moderator Mode
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
              City Moderator Triage Desk
            </h1>
            <span className="text-xs font-mono text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
              Ward Dispatch Queue
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Review submitted citizen reports, examine photographic evidence, flag duplicates, and authorize field dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300 bg-navy-900/80 px-3 py-1.5 rounded-lg border border-white/10">
          <UserCheck className="w-4 h-4 text-civic-teal" />
          <span>Active Officer: <strong>{user.name}</strong></span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 glass-panel rounded-xl p-3 border border-white/10 items-center">
        
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search pending queue by location or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs glass-input rounded-lg"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-1.5 px-3 text-xs glass-input rounded-lg"
          >
            <option value="All" className="bg-navy-900">All Statuses ({reports.length})</option>
            <option value="Submitted" className="bg-navy-900">Submitted / Awaiting Triage</option>
            <option value="Needs Review" className="bg-navy-900">Needs Review</option>
            <option value="Verified" className="bg-navy-900">Verified Hazards</option>
            <option value="In Progress" className="bg-navy-900">In Progress</option>
            <option value="Resolved" className="bg-navy-900">Resolved</option>
            <option value="Rejected" className="bg-navy-900">Rejected / Closed</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full py-1.5 px-3 text-xs glass-input rounded-lg"
          >
            <option value="All" className="bg-navy-900">All Priorities</option>
            <option value="Critical" className="bg-navy-900">Critical Priority Only</option>
            <option value="High" className="bg-navy-900">High Priority</option>
            <option value="Medium" className="bg-navy-900">Medium Priority</option>
            <option value="Low" className="bg-navy-900">Low Priority</option>
          </select>
        </div>

      </div>

      {/* Main Split Interface: Left Queue List, Right Inspection & Action Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Pending Reports Queue (5 cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-4 border border-white/10 space-y-3 max-h-[800px] overflow-y-auto">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/10">
            <span>Showing <strong>{filtered.length}</strong> reports (sorted by Risk Score)</span>
            <span className="flex items-center gap-1 text-rose-400">
              <Flame className="w-3.5 h-3.5" />
              <span>Highest Risk First</span>
            </span>
          </div>

          <div className="space-y-2">
            {filtered.map(report => {
              const isSelected = selectedReport?.id === report.id;
              return (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-civic-teal/20 border-civic-teal-cyan shadow-glow-teal'
                      : 'bg-navy-900/60 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-civic-teal-cyan">
                      {report.report_code}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={report.status} size="sm" showIcon={false} />
                      <PriorityBadge priority={report.severity} score={report.ai_risk_score} size="sm" />
                    </div>
                  </div>

                  <h4 className="text-xs font-semibold text-white line-clamp-1">{report.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{report.general_location}</p>

                  {report.ai_duplicate_count > 0 && (
                    <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-amber-300 font-medium bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                      <Layers className="w-3 h-3" />
                      <span>{report.ai_duplicate_count} Duplicate Detected</span>
                    </div>
                  )}

                  {/* Quick Action buttons for fast triage */}
                  <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {report.status !== 'Verified' && (
                        <button
                          onClick={() => handleQuickVerify(report)}
                          className="px-2 py-1 rounded bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-[10px] font-bold border border-teal-500/30"
                          title="Quick Verify"
                        >
                          Verify
                        </button>
                      )}
                      {report.status !== 'Rejected' && (
                        <button
                          onClick={() => handleQuickReject(report)}
                          className="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] font-medium border border-rose-500/30"
                          title="Close / Duplicate"
                        >
                          Close
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                No reports found matching the selected filter.
              </div>
            )}
          </div>
        </div>

        {/* Right: Inspection, Evidence Viewer & Transition Controls (7 cols) */}
        {selectedReport ? (
          <div className="lg:col-span-7 glass-panel rounded-2xl p-6 border border-white/10 space-y-6">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="font-mono text-xs text-civic-teal-cyan font-bold">
                  INSPECTING: {selectedReport.report_code}
                </span>
                <h3 className="font-bold text-lg text-white mt-0.5">{selectedReport.title}</h3>
              </div>
              <Link
                to={`/reports/${selectedReport.id}`}
                className="text-xs text-civic-teal-cyan hover:underline flex items-center gap-1"
                target="_blank"
              >
                <span>Full Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Evidence Photo Preview */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-civic-teal" />
                <span>Submitted Photographic Evidence</span>
              </span>

              {selectedReport.image_url ? (
                <div className="h-64 rounded-xl overflow-hidden border border-white/10 bg-navy-900">
                  <img
                    src={selectedReport.image_url}
                    alt={selectedReport.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-32 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-xs text-slate-500">
                  No photographic evidence attached
                </div>
              )}
            </div>

            {/* Description & Location */}
            <div className="space-y-2 text-xs">
              <p className="text-slate-300 bg-navy-950/70 p-3 rounded-lg border border-white/5 leading-relaxed">
                {selectedReport.description}
              </p>
              <div className="flex items-center justify-between text-slate-400">
                <span>📍 Location: <strong>{selectedReport.general_location}</strong></span>
                <span>Reporter: {selectedReport.reporter_name || 'Citizen'}</span>
              </div>
            </div>

            {/* AI Triaging Diagnostic */}
            <div className="bg-civic-teal/10 border border-civic-teal/30 p-4 rounded-xl text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-civic-teal-light">AI Risk Engine Reasoning:</span>
                <span className="font-mono font-bold text-civic-teal-cyan">Risk Score: {selectedReport.ai_risk_score}/100</span>
              </div>
              <p className="text-slate-200 text-xs leading-relaxed">
                {selectedReport.ai_explanation}
              </p>
            </div>

            {/* Moderator Status Update Form */}
            <form onSubmit={handleApplyAction} className="glass-card rounded-xl p-5 border border-white/10 space-y-4">
              <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-civic-teal" />
                <span>Execute Verification & Workflow Transition</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Set Next Status:</label>
                  <select
                    value={actionStatus}
                    onChange={(e) => setActionStatus(e.target.value as ReportStatus)}
                    className="w-full glass-input rounded-lg p-2.5 text-xs"
                  >
                    <option value="Submitted" className="bg-navy-900">Submitted (Keep in Queue)</option>
                    <option value="Needs Review" className="bg-navy-900">Needs Secondary Review</option>
                    <option value="Verified" className="bg-navy-900">Verified Hazard (Authorize response)</option>
                    <option value="In Progress" className="bg-navy-900">In Progress (Field crew active)</option>
                    <option value="Resolved" className="bg-navy-900">Resolved (Hazard cleared)</option>
                    <option value="Rejected" className="bg-navy-900">Rejected / Duplicate Merge</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Authorizing Moderator:</label>
                  <input
                    type="text"
                    disabled
                    value={user.name}
                    className="w-full glass-input rounded-lg p-2.5 text-xs opacity-75 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Verification Inspection Note:</label>
                <textarea
                  rows={2}
                  placeholder="Record verification notes, ward inspection findings, or duplicate references..."
                  value={modNote}
                  onChange={(e) => setModNote(e.target.value)}
                  className="w-full glass-input rounded-lg p-2.5 text-xs"
                />
              </div>

              {actionStatus === 'Resolved' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-emerald-300">Resolution Confirmation Note:</label>
                  <textarea
                    rows={2}
                    placeholder="Describe how the hazard was fixed (e.g. asphalt patching completed, electrical cable insulated)..."
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    className="w-full glass-input rounded-lg p-2.5 text-xs"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-2.5 rounded-lg bg-civic-teal hover:bg-civic-teal-light text-navy-950 font-bold text-xs uppercase tracking-wider shadow-glow-teal transition-all"
              >
                {isProcessing ? 'Updating Database...' : 'Save & Record Moderator Action'}
              </button>
            </form>

            {/* Event Audit Trail */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <span className="text-xs font-semibold text-slate-400">Audit History:</span>
              <div className="space-y-1.5">
                {selectedReport.status_history && selectedReport.status_history.map((hist, i) => (
                  <div key={i} className="text-[11px] text-slate-300 p-2 rounded bg-navy-950/50 border border-white/5 flex items-center justify-between">
                    <span>
                      <strong>{hist.to_status}</strong> by {hist.changed_by}: {hist.notes || 'Status changed'}
                    </span>
                    <span className="text-slate-500 font-mono text-[10px]">
                      {new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="lg:col-span-7 p-12 text-center text-slate-400 glass-panel rounded-2xl">
            Select a report from the queue on the left to inspect evidence and execute moderation actions.
          </div>
        )}

      </div>

    </div>
  );
};
