import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HelpCircle, 
  MapPin, 
  Cpu, 
  ShieldCheck, 
  Users, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  HeartHandshake, 
  Info,
  ArrowRight
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      num: "01",
      title: "Notice & Document a Hazard",
      desc: "A citizen observes an everyday public hazard such as a deep pothole, open manhole, waterlogged underpass, or snapped wire. They take a safe photograph from a distance.",
      actor: "Community Member",
      icon: MapPin,
    },
    {
      num: "02",
      title: "Submit with Location Details",
      desc: "The citizen provides street context or pins the location on the map. Browser geolocation is accessed only upon explicit user permission.",
      actor: "Citizen Reporter",
      icon: Users,
    },
    {
      num: "03",
      title: "AI Triage & Spatial Duplicate Detection",
      desc: "Our Community Risk Intelligence Engine analyzes severity, category baseline risk, and checks whether similar incidents were submitted within a 500m radius to prevent duplicate work orders.",
      actor: "CivicShield AI Engine",
      icon: Cpu,
    },
    {
      num: "04",
      title: "Ward Moderator Verification",
      desc: "A human safety moderator reviews evidence against local ward parameters, confirms the hazard, and merges any duplicate candidate reports.",
      actor: "Human Safety Moderator",
      icon: ShieldCheck,
    },
    {
      num: "05",
      title: "Public Awareness & Safety Cards",
      desc: "The verified hazard appears on the community map. Neighbors can confirm the observation or generate downloadable safety warning cards to alert commuters.",
      actor: "Entire Neighborhood",
      icon: RefreshCw,
    },
    {
      num: "06",
      title: "Field Action & In-Progress Updates",
      desc: "Municipal road crews or emergency maintenance teams are dispatched. Progress updates (e.g. pumping water, temporary barricades) are logged into the audit timeline.",
      actor: "Field Response Team",
      icon: ClockIcon,
    },
    {
      num: "07",
      title: "Confirmed Resolution with Evidence",
      desc: "The issue is marked resolved only when supported by photographic proof and on-site confirmation that road safety has been restored.",
      actor: "Ward Safety Inspector",
      icon: CheckCircle2,
    },
  ];

  function ClockIcon(props: any) {
    return <RefreshCw {...props} />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-civic-teal/15 text-civic-teal-cyan text-xs font-semibold border border-civic-teal/30">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Workflow & Transparency</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
          How CivicShield AI Works
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          From the moment a hazard is noticed to the confirmed field repair — a clear, human-centered civic lifecycle.
        </p>
      </div>

      {/* Step-by-Step Interactive Timeline */}
      <div className="space-y-6 relative before:absolute before:inset-0 before:left-7 sm:before:left-1/2 before:-translate-x-1/2 before:w-0.5 before:bg-gradient-to-b before:from-civic-teal before:via-white/20 before:to-emerald-500">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          const isEven = idx % 2 === 0;
          return (
            <div 
              key={idx} 
              className={`relative flex flex-col sm:flex-row items-start sm:items-center gap-6 ${
                isEven ? 'sm:flex-row-reverse text-left' : 'text-left'
              }`}
            >
              {/* Content Box */}
              <div className="w-full sm:w-[45%] ml-14 sm:ml-0">
                <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-3 hover:border-civic-teal/40">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-black text-civic-teal-cyan">
                      {item.num}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-teal-300 bg-teal-500/20 px-2.5 py-0.5 rounded border border-teal-500/30">
                      {item.actor}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-white">{item.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                </div>
              </div>

              {/* Center Icon Node */}
              <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-navy-900 border-2 border-civic-teal-cyan shadow-glow-teal flex items-center justify-center text-civic-teal-cyan shrink-0 z-10">
                <Icon className="w-4 h-4" />
              </div>

              {/* Empty Spacer on other side for desktop */}
              <div className="hidden sm:block sm:w-[45%]" />
            </div>
          );
        })}
      </div>

      {/* AI Ethics, Limitations & Privacy Safeguards */}
      <div className="glass-panel rounded-2xl p-8 sm:p-10 border border-white/10 space-y-8">
        
        <div className="border-b border-white/10 pb-4">
          <span className="text-xs font-mono uppercase tracking-widest text-civic-teal-cyan font-bold">Principles & Safety</span>
          <h2 className="font-display font-bold text-2xl text-white mt-1">
            AI Limitations, Privacy & Ethical Reporting
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-5 rounded-xl bg-navy-900/60 border border-white/5 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-white">AI Prioritization Aid Only</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Our AI engine provides preliminary risk scoring and duplicate suggestions. It is <strong>never</strong> a substitute for human physical inspection and does not automatically mark issues resolved.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-navy-900/60 border border-white/5 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-white">Privacy & Address Protection</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              We never expose private home addresses or personal identity details. Geolocation is requested strictly with explicit user consent. General corridor names are displayed publicly.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-navy-900/60 border border-white/5 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-white">Responsible Community Use</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              CivicShield AI is an awareness and civic documentation platform, not an official emergency dispatch service. For life-threatening emergencies, please contact 911 or local emergency services directly.
            </p>
          </div>

        </div>

        {/* Municipal Partnership Clarification */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-400 flex items-start gap-3">
          <Info className="w-4 h-4 text-civic-teal shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Open Civic Technology Notice:</strong> CivicShield AI operates as an independent civic tech awareness platform and demonstration environment. Official partnerships with municipal departments, where established, are explicitly announced per ward jurisdiction.
          </p>
        </div>

      </div>

      {/* Bottom CTA */}
      <div className="text-center space-y-4">
        <h3 className="font-bold text-xl text-white">Ready to help your community?</h3>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/report"
            className="px-6 py-3 rounded-xl bg-civic-teal hover:bg-civic-teal-light text-navy-950 font-bold text-xs uppercase tracking-wider shadow-glow-teal"
          >
            Report a Public Hazard
          </Link>
          <Link
            to="/map"
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10"
          >
            Explore Safety Map
          </Link>
        </div>
      </div>

    </div>
  );
};
