import React, { useRef, useState } from 'react';
import { HazardReport } from '../types';
import { 
  X, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  ShieldAlert, 
  MapPin, 
  Calendar, 
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface Props {
  report: HazardReport | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyCardModal: React.FC<Props> = ({ report, isOpen, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen || !report) return null;

  const reportUrl = `${window.location.origin}/reports/${report.id}`;
  const isVerified = report.verification_status === 'Verified';

  const captionText = `Community Safety Update: A ${report.category.toLowerCase()} hazard has been reported near ${report.general_location}. Current Status: ${report.status} (${isVerified ? 'Verified by City Moderator' : 'Awaiting Community Verification'}). Check the latest status before traveling. Report ID: ${report.report_code} • CivicShield AI`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(reportUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(captionText);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const handleDownloadPNG = async () => {
    setIsGenerating(true);
    try {
      // Use HTML5 Canvas to render high-res safety card directly
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 1200;
      canvas.height = 675; // 16:9 social landscape

      // Background Gradient
      const grad = ctx.createLinearGradient(0, 0, 1200, 675);
      grad.addColorStop(0, '#060B18');
      grad.addColorStop(1, '#0B132B');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 675);

      // Border glow
      ctx.strokeStyle = isVerified ? '#0D9488' : '#F59E0B';
      ctx.lineWidth = 8;
      ctx.strokeRect(20, 20, 1160, 635);

      // Branding Header
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('CivicShield AI • Community Safety Card', 60, 90);

      ctx.fillStyle = '#14B8A6';
      ctx.font = '20px sans-serif';
      ctx.fillText('“Spot the Risk. Alert the Community. Prevent the Harm.”', 60, 130);

      // Report Code & Status
      ctx.fillStyle = '#2DD4BF';
      ctx.font = 'bold 26px monospace';
      ctx.fillText(`REPORT: ${report.report_code}`, 60, 200);

      ctx.fillStyle = isVerified ? '#10B981' : '#F59E0B';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(`STATUS: ${report.status.toUpperCase()} (${report.verification_status.toUpperCase()})`, 60, 240);

      // Hazard Category & Title
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 44px sans-serif';
      const cleanTitle = report.title.length > 45 ? report.title.substring(0, 42) + '...' : report.title;
      ctx.fillText(cleanTitle, 60, 320);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '24px sans-serif';
      ctx.fillText(`Category: ${report.category} • Assessed Priority: ${report.severity}`, 60, 370);

      // Location
      ctx.fillStyle = '#CBD5E1';
      ctx.font = '28px sans-serif';
      ctx.fillText(`📍 Location: ${report.general_location}`, 60, 430);

      // Safety Information / Advisory
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(60, 470, 1080, 100);
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(60, 470, 1080, 100);

      ctx.fillStyle = '#F8FAFC';
      ctx.font = '20px sans-serif';
      ctx.fillText('Advisory: Exercise caution if navigating this corridor. Slow down near work zones.', 85, 515);
      ctx.font = '16px sans-serif';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText('Community reporting tool. Not an official municipal dispatch. In life-threatening emergencies, call 911.', 85, 545);

      // Footer
      ctx.fillStyle = '#64748B';
      ctx.font = '18px monospace';
      ctx.fillText(`Verified details & live updates: ${window.location.origin}/reports/${report.id}`, 60, 620);

      // Download
      const link = document.createElement('a');
      link.download = `CivicShield-SafetyCard-${report.report_code}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Error generating card image', e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl glass-panel rounded-2xl border border-white/10 p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-civic-teal-cyan" />
            <h3 className="text-lg font-bold text-white">Share Community Safety Card</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Card Preview */}
        <div 
          ref={cardRef} 
          className="rounded-xl p-5 border border-civic-teal/40 bg-gradient-to-br from-navy-900 to-navy-950 shadow-glow-teal space-y-4 text-white relative overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-civic-teal-cyan" />
              <span className="font-display font-bold text-sm tracking-tight">
                CivicShield <span className="text-civic-teal-cyan">AI</span> Safety Notice
              </span>
            </div>
            <span className="font-mono text-xs text-civic-teal-cyan bg-civic-teal/20 px-2 py-0.5 rounded border border-civic-teal/40">
              {report.report_code}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-slate-400">{report.category}</span>
              <span className="text-xs text-slate-500">•</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${isVerified ? 'bg-teal-500/20 text-teal-300' : 'bg-amber-500/20 text-amber-300'}`}>
                {report.status} ({report.verification_status})
              </span>
            </div>
            <h4 className="text-lg font-bold text-white leading-snug">{report.title}</h4>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300 bg-white/5 p-2.5 rounded-lg border border-white/5">
            <MapPin className="w-4 h-4 text-civic-teal shrink-0" />
            <span className="line-clamp-1">{report.general_location}</span>
          </div>

          <p className="text-xs text-slate-300 bg-navy-950/80 p-3 rounded-lg border border-white/5 leading-relaxed">
            {report.description}
          </p>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5">
            <span>Scan or visit CivicShield to track progress</span>
            <span>Issued by Community Watch</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleDownloadPNG}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-civic-teal hover:bg-civic-teal-light text-navy-950 font-bold text-xs uppercase tracking-wider shadow-glow-teal transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Rendering...' : 'Download PNG Card'}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs border border-white/10 transition-colors"
            >
              {copiedLink ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Direct Report Link'}</span>
            </button>
          </div>

          {/* WhatsApp / Social Media Caption Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-medium">Ready-to-Share Caption (WhatsApp / SMS / Social):</span>
              <button
                onClick={handleCopyCaption}
                className="text-civic-teal-cyan hover:underline flex items-center gap-1 text-xs"
              >
                {copiedCaption ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCaption ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>
            <textarea
              readOnly
              rows={3}
              value={captionText}
              className="w-full text-xs font-mono glass-input rounded-lg p-2.5 text-slate-300 select-all"
            />
          </div>

        </div>

      </div>
    </div>
  );
};
