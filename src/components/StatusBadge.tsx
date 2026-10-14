import React from 'react';
import { ReportStatus } from '../types';
import { Clock, AlertCircle, CheckCircle2, RefreshCw, XCircle, ShieldCheck } from 'lucide-react';

interface Props {
  status: ReportStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<Props> = ({ status, size = 'md', showIcon = true }) => {
  const configMap: Record<ReportStatus, { label: string; bg: string; text: string; border: string; icon: any }> = {
    'Submitted': {
      label: 'Submitted',
      bg: 'bg-slate-500/15',
      text: 'text-slate-300',
      border: 'border-slate-500/30',
      icon: Clock,
    },
    'Needs Review': {
      label: 'Needs Review',
      bg: 'bg-amber-500/15',
      text: 'text-amber-300',
      border: 'border-amber-500/30',
      icon: AlertCircle,
    },
    'Verified': {
      label: 'Verified Hazard',
      bg: 'bg-teal-500/20',
      text: 'text-teal-300',
      border: 'border-teal-500/40',
      icon: ShieldCheck,
    },
    'In Progress': {
      label: 'In Progress',
      bg: 'bg-blue-500/15',
      text: 'text-blue-300',
      border: 'border-blue-500/30',
      icon: RefreshCw,
    },
    'Resolved': {
      label: 'Resolved',
      bg: 'bg-emerald-500/20',
      text: 'text-emerald-300',
      border: 'border-emerald-500/40',
      icon: CheckCircle2,
    },
    'Rejected': {
      label: 'Duplicate / Closed',
      bg: 'bg-rose-500/15',
      text: 'text-rose-300',
      border: 'border-rose-500/30',
      icon: XCircle,
    },
  };

  const current = configMap[status] || configMap['Submitted'];
  const Icon = current.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border ${current.bg} ${current.text} ${current.border} ${sizeClasses} backdrop-blur-sm transition-colors`}
    >
      {showIcon && <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{current.label}</span>
    </span>
  );
};
