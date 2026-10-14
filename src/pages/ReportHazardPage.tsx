import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ReportCategory, ReportPriority, HazardReport, AIAnalysisData } from '../types';
import { api, clientSideAIAnalyze } from '../services/api';
import { MapView } from '../components/MapView';
import { AIAnalysisCard } from '../components/AIAnalysisCard';
import { StatusBadge } from '../components/StatusBadge';
import { 
  AlertTriangle, 
  Camera, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  Upload, 
  X, 
  Sparkles, 
  ShieldAlert, 
  Navigation, 
  ArrowLeft, 
  ArrowRight,
  Info,
  Check,
  AlertOctagon,
  Image as ImageIcon
} from 'lucide-react';

const CATEGORIES: Array<{ name: ReportCategory; icon: string; desc: string }> = [
  { name: 'Road Damage / Pothole', icon: '🕳️', desc: 'Asphalt craters, depressions, cave-ins' },
  { name: 'Waterlogging', icon: '🌊', desc: 'Flooded streets, submerged underpasses' },
  { name: 'Open Drain / Manhole', icon: '⚠️', desc: 'Missing or broken sewer lids, fall hazard' },
  { name: 'Electrical Hazard', icon: '⚡', desc: 'Live snapped cables, sparking poles' },
  { name: 'Fallen Tree', icon: '🌳', desc: 'Uprooted trunks, snapped large branches' },
  { name: 'Broken Streetlight', icon: '💡', desc: 'Unlit pedestrian intersections, dark roads' },
  { name: 'Blocked Footpath', icon: '🚶', desc: 'Encroachments forcing walkers to roadway' },
  { name: 'Waste Accumulation', icon: '🗑️', desc: 'Overflowing garbage dumping onto transit path' },
  { name: 'Other Public Hazard', icon: '🚨', desc: 'Other physical neighborhood safety issue' },
];

