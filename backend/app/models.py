from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="citizen")  # citizen, moderator, admin
    created_at = Column(DateTime, default=datetime.utcnow)

    reports = relationship("HazardReport", back_populates="reporter")


class HazardReport(Base):
    __tablename__ = "hazard_reports"

    id = Column(Integer, primary_key=True, index=True)
    report_code = Column(String(20), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)  # Road Damage, Waterlogging, Open Drain, etc.
    severity = Column(String(50), default="Medium")  # Low, Medium, High, Critical
    
    # Location
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    general_location = Column(String(255), nullable=False)
    landmark = Column(String(255), nullable=True)

    # Evidence
    image_url = Column(String(500), nullable=True)
    
    # Status
    status = Column(String(50), default="Submitted")  # Submitted, Needs Review, Verified, In Progress, Resolved, Rejected
    verification_status = Column(String(50), default="Unverified")  # Unverified, Verified, Rejected
    
    # AI Analysis fields
    ai_suggested_category = Column(String(100), nullable=True)
    ai_suggested_priority = Column(String(50), nullable=True)
    ai_risk_score = Column(Float, default=50.0)
    ai_explanation = Column(Text, nullable=True)
    ai_confidence = Column(Float, default=0.85)
    is_ai_fallback = Column(Boolean, default=True)
    ai_duplicate_count = Column(Integer, default=0)
    
    # Community & Moderation
    support_count = Column(Integer, default=1)
    moderator_notes = Column(Text, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    resolution_evidence_url = Column(String(500), nullable=True)
    verified_by = Column(String(120), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    
    # Meta
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reporter_name = Column(String(120), default="Community Citizen")
    is_demo_data = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    reporter = relationship("User", back_populates="reports")
    status_history = relationship("ReportStatusHistory", back_populates="report", cascade="all, delete-orphan")
    ai_analysis_record = relationship("AIAnalysis", back_populates="report", uselist=False, cascade="all, delete-orphan")
    moderator_actions = relationship("ModeratorAction", back_populates="report", cascade="all, delete-orphan")


class AIAnalysis(Base):
    __tablename__ = "ai_analyses"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("hazard_reports.id"), nullable=False)
    suggested_category = Column(String(100), nullable=False)
    suggested_priority = Column(String(50), nullable=False)
    risk_score = Column(Float, default=50.0)
    explanation = Column(Text, nullable=False)
    duplicate_candidates = Column(Text, nullable=True)  # JSON string
    recommended_action = Column(String(255), nullable=False)
    confidence_score = Column(Float, default=0.88)
    limitations_note = Column(Text, nullable=False)
    provider_name = Column(String(100), default="CivicShield Deterministic Rule Engine")
    created_at = Column(DateTime, default=datetime.utcnow)

    report = relationship("HazardReport", back_populates="ai_analysis_record")


class ReportStatusHistory(Base):
    __tablename__ = "report_status_history"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("hazard_reports.id"), nullable=False)
    from_status = Column(String(50), nullable=True)
    to_status = Column(String(50), nullable=False)
    changed_by = Column(String(120), default="System")
    notes = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    report = relationship("HazardReport", back_populates="status_history")


class ModeratorAction(Base):
    __tablename__ = "moderator_actions"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("hazard_reports.id"), nullable=False)
    moderator_id = Column(Integer, nullable=True)
    moderator_name = Column(String(120), nullable=False)
    action_type = Column(String(50), nullable=False)  # verify, reject, prioritize, duplicate_link, status_update, resolve
    notes = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    report = relationship("HazardReport", back_populates="moderator_actions")


class CommunityInteraction(Base):
    __tablename__ = "community_interactions"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("hazard_reports.id"), nullable=False)
    user_identifier = Column(String(120), nullable=False)  # IP or user session token
    interaction_type = Column(String(50), default="support")  # support, observe
    timestamp = Column(DateTime, default=datetime.utcnow)
