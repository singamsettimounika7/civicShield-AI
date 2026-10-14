import React from 'react';
import { ReportPriority } from '../types';
import { ShieldAlert, AlertTriangle, Info, Flame } from 'lucide-react';

interface Props {
  priority: ReportPriority;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const PriorityBadge: React.FC<Props> = ({ priority, score, size = 'md' }) => {
  const configMap: Record<ReportPriority, { label: string; bg: string; text: string; border: string; icon: any }> = {
    'Low': {
      label: 'Low Priority',
      bg: 'bg-slate-500/15',
      text: 'text-slate-300',
      border: 'border-slate-500/30',
      icon: Info,
    },
    'Medium': {
      label: 'Medium Risk',
      bg: 'bg-blue-500/15',
      text: 'text-blue-300',
      border: 'border-blue-500/30',
      icon: AlertTriangle,
    },
    'High': {
      label: 'High Priority',
      bg: 'bg-amber-500/20',
      text: 'text-amber-300',
      border: 'border-amber-500/40',
      icon: ShieldAlert,
    },
    'Critical': {
      label: 'Critical Hazard',
      bg: 'bg-rose-500/20',
      text: 'text-rose-300',
      border: 'border-rose-500/50',
      icon: Flame,
    },
  };

  const current = configMap[priority] || configMap['Medium'];
  const Icon = current.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-bold px-3 py-1.5 gap-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-md border ${current.bg} ${current.text} ${current.border} ${sizeClasses} backdrop-blur-sm`}
    >
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{current.label}</span>
      {score !== undefined && (
        <span className="ml-1 px-1.5 py-0.2 rounded bg-black/30 font-mono text-[10px]">
          {score.toFixed(0)}/100
        </span>
      )}
    </span>
  );
};
