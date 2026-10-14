import React from 'react';
import { AIAnalysisData, ReportPriority } from '../types';
import { PriorityBadge } from './PriorityBadge';
import { 
  Sparkles, 
  Cpu, 
  Layers, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  analysis: AIAnalysisData;
  compact?: boolean;
}

export const AIAnalysisCard: React.FC<Props> = ({ analysis, compact = false }) => {
  const getScoreColor = (score: number) => {
    if (score >= 82) return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
    if (score >= 65) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    if (score >= 45) return 'text-blue-400 border-blue-500/40 bg-blue-500/10';
    return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
  };

  return (
    <div className="glass-panel rounded-xl p-5 border border-civic-teal/30 space-y-4 shadow-glow-teal relative overflow-hidden">
      
      {/* Background subtle radial glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-civic-teal/10 blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-civic-teal/20 border border-civic-teal/50 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-civic-teal-cyan" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-white flex items-center gap-1.5">
              <span>Community Risk Intelligence</span>
              <Sparkles className="w-3.5 h-3.5 text-civic-teal-cyan" />
            </h4>
            <span className="text-[11px] text-slate-400">
              {analysis.provider_name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden sm:inline">AI Confidence:</span>
          <span className="text-xs font-mono font-bold text-civic-teal-cyan bg-civic-teal/15 px-2 py-0.5 rounded border border-civic-teal/30">
            {Math.round(analysis.confidence_score * 100)}%
          </span>
        </div>
      </div>

      {/* Primary Score & Priority Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* Risk Score */}
        <div className={`p-3 rounded-lg border flex flex-col justify-between ${getScoreColor(analysis.risk_score)}`}>
          <span className="text-xs font-medium uppercase tracking-wider opacity-80">Calculated Risk</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold font-mono">{analysis.risk_score}</span>
            <span className="text-xs opacity-70">/ 100</span>
          </div>
        </div>

        {/* Suggested Priority */}
        <div className="p-3 rounded-lg bg-navy-900/60 border border-white/10 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Suggested Tier</span>
          <div className="mt-1">
            <PriorityBadge priority={analysis.suggested_priority} size="md" />
          </div>
        </div>

        {/* Category Classification */}
        <div className="p-3 rounded-lg bg-navy-900/60 border border-white/10 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Category Match</span>
          <span className="text-xs font-semibold text-slate-200 mt-1 truncate">
            {analysis.suggested_category}
          </span>
        </div>

      </div>

      {/* Reasoning Breakdown */}
      <div className="space-y-1.5 text-xs">
        <span className="font-semibold text-slate-300">Prioritization Reasoning:</span>
        <p className="text-slate-300 bg-navy-900/40 p-3 rounded-lg border border-white/5 leading-relaxed">
          {analysis.explanation}
        </p>
      </div>

      {/* Duplicate Candidates Alert */}
      {analysis.duplicates && analysis.duplicates.length > 0 && (
        <div className="space-y-2 border border-amber-500/30 bg-amber-950/20 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Similar / Potential Duplicate Reports Detected ({analysis.duplicates.length})</span>
          </div>
          <p className="text-[11px] text-amber-200/80">
            Our spatial clustering engine flagged nearby matching incidents. This assists moderators in preventing duplicate work orders.
          </p>
          <div className="space-y-1.5 pt-1">
            {analysis.duplicates.map((dup) => (
              <div 
                key={dup.report_id} 
                className="flex items-center justify-between p-2 rounded bg-navy-900/80 border border-white/5 text-xs"
              >
                <div>
                  <span className="font-mono text-civic-teal-cyan font-bold">{dup.report_code}:</span>
                  <span className="ml-1.5 text-slate-200">{dup.title}</span>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span>{dup.general_location}</span>
                    <span>•</span>
                    <span className="text-amber-400 font-medium">{Math.round(dup.similarity_score * 100)}% match</span>
                    {dup.distance_km && <span>• {Math.round(dup.distance_km * 1000)}m away</span>}
                  </div>
                </div>
                <Link
                  to={`/reports/${dup.report_id}`}
                  className="flex items-center gap-1 text-[11px] text-civic-teal-cyan hover:underline ml-2 shrink-0"
                >
                  <span>View</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Next Action */}
      <div className="flex items-start gap-2.5 bg-civic-teal/10 border border-civic-teal/30 p-3 rounded-lg text-xs">
        <ShieldAlert className="w-4 h-4 text-civic-teal-cyan shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-civic-teal-light">Recommended Action: </span>
          <span className="text-slate-200">{analysis.recommended_action}</span>
        </div>
      </div>

      {/* Limitations Disclaimer */}
      {!compact && (
        <div className="flex items-start gap-2 text-[11px] text-slate-400 bg-navy-950/60 p-2.5 rounded border border-white/5">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <p className="leading-normal">{analysis.limitations_note}</p>
        </div>
      )}

    </div>
  );
};
