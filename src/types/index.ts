export type ReportCategory =
  | 'Road Damage / Pothole'
  | 'Waterlogging'
  | 'Open Drain / Manhole'
  | 'Fallen Tree'
  | 'Broken Streetlight'
  | 'Electrical Hazard'
  | 'Blocked Footpath'
  | 'Waste Accumulation'
  | 'Other Public Hazard';

export type ReportStatus =
  | 'Submitted'
  | 'Needs Review'
  | 'Verified'
  | 'In Progress'
  | 'Resolved'
  | 'Rejected';

export type ReportPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type UserRole = 'citizen' | 'moderator' | 'admin';

export interface StatusHistoryEvent {
  id: number;
  from_status?: string | null;
  to_status: string;
  changed_by: string;
  notes?: string | null;
  timestamp: string;
}

export interface DuplicateCandidate {
  report_id: number;
  report_code: string;
  title: string;
  category: string;
  general_location: string;
  similarity_score: number;
  distance_km?: number | null;
  status: string;
  match_reasons: string[];
}

export interface AIAnalysisData {
  report_id?: number;
  report_code?: string;
  suggested_category: string;
  suggested_priority: ReportPriority;
  risk_score: number;
  explanation: string;
  duplicates: DuplicateCandidate[];
  recommended_action: string;
  confidence_score: number;
  limitations_note: string;
  provider_name: string;
  is_fallback: boolean;
}

export interface HazardReport {
  id: number;
  report_code: string;
  title: string;
  description: string;
  category: ReportCategory;
  severity: ReportPriority;
  general_location: string;
  landmark?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  image_url?: string | null;
  status: ReportStatus;
  verification_status: 'Unverified' | 'Verified' | 'Rejected';
  ai_suggested_category?: string | null;
  ai_suggested_priority?: ReportPriority | null;
  ai_risk_score: number;
  ai_explanation?: string | null;
  ai_confidence: number;
  is_ai_fallback: boolean;
  ai_duplicate_count: number;
  support_count: number;
  moderator_notes?: string | null;
  resolution_notes?: string | null;
  resolution_evidence_url?: string | null;
  verified_by?: string | null;
  verified_at?: string | null;
  resolved_at?: string | null;
  reporter_name?: string | null;
  is_demo_data: boolean;
  created_at: string;
  updated_at: string;
  status_history: StatusHistoryEvent[];
}

export interface DashboardStats {
  total_reports: number;
  awaiting_review: number;
  verified_hazards: number;
  in_progress: number;
  confirmed_resolutions: number;
  average_review_hours: number;
  category_counts: Record<string, number>;
  severity_counts: Record<string, number>;
  status_counts: Record<string, number>;
  recent_trend: Array<{
    date: string;
    submitted: number;
    resolved: number;
  }>;
  is_demo_mode: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}