const PRESET_SAMPLE_PHOTOS = [
  { label: "Pothole Crater", url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80" },
  { label: "Waterlogged Road", url: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80" },
  { label: "Open Manhole", url: "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80" },
  { label: "Snapped Wires", url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80" },
];

export const ReportHazardPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [createdReport, setCreatedReport] = useState<HazardReport | null>(null);

  // Form State
  const [category, setCategory] = useState<ReportCategory>('Road Damage / Pothole');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [severity, setSeverity] = useState<ReportPriority>('Medium');
  const [generalLocation, setGeneralLocation] = useState<string>('');
  const [landmark, setLandmark] = useState<string>('');
  const [lat, setLat] = useState<number>(37.7749);
  const [lon, setLon] = useState<number>(-122.4194);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [reporterName, setReporterName] = useState<string>('Community Citizen');
  const [geolocationActive, setGeolocationActive] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Real-time AI preview calculation
  const [aiPreview, setAiPreview] = useState<AIAnalysisData | null>(null);

  // Auto calculate AI preview whenever user enters details
  useEffect(() => {
    if (title || description) {
      const analysis = clientSideAIAnalyze({
        title,
        description,
        category,
        severity,
        general_location: generalLocation,
        latitude: lat,
        longitude: lon,
        image_url: imageUrl
      });
      setAiPreview(analysis);
    }
  }, [title, description, category, severity, generalLocation, lat, lon, imageUrl]);

  // Handle image upload from file or preset
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrors({ ...errors, image: 'Please upload JPG, PNG, or WebP only.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: 'Image size should be under 5MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result as string);
      setErrors({ ...errors, image: '' });
    };
    reader.readAsDataURL(file);
  };

  const handleRequestGeolocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLon(pos.coords.longitude);
          setGeolocationActive(true);
          if (!generalLocation) {
            setGeneralLocation(`GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
          }
        },
        (err) => {
          console.warn('Geolocation denied or unavailable', err);
          alert('GPS permission was denied or is unavailable. You can pin location manually on the map.');
        }
      );
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!category) newErrors.category = 'Please select a hazard category.';
    } else if (currentStep === 3) {
      if (!generalLocation.trim()) {
        newErrors.location = 'Please provide a neighborhood or road description.';
      }
    } else if (currentStep === 4) {
      if (!title.trim() || title.length < 5) {
        newErrors.title = 'Title must be at least 5 characters.';
      }
      if (!description.trim() || description.length < 15) {
        newErrors.description = 'Please provide at least 15 characters describing the hazard.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(s => Math.min(5, s + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setStep(s => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setSubmitting(true);
    try {
      const created = await api.createReport({
        title,
        description,
        category,
        severity,
        general_location: generalLocation,
        landmark,
        latitude: lat,
        longitude: lon,
        image_url: imageUrl || null,
        reporter_name: reporterName
      });
      setCreatedReport(created);
    } catch (err) {
      console.error(err);
      alert('Error submitting report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-civic-teal/15 text-civic-teal-cyan text-xs font-semibold border border-civic-teal/30">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Public Safety Contribution</span>
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-white">
          Report a Public Hazard
        </h1>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Help neighbors navigate safely and alert city moderators. AI will assist with duplicate detection and risk prioritization.
        </p>
      </div>

      {/* SUCCESS SCREEN */}
      {createdReport ? (
        <div className="glass-panel rounded-2xl p-8 sm:p-12 border border-civic-teal/50 shadow-glow-teal text-center space-y-6 animate-in fade-in duration-300">
          
          <div className="w-16 h-16 rounded-full bg-teal-500/20 border-2 border-teal-400 flex items-center justify-center mx-auto shadow-glow-teal">
            <CheckCircle2 className="w-8 h-8 text-teal-300" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-civic-teal-cyan font-bold">
              Report Successfully Recorded
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
              Thank You for Speaking Up!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
              Your report has been logged to the database and queued for safety verification.
            </p>
          </div>

          {/* Report Summary Card */}
          <div className="max-w-md mx-auto glass-card rounded-xl p-5 border border-white/10 text-left space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs text-slate-400">Assigned Report ID:</span>
              <span className="font-mono text-sm font-bold text-civic-teal-cyan bg-civic-teal/15 px-2 py-0.5 rounded border border-civic-teal/30">
                {createdReport.report_code}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Current Status:</span>
              <StatusBadge status={createdReport.status} size="sm" />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Assessed Priority:</span>
              <span className="font-semibold text-white">{createdReport.severity} ({createdReport.ai_risk_score}/100)</span>
            </div>

            <div className="text-xs text-slate-300 pt-1">
              <strong>Location:</strong> {createdReport.general_location}
            </div>

            <p className="text-[11px] text-slate-400 border-t border-white/5 pt-2">
              A human ward moderator will verify the photographic evidence before dispatching field work orders.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              to={`/reports/${createdReport.id}`}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-civic-teal hover:bg-civic-teal-light text-navy-950 font-bold text-xs uppercase tracking-wider shadow-glow-teal transition-all"
            >
              View Full Report & Timeline
            </Link>
            <Link
              to="/map"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 transition-colors"
            >
              Return to Community Map
            </Link>
          </div>

        </div>
      ) : (

        /* MULTI-STEP REPORT WIZARD */
        <div className="space-y-6">
          
          {/* Step Indicator Progress Bar */}
          <div className="glass-panel rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-slate-200">Step {step} of 5</span>
              <span className="text-civic-teal-cyan font-mono">
                {step === 1 && 'Select Category'}
                {step === 2 && 'Upload Evidence'}
                {step === 3 && 'Pin Location'}
                {step === 4 && 'Details & Impact'}
                {step === 5 && 'AI Triage & Review'}
              </span>
            </div>

            {/* Visual Step Dots */}
            <div className="w-full bg-navy-900 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-civic-teal to-civic-teal-cyan h-full transition-all duration-300"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Form Container */}
          <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
            
            {/* STEP 1: CATEGORY SELECTION */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-white">Step 1: Select Hazard Category</h3>
                  <p className="text-xs text-slate-300">
                    What type of public infrastructure danger or road obstruction did you observe?
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat.name;
                    return (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => {
                          setCategory(cat.name);
                          if (!title) setTitle(`${cat.name} observed on roadway`);
                        }}
                        className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                          isSelected
                            ? 'bg-civic-teal/20 border-civic-teal-cyan shadow-glow-teal text-white'
                            : 'bg-navy-900/60 border-white/10 text-slate-300 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{cat.icon}</span>
                          {isSelected && <Check className="w-4 h-4 text-civic-teal-cyan" />}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-white">{cat.name}</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">{cat.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: EVIDENCE UPLOAD */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-white">Step 2: Upload Evidence (Photo)</h3>
                  <p className="text-xs text-slate-300">
                    Photographic proof significantly speeds up municipal verification.
                  </p>
                </div>

                {/* Safety Warning */}
                <div className="p-3 rounded-lg bg-amber-500/15 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5">
                  <AlertOctagon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Personal Safety Rule:</strong> Never approach a dangerous hazard, live electrical cable, or deep flowing water to obtain a photograph. Keep a safe distance at all times.
                  </span>
                </div>

                {/* Image Upload Area */}
                <div className="space-y-4">
                  {imageUrl ? (
                    <div className="relative rounded-xl overflow-hidden border border-civic-teal/40 h-64 bg-navy-900">
                      <img src={imageUrl} alt="Uploaded evidence" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/70 hover:bg-black text-white"
                        title="Remove photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-white/20 hover:border-civic-teal rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-navy-900/40 hover:bg-navy-900/70 transition-all space-y-3">
                      <div className="w-12 h-12 rounded-full bg-civic-teal/15 flex items-center justify-center text-civic-teal-cyan">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="font-semibold text-sm text-white">Click to upload photo evidence</span>
                        <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, WebP up to 5MB</p>
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}

                  {errors.image && <p className="text-xs text-rose-400">{errors.image}</p>}

                  {/* Preset Sample Photos for Fast Demo Testing */}
                  <div className="pt-2">
                    <span className="text-xs text-slate-400 font-medium block mb-2">
                      Or select a demo hazard photograph for testing:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {PRESET_SAMPLE_PHOTOS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setImageUrl(p.url)}
                          className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 text-left transition-colors"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-civic-teal-cyan shrink-0" />
                          <span className="truncate">{p.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: LOCATION PINNING */}
            {step === 3 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-white">Step 3: Location Details</h3>
                  <p className="text-xs text-slate-300">
                    Pin the hazard on the map or describe the street intersection.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      General Location / Street Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Elmwood Ave, near Transit Bus Stop #4"
                      value={generalLocation}
                      onChange={(e) => setGeneralLocation(e.target.value)}
                      className="w-full glass-input rounded-lg p-2.5 text-xs"
                    />
                    {errors.location && <p className="text-xs text-rose-400">{errors.location}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Nearby Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Opposite Community Library or Gate #2"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full glass-input rounded-lg p-2.5 text-xs"
                    />
                  </div>
                </div>

                {/* GPS Trigger Button */}
                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={handleRequestGeolocation}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                  >
                    <Navigation className="w-3.5 h-3.5 text-civic-teal-cyan" />
                    <span>{geolocationActive ? 'GPS Coordinates Acquired' : 'Use My Current Location'}</span>
                  </button>

                  <span className="font-mono text-[11px] text-slate-400">
                    Coordinates: {lat.toFixed(4)}, {lon.toFixed(4)}
                  </span>
                </div>

                {/* Interactive Map for Pinning */}
                <div className="space-y-1">
                  <span className="text-xs text-slate-400">Click anywhere on map to reposition pin:</span>
                  <MapView
                    reports={[]}
                    interactiveSelectLocation={true}
                    onLocationSelect={(newLat, newLon) => {
                      setLat(newLat);
                      setLon(newLon);
                    }}
                    height="320px"
                  />
                </div>
              </div>
            )}

            {/* STEP 4: DETAILS & SEVERITY */}
            {step === 4 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-white">Step 4: Hazard Details & Impact</h3>
                  <p className="text-xs text-slate-300">
                    Provide context to help moderators prioritize emergency response.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Report Title <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Deep pothole damaging bike tires outside Oakridge School"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full glass-input rounded-lg p-2.5 text-xs font-medium"
                    />
                    {errors.title && <p className="text-xs text-rose-400">{errors.title}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Detailed Description <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Describe what you saw, approximate size, impact on pedestrian or vehicular traffic, and whether rain/lighting exacerbates the risk..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full glass-input rounded-lg p-2.5 text-xs"
                    />
                    {errors.description && <p className="text-xs text-rose-400">{errors.description}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        Observed Severity Level
                      </label>
                      <select
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value as ReportPriority)}
                        className="w-full glass-input rounded-lg p-2.5 text-xs"
                      >
                        <option value="Low" className="bg-navy-900">Low — Minor inconvenience</option>
                        <option value="Medium" className="bg-navy-900">Medium — Obstruction, slow traffic</option>
                        <option value="High" className="bg-navy-900">High — Potential vehicle damage or minor injury risk</option>
                        <option value="Critical" className="bg-navy-900">Critical — Immediate injury or severe accident hazard</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        Your Name / Handle
                      </label>
                      <input
                        type="text"
                        value={reporterName}
                        onChange={(e) => setReporterName(e.target.value)}
                        className="w-full glass-input rounded-lg p-2.5 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: REVIEW & AI TRIAGE PREVIEW */}
            {step === 5 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-white">Step 5: Review & AI Triage Evaluation</h3>
                  <p className="text-xs text-slate-300">
                    Verify all submission details. Our Community Risk Intelligence Engine has triaged your report:
                  </p>
                </div>

                {/* AI Analysis Live Card */}
                {aiPreview && (
                  <AIAnalysisCard analysis={aiPreview} />
                )}

                {/* Summary Box */}
                <div className="glass-card rounded-xl p-4 border border-white/10 space-y-3 text-xs">
                  <h4 className="font-semibold text-sm text-white border-b border-white/10 pb-2">
                    Submission Summary
                  </h4>

                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div><strong>Category:</strong> {category}</div>
                    <div><strong>Severity:</strong> {severity}</div>
                    <div className="col-span-2"><strong>Title:</strong> {title}</div>
                    <div className="col-span-2"><strong>Location:</strong> {generalLocation}</div>
                    {landmark && <div className="col-span-2"><strong>Landmark:</strong> {landmark}</div>}
                    <div><strong>GPS:</strong> {lat.toFixed(4)}, {lon.toFixed(4)}</div>
                    <div><strong>Evidence Attached:</strong> {imageUrl ? 'Yes (Photo)' : 'No'}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 border border-white/10"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
              ) : (
                <div />
              )}

              {step < 5 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-civic-teal hover:bg-civic-teal-light text-navy-950 font-bold text-xs uppercase tracking-wider shadow-glow-teal"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-civic-teal to-teal-400 hover:from-teal-400 hover:to-civic-teal text-navy-950 font-extrabold text-xs uppercase tracking-wider shadow-glow-teal transition-all active:scale-95 disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Submitting & Triaging...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                      <span>Confirm & Submit Report</span>
                    </>
                  )}
                </button>
              )}
            </div>

          </form>

        </div>
      )}

    </div>
  );
};
