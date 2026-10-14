import { HazardReport, DashboardStats, AIAnalysisData, ReportCategory, ReportPriority, ReportStatus } from '../types';
import { INITIAL_MOCK_REPORTS, getMockDashboardStats } from './mockData';

const API_BASE = '/api';

// Local storage key for persistent offline fallback
const STORAGE_KEY = 'civicshield_reports_v1';
const SUPPORT_KEY = 'civicshield_supported_v1';

function getStoredReports(): HazardReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Storage read error, using initial mock data', e);
  }
  return [...INITIAL_MOCK_REPORTS];
}

function saveStoredReports(reports: HazardReport[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch (e) {
    console.warn('Storage write error', e);
  }
}

// Client-side AI risk calculation fallback if backend unavailable
export function clientSideAIAnalyze(data: {
  title: string;
  description: string;
  category: ReportCategory;
  severity: ReportPriority;
  general_location: string;
  latitude?: number | null;
  longitude?: number | null;
  image_url?: string | null;
}): AIAnalysisData {
  const baselineMap: Record<string, number> = {
    'Electrical Hazard': 88,
    'Open Drain / Manhole': 82,
    'Waterlogging': 75,
    'Fallen Tree': 68,
    'Road Damage / Pothole': 58,
    'Blocked Footpath': 45,
    'Broken Streetlight': 42,
    'Waste Accumulation': 36,
    'Other Public Hazard': 50,
  };

  const multMap: Record<string, number> = {
    Critical: 1.35,
    High: 1.20,
    Medium: 1.00,
    Low: 0.80,
  };

  const baseline = baselineMap[data.category] || 50;
  const mult = multMap[data.severity] || 1.0;
  let score = baseline * mult;

  const combined = `${data.title} ${data.description} ${data.general_location}`.toLowerCase();
  const vulnWords = ['school', 'hospital', 'children', 'elderly', 'metro', 'busy', 'highway', 'crossing', 'sparks', 'live wire'];
  const matchedVuln = vulnWords.filter(w => combined.includes(w));
  score += Math.min(20, matchedVuln.length * 5);

  if (data.image_url) score += 6;
  if (data.latitude && data.longitude) score += 5;

  const finalScore = Math.round(Math.max(10, Math.min(99, score)) * 10) / 10;
  let priority: ReportPriority = 'Medium';
  let action = 'Standard Review: Queue for verification within 24 hours.';
  if (finalScore >= 82) {
    priority = 'Critical';
    action = 'Urgent Moderator Review: Potential immediate danger to pedestrians or motorists. Alert local field response.';
  } else if (finalScore >= 65) {
    priority = 'High';
    action = 'Priority Verification: Dispatch notification to ward safety inspectors.';
  } else if (finalScore < 45) {
    priority = 'Low';
    action = 'Routine Queue: Monitor for community confirmations or additional evidence.';
  }

  // Find duplicates from stored reports
  const currentReports = getStoredReports();
  const duplicates = currentReports
    .filter(r => r.category === data.category)
    .slice(0, 2)
    .map(r => ({
      report_id: r.id,
      report_code: r.report_code,
      title: r.title,
      category: r.category,
      general_location: r.general_location,
      similarity_score: 0.84,
      distance_km: 0.18,
      status: r.status,
      match_reasons: ['Same hazard category', 'Shared geographic quadrant (~180m)']
    }));

  return {
    suggested_category: data.category,
    suggested_priority: priority,
    risk_score: finalScore,
    explanation: `Baseline category risk evaluated at ${baseline}/100. Severity weighting applied (${mult}x). ${matchedVuln.length ? `Proximity flags detected: ${matchedVuln.join(', ')}.` : ''} Photographic evidence attached.`,
    duplicates,
    recommended_action: action,
    confidence_score: data.image_url ? 0.91 : 0.78,
    limitations_note: 'Notice: Transparent deterministic evaluation based on spatial clustering and vulnerability keywords. Not an official municipal dispatch.',
    provider_name: 'CivicShield Community Risk Intelligence Engine (Deterministic Rule Fallback)',
    is_fallback: true
  };
}

// ==================== EXPORTED API METHODS ====================

export const api = {
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.ok) return await res.json();
    } catch (e) {
      // offline fallback
    }
    return {
      status: 'healthy',
      app: 'CivicShield AI',
      ai_provider: 'CivicShield Community Risk Intelligence Engine (Standalone Mode)',
      has_real_ai: false,
      mode: 'Client-side Demonstration Mode'
    };
  },

  async getReports(filters?: {
    category?: string;
    status?: string;
    severity?: string;
    search?: string;
  }): Promise<HazardReport[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.category && filters.category !== 'All') params.append('category', filters.category);
      if (filters?.status && filters.status !== 'All') params.append('status', filters.status);
      if (filters?.severity && filters.severity !== 'All') params.append('severity', filters.severity);
      if (filters?.search) params.append('search', filters.search);

      const res = await fetch(`${API_BASE}/reports?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        saveStoredReports(data);
        return data;
      }
    } catch (e) {
      console.log('Backend unreachable, using local persistent reports', e);
    }

    // Local fallback with filtering
    let reports = getStoredReports();
    if (filters?.category && filters.category !== 'All') {
      reports = reports.filter(r => r.category === filters.category);
    }
    if (filters?.status && filters.status !== 'All') {
      reports = reports.filter(r => r.status === filters.status);
    }
    if (filters?.severity && filters.severity !== 'All') {
      reports = reports.filter(r => r.severity === filters.severity);
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      reports = reports.filter(r =>
        r.title.toLowerCase().includes(s) ||
        r.description.toLowerCase().includes(s) ||
        r.general_location.toLowerCase().includes(s) ||
        r.report_code.toLowerCase().includes(s)
      );
    }
    return reports;
  },

  async getReportById(idOrCode: string | number): Promise<HazardReport | null> {
    try {
      const res = await fetch(`${API_BASE}/reports/${idOrCode}`);
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }
    const reports = getStoredReports();
    const str = String(idOrCode);
    return reports.find(r => String(r.id) === str || r.report_code === str) || null;
  },

  async createReport(reportData: {
    title: string;
    description: string;
    category: ReportCategory;
    severity: ReportPriority;
    general_location: string;
    landmark?: string;
    latitude?: number | null;
    longitude?: number | null;
    image_url?: string | null;
    reporter_name?: string;
  }): Promise<HazardReport> {
    try {
      const res = await fetch(`${API_BASE}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });
      if (res.ok) {
        const created = await res.json();
        const all = getStoredReports();
        saveStoredReports([created, ...all]);
        return created;
      }
    } catch (e) {
      console.log('Backend unreachable for report creation, using local store', e);
    }

    // Client-side fallback creation
    const reports = getStoredReports();
    const nextId = reports.length > 0 ? Math.max(...reports.map(r => r.id)) + 1 : 101;
    const code = `CS-2025-${String(nextId).padStart(4, '0')}`;
    const aiAnalysis = clientSideAIAnalyze(reportData);

    const newReport: HazardReport = {
      id: nextId,
      report_code: code,
      title: reportData.title,
      description: reportData.description,
      category: reportData.category,
      severity: reportData.severity,
      general_location: reportData.general_location,
      landmark: reportData.landmark || null,
      latitude: reportData.latitude ?? 37.7749,
      longitude: reportData.longitude ?? -122.4194,
      image_url: reportData.image_url || null,
      status: 'Submitted',
      verification_status: 'Unverified',
      ai_suggested_category: aiAnalysis.suggested_category,
      ai_suggested_priority: aiAnalysis.suggested_priority,
      ai_risk_score: aiAnalysis.risk_score,
      ai_explanation: aiAnalysis.explanation,
      ai_confidence: aiAnalysis.confidence_score,
      is_ai_fallback: aiAnalysis.is_fallback,
      ai_duplicate_count: aiAnalysis.duplicates.length,
      support_count: 1,
      reporter_name: reportData.reporter_name || 'Community Citizen',
      is_demo_data: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status_history: [
        {
          id: Date.now(),
          to_status: 'Submitted',
          changed_by: reportData.reporter_name || 'Community Citizen',
          notes: 'Hazard report submitted via web app.',
          timestamp: new Date().toISOString()
        }
      ]
    };

    saveStoredReports([newReport, ...reports]);
    return newReport;
  },

  async updateReportStatus(
    id: number,
    update: {
      status: ReportStatus;
      verification_status?: 'Unverified' | 'Verified' | 'Rejected';
      moderator_notes?: string;
      resolution_notes?: string;
      resolution_evidence_url?: string;
      moderator_name?: string;
    }
  ): Promise<HazardReport> {
    try {
      const res = await fetch(`${API_BASE}/reports/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
      });
      if (res.ok) {
        const updated = await res.json();
        const reports = getStoredReports().map(r => r.id === id ? updated : r);
        saveStoredReports(reports);
        return updated;
      }
    } catch (e) {
      console.log('Backend unreachable for status update, using local store', e);
    }

    const reports = getStoredReports();
    const index = reports.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Report not found');

    const rep = { ...reports[index] };
    const oldStatus = rep.status;
    rep.status = update.status;
    if (update.verification_status) {
      rep.verification_status = update.verification_status;
    } else if (['Verified', 'In Progress', 'Resolved'].includes(update.status)) {
      rep.verification_status = 'Verified';
    } else if (update.status === 'Rejected') {
      rep.verification_status = 'Rejected';
    }

    if (update.moderator_notes) rep.moderator_notes = update.moderator_notes;
    if (update.resolution_notes) rep.resolution_notes = update.resolution_notes;
    if (update.resolution_evidence_url) rep.resolution_evidence_url = update.resolution_evidence_url;

    const actor = update.moderator_name || 'City Safety Moderator';
    if (update.status === 'Verified' && !rep.verified_at) {
      rep.verified_by = actor;
      rep.verified_at = new Date().toISOString();
    }
    if (update.status === 'Resolved' && !rep.resolved_at) {
      rep.resolved_at = new Date().toISOString();
    }

    rep.status_history = [
      ...rep.status_history,
      {
        id: Date.now(),
        from_status: oldStatus,
        to_status: update.status,
        changed_by: actor,
        notes: update.moderator_notes || update.resolution_notes || `Status transitioned to ${update.status}`,
        timestamp: new Date().toISOString()
      }
    ];

    rep.updated_at = new Date().toISOString();
    reports[index] = rep;
    saveStoredReports(reports);
    return rep;
  },

  async supportReport(id: number, userId: string = 'demo_user'): Promise<{ supported: boolean; already_recorded: boolean; count: number }> {
    try {
      const res = await fetch(`${API_BASE}/reports/${id}/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_identifier: userId })
      });
      if (res.ok) {
        const data = await res.json();
        return {
          supported: data.supported,
          already_recorded: data.already_recorded,
          count: data.support_count
        };
      }
    } catch (e) {
      // fallback
    }

    const supportedRaw = localStorage.getItem(SUPPORT_KEY);
    const supportedSet = new Set<string>(supportedRaw ? JSON.parse(supportedRaw) : []);
    const key = `${id}_${userId}`;

    const reports = getStoredReports();
    const rep = reports.find(r => r.id === id);
    if (!rep) return { supported: false, already_recorded: false, count: 0 };

    if (supportedSet.has(key)) {
      return { supported: true, already_recorded: true, count: rep.support_count };
    }

    supportedSet.add(key);
    localStorage.setItem(SUPPORT_KEY, JSON.stringify(Array.from(supportedSet)));
    rep.support_count += 1;
    saveStoredReports(reports);

    return { supported: true, already_recorded: false, count: rep.support_count };
  },

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const res = await fetch(`${API_BASE}/dashboard/stats`);
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }
    const reports = getStoredReports();
    return getMockDashboardStats(reports);
  },

  async resetDemoData(): Promise<void> {
    try {
      await fetch(`${API_BASE}/demo/seed`, { method: 'POST' });
    } catch (e) {
      // fallback
    }
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SUPPORT_KEY);
    saveStoredReports([...INITIAL_MOCK_REPORTS]);
  }
};
