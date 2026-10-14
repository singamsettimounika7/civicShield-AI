import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HazardReport } from '../types';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { 
  MapPin, 
  Calendar, 
  ThumbsUp, 
  Share2, 
  ChevronRight, 
  Layers, 
  ShieldCheck,
  Eye,
  Camera
} from 'lucide-react';
import { api } from '../services/api';

interface Props {
  report: HazardReport;
  onShare?: (report: HazardReport) => void;
  onSupportChange?: (reportId: number, newCount: number) => void;
}

export const HazardCard: React.FC<Props> = ({ report, onShare, onSupportChange }) => {
  const [supportCount, setSupportCount] = useState(report.support_count);
  const [hasSupported, setHasSupported] = useState(false);
  const [isSupporting, setIsSupporting] = useState(false);

  const handleSupport = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSupporting) return;

    setIsSupporting(true);
    try {
      const res = await api.supportReport(report.id, 'user_session_browser');
      setSupportCount(res.count);
      setHasSupported(true);
      if (onSupportChange) onSupportChange(report.id, res.count);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSupporting(false);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onShare) onShare(report);
  };

  const formattedDate = new Date(report.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="glass-card rounded-xl overflow-hidden flex flex-col justify-between border border-white/10 hover:border-civic-teal/40 group">
      
      {/* Top Banner / Image */}
      <div className="relative h-44 w-full bg-navy-900 overflow-hidden">
        {report.image_url ? (
          <img
            src={report.image_url}
            alt={report.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-navy-950/60 p-4">
            <Camera className="w-8 h-8 mb-1 text-slate-600" />
            <span className="text-xs">No photographic evidence attached</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <StatusBadge status={report.status} size="sm" />
          <PriorityBadge priority={report.severity} score={report.ai_risk_score} size="sm" />
        </div>

        {/* Category Pill on Image Bottom */}
        <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 text-xs text-white/90 font-medium bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
          <span>{report.category}</span>
        </div>

        {report.ai_duplicate_count > 0 && (
          <div className="absolute bottom-2.5 right-3 flex items-center gap-1 text-[11px] text-amber-300 font-semibold bg-amber-950/80 backdrop-blur-md px-2 py-0.5 rounded border border-amber-500/40">
            <Layers className="w-3 h-3" />
            <span>{report.ai_duplicate_count} Duplicate{report.ai_duplicate_count > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-mono text-civic-teal-cyan font-medium">{report.report_code}</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </span>
          </div>

          <h3 className="font-semibold text-slate-100 group-hover:text-civic-teal-light transition-colors line-clamp-2 text-base mb-1.5">
            {report.title}
          </h3>

          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
            {report.description}
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {/* Location indicator */}
          <div className="flex items-start gap-1.5 text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-civic-teal shrink-0 mt-0.5" />
            <span className="line-clamp-1">{report.general_location}</span>
          </div>

          {/* Verification indicator if verified */}
          {report.verification_status === 'Verified' && (
            <div className="flex items-center gap-1.5 text-[11px] text-teal-300/90 bg-teal-950/40 border border-teal-500/20 px-2 py-1 rounded">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span className="truncate">
                Verified: {report.verified_by || 'Ward Safety Moderator'}
              </span>
            </div>
          )}

          {/* Action Row */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
            
            {/* Support / Confirm Button */}
            <button
              type="button"
              onClick={handleSupport}
              disabled={isSupporting}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                hasSupported
                  ? 'bg-civic-teal/20 text-civic-teal-cyan border border-civic-teal/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
              title="Confirm that you also observed this hazard"
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${hasSupported ? 'fill-civic-teal-cyan' : ''}`} />
              <span>{supportCount} Confirmed</span>
            </button>

            <div className="flex items-center gap-1">
              {/* Share Card Trigger */}
              <button
                type="button"
                onClick={handleShareClick}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                title="Generate shareable Community Safety Card"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* View Details Link */}
              <Link
                to={`/reports/${report.id}`}
                className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-civic-teal hover:text-navy-950 rounded-lg text-xs font-semibold text-slate-200 transition-all"
              >
                <span>Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
