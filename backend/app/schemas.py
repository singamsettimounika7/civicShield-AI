from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class ReportBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=5)
    category: str
    severity: str = "Medium"
    general_location: str
    landmark: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None
    reporter_name: Optional[str] = "Community Citizen"

class ReportCreate(ReportBase):
    pass

class StatusHistoryResponse(BaseModel):
    id: int
    from_status: Optional[str] = None
    to_status: str
    changed_by: str
    notes: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class AIAnalysisResponse(BaseModel):
    suggested_category: str
    suggested_priority: str
    risk_score: float
    explanation: str
    duplicate_candidates: Optional[str] = None
    recommended_action: str
    confidence_score: float
    limitations_note: str
    provider_name: str
    created_at: datetime

    class Config:
        from_attributes = True

class ReportResponse(ReportBase):
    id: int
    report_code: str
    status: str
    verification_status: str
    ai_suggested_category: Optional[str] = None
    ai_suggested_priority: Optional[str] = None
    ai_risk_score: float
    ai_explanation: Optional[str] = None
    ai_confidence: float
    is_ai_fallback: bool
    ai_duplicate_count: int
    support_count: int
    moderator_notes: Optional[str] = None
    resolution_notes: Optional[str] = None
    resolution_evidence_url: Optional[str] = None
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    is_demo_data: bool
    created_at: datetime
    updated_at: datetime
    status_history: List[StatusHistoryResponse] = []

    class Config:
        from_attributes = True

class ReportUpdateStatus(BaseModel):
    status: str
    verification_status: Optional[str] = None
    moderator_notes: Optional[str] = None
    resolution_notes: Optional[str] = None
    resolution_evidence_url: Optional[str] = None
    moderator_name: Optional[str] = "City Moderator"

class SupportRequest(BaseModel):
    user_identifier: str = "anonymous"

class DuplicateSuggestion(BaseModel):
    report_id: int
    report_code: str
    title: str
    category: str
    general_location: str
    similarity_score: float
    distance_km: Optional[float] = None
    match_reasons: List[str]

class DashboardStats(BaseModel):
    total_reports: int
    awaiting_review: int
    verified_hazards: int
    in_progress: int
    confirmed_resolutions: int
    average_review_hours: float
    category_counts: Dict[str, int]
    severity_counts: Dict[str, int]
    status_counts: Dict[str, int]
    recent_trend: List[Dict[str, Any]]
    is_demo_mode: bool

class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    role: str = "citizen"

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
