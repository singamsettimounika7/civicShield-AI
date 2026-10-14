import os
import shutil
import uuid
import json
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from .database import engine, Base, get_db
from .models import User, HazardReport, AIAnalysis, ReportStatusHistory, ModeratorAction, CommunityInteraction
from .schemas import (
    ReportCreate, ReportResponse, ReportUpdateStatus, SupportRequest,
    DashboardStats, AIAnalysisResponse, UserLogin, UserRegister,
    UserResponse, TokenResponse
)
from .ai_service import analyze_report_full, classify_hazard_text, find_duplicates, assess_risk_intelligence
from .seed_data import seed_database
from .auth import hash_password, verify_password, create_access_token, get_current_user, require_moderator
from .config import HAS_REAL_AI, GEMINI_API_KEY

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CivicShield AI API",
    description="Intelligent Community Safety & Hazard Reporting Platform",
    version="1.0.0"
)

# Enable CORS for frontend Vite development server & production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Upload directory setup
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.on_event("startup")
def startup_event():
    """Ensure database has initial seed data on startup."""
    db = next(get_db())
    try:
        seed_database(db, force=False)
    finally:
        db.close()


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": "CivicShield AI",
        "version": "1.0.0",
        "ai_provider": "Google Gemini Vision/Text" if HAS_REAL_AI else "CivicShield Community Risk Intelligence Engine (Deterministic Rule Fallback)",
        "has_real_ai": HAS_REAL_AI,
        "mode": "Demonstration & Civic Tech Platform"
    }


# ==================== REPORTS CRUD & WORKFLOW ====================

@app.get("/api/reports", response_model=List[ReportResponse])
def get_reports(
    category: Optional[str] = None,
    status: Optional[str] = None,
    severity: Optional[str] = None,
    search: Optional[str] = None,
    verification: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(HazardReport)

    if category and category != "All":
        query = query.filter(HazardReport.category == category)
    if status and status != "All":
        query = query.filter(HazardReport.status == status)
    if severity and severity != "All":
        query = query.filter(HazardReport.severity == severity)
    if verification and verification != "All":
        query = query.filter(HazardReport.verification_status == verification)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (HazardReport.title.ilike(search_fmt)) |
            (HazardReport.description.ilike(search_fmt)) |
            (HazardReport.general_location.ilike(search_fmt)) |
            (HazardReport.report_code.ilike(search_fmt))
        )

    # Order by priority weight & creation time
    reports = query.order_by(desc(HazardReport.created_at)).offset(offset).limit(limit).all()
    return reports


@app.post("/api/reports", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def create_report(
    report_in: ReportCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    # Generate unique human-readable report code
    count_today = db.query(HazardReport).count() + 101
    code = f"CS-{datetime.utcnow().year}-{count_today:04d}"

    # Get existing reports for duplicate detection
    existing_records = db.query(HazardReport).all()
    existing_list = [
        {
            "id": r.id,
            "report_code": r.report_code,
            "title": r.title,
            "category": r.category,
            "general_location": r.general_location,
            "description": r.description,
            "latitude": r.latitude,
            "longitude": r.longitude,
            "status": r.status
        }
        for r in existing_records
    ]

    # Run AI Analysis & Risk Prioritization
    report_dict = report_in.dict()
    ai_result = analyze_report_full(report_dict, existing_list)

    # Create report record
    new_report = HazardReport(
        report_code=code,
        title=report_in.title,
        description=report_in.description,
        category=report_in.category,
        severity=report_in.severity,
        general_location=report_in.general_location,
        landmark=report_in.landmark,
        latitude=report_in.latitude,
        longitude=report_in.longitude,
        image_url=report_in.image_url,
        status="Submitted",
        verification_status="Unverified",
        ai_suggested_category=ai_result["suggested_category"],
        ai_suggested_priority=ai_result["suggested_priority"],
        ai_risk_score=ai_result["risk_score"],
        ai_explanation=ai_result["explanation"],
        ai_confidence=ai_result["confidence_score"],
        is_ai_fallback=ai_result["is_fallback"],
        ai_duplicate_count=ai_result["duplicate_count"],
        support_count=1,
        reporter_id=current_user.id if current_user else None,
        reporter_name=current_user.name if current_user else report_in.reporter_name,
        is_demo_data=False
    )
    db.add(new_report)
    db.flush()

    # Initial status history event
    history = ReportStatusHistory(
        report_id=new_report.id,
        from_status=None,
        to_status="Submitted",
        changed_by=new_report.reporter_name,
        notes="Hazard report submitted by citizen.",
        timestamp=datetime.utcnow()
    )
    db.add(history)

    # Save detailed AI analysis
    ai_record = AIAnalysis(
        report_id=new_report.id,
        suggested_category=ai_result["suggested_category"],
        suggested_priority=ai_result["suggested_priority"],
        risk_score=ai_result["risk_score"],
        explanation=ai_result["explanation"],
        duplicate_candidates=ai_result["duplicate_candidates"],
        recommended_action=ai_result["recommended_action"],
        confidence_score=ai_result["confidence_score"],
        limitations_note=ai_result["limitations_note"],
        provider_name=ai_result["provider_name"]
    )
    db.add(ai_record)

    db.commit()
    db.refresh(new_report)
    return new_report


@app.get("/api/reports/{identifier}", response_model=ReportResponse)
def get_report(identifier: str, db: Session = Depends(get_db)):
    if identifier.isdigit():
        report = db.query(HazardReport).filter(HazardReport.id == int(identifier)).first()
    else:
        report = db.query(HazardReport).filter(HazardReport.report_code == identifier).first()

    if not report:
        raise HTTPException(status_code=404, detail="Hazard report not found")
    return report


@app.get("/api/reports/{identifier}/ai-analysis")
def get_report_ai_analysis(identifier: str, db: Session = Depends(get_db)):
    if identifier.isdigit():
        report = db.query(HazardReport).filter(HazardReport.id == int(identifier)).first()
    else:
        report = db.query(HazardReport).filter(HazardReport.report_code == identifier).first()

    if not report:
        raise HTTPException(status_code=404, detail="Hazard report not found")

    ai_record = db.query(AIAnalysis).filter(AIAnalysis.report_id == report.id).first()
    duplicates_list = []
    if ai_record and ai_record.duplicate_candidates:
        try:
            duplicates_list = json.loads(ai_record.duplicate_candidates)
        except Exception:
            duplicates_list = []

    return {
        "report_id": report.id,
        "report_code": report.report_code,
        "suggested_category": report.ai_suggested_category or report.category,
        "suggested_priority": report.ai_suggested_priority or "Medium",
        "risk_score": report.ai_risk_score,
        "explanation": report.ai_explanation or "Triage analysis completed.",
        "duplicates": duplicates_list,
        "recommended_action": ai_record.recommended_action if ai_record else "Review by city safety moderator.",
        "confidence_score": report.ai_confidence,
        "limitations_note": ai_record.limitations_note if ai_record else "Preliminary scoring only.",
        "provider_name": ai_record.provider_name if ai_record else "CivicShield Rule Engine",
        "is_fallback": report.is_ai_fallback
    }


@app.patch("/api/reports/{report_id}/status", response_model=ReportResponse)
def update_report_status(
    report_id: int,
    status_update: ReportUpdateStatus,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    report = db.query(HazardReport).filter(HazardReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Hazard report not found")

    old_status = report.status
    report.status = status_update.status

    # Verification status update
    if status_update.verification_status:
        report.verification_status = status_update.verification_status
    elif status_update.status in ["Verified", "In Progress", "Resolved"]:
        report.verification_status = "Verified"
    elif status_update.status in ["Rejected"]:
        report.verification_status = "Rejected"

    # Set timestamps and moderator info
    actor_name = current_user.name if current_user else (status_update.moderator_name or "City Safety Moderator")
    if status_update.status == "Verified" and not report.verified_at:
        report.verified_by = actor_name
        report.verified_at = datetime.utcnow()
    elif status_update.status == "Resolved":
        report.resolved_at = datetime.utcnow()
        if status_update.resolution_notes:
            report.resolution_notes = status_update.resolution_notes
        if status_update.resolution_evidence_url:
            report.resolution_evidence_url = status_update.resolution_evidence_url

    if status_update.moderator_notes:
        report.moderator_notes = status_update.moderator_notes

    # Add audit log to history
    history = ReportStatusHistory(
        report_id=report.id,
        from_status=old_status,
        to_status=status_update.status,
        changed_by=actor_name,
        notes=status_update.moderator_notes or status_update.resolution_notes or f"Status transitioned to {status_update.status}",
        timestamp=datetime.utcnow()
    )
    db.add(history)

    # Log moderator action
    action = ModeratorAction(
        report_id=report.id,
        moderator_id=current_user.id if current_user else None,
        moderator_name=actor_name,
        action_type=status_update.status.lower().replace(" ", "_"),
        notes=status_update.moderator_notes,
        timestamp=datetime.utcnow()
    )
    db.add(action)

    db.commit()
    db.refresh(report)
    return report


@app.post("/api/reports/{report_id}/support")
def support_report(
    report_id: int,
    req: SupportRequest,
    db: Session = Depends(get_db)
):
    report = db.query(HazardReport).filter(HazardReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Hazard report not found")

    # Deduplication check
    existing_interaction = db.query(CommunityInteraction).filter(
        CommunityInteraction.report_id == report_id,
        CommunityInteraction.user_identifier == req.user_identifier
    ).first()

    if existing_interaction:
        return {
            "supported": True,
            "already_recorded": True,
            "support_count": report.support_count,
            "message": "You have already confirmed this hazard."
        }

    # Record interaction
    interaction = CommunityInteraction(
        report_id=report_id,
        user_identifier=req.user_identifier,
        interaction_type="support",
        timestamp=datetime.utcnow()
    )
    db.add(interaction)
    report.support_count += 1
    db.commit()

    return {
        "supported": True,
        "already_recorded": False,
        "support_count": report.support_count,
        "message": "Thank you for confirming this community hazard report."
    }


@app.post("/api/reports/ai-preview")
def ai_preview(data: dict, db: Session = Depends(get_db)):
    """Run interactive preview analysis during report formulation in the multi-step form."""
    title = data.get("title", "")
    description = data.get("description", "")
    category = data.get("category", "Road Damage / Pothole")
    severity = data.get("severity", "Medium")
    location = data.get("general_location", "")
    lat = data.get("latitude")
    lon = data.get("longitude")
    has_photo = bool(data.get("image_url"))

    # Fetch existing reports for duplicate check
    existing = db.query(HazardReport).all()
    existing_list = [
        {
            "id": r.id,
            "report_code": r.report_code,
            "title": r.title,
            "category": r.category,
            "general_location": r.general_location,
            "description": r.description,
            "latitude": r.latitude,
            "longitude": r.longitude,
            "status": r.status
        }
        for r in existing
    ]

    new_dict = {
        "id": None,
        "title": title,
        "description": description,
        "category": category,
        "severity": severity,
        "general_location": location,
        "latitude": lat,
        "longitude": lon,
        "image_url": "yes" if has_photo else None
    }

    result = analyze_report_full(new_dict, existing_list)
    return result


# ==================== COMMUNITY IMPACT DASHBOARD ====================

@app.get("/api/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    total = db.query(HazardReport).count()
    awaiting = db.query(HazardReport).filter(HazardReport.status.in_(["Submitted", "Needs Review"])).count()
    verified = db.query(HazardReport).filter(HazardReport.status == "Verified").count()
    in_progress = db.query(HazardReport).filter(HazardReport.status == "In Progress").count()
    resolved = db.query(HazardReport).filter(HazardReport.status == "Resolved").count()

    # Category counts
    cat_rows = db.query(HazardReport.category, func.count(HazardReport.id)).group_by(HazardReport.category).all()
    category_counts = {cat: count for cat, count in cat_rows}

    # Severity counts
    sev_rows = db.query(HazardReport.severity, func.count(HazardReport.id)).group_by(HazardReport.severity).all()
    severity_counts = {sev: count for sev, count in sev_rows}

    # Status counts
    stat_rows = db.query(HazardReport.status, func.count(HazardReport.id)).group_by(HazardReport.status).all()
    status_counts = {stat: count for stat, count in stat_rows}

    # Calculate average review time for reports that have been verified
    verified_reports = db.query(HazardReport).filter(HazardReport.verified_at.isnot(None)).all()
    if verified_reports:
        total_hours = sum((r.verified_at - r.created_at).total_seconds() / 3600 for r in verified_reports if r.verified_at > r.created_at)
        avg_hours = round(total_hours / len(verified_reports), 1)
    else:
        avg_hours = 4.2

    # Recent 7 days trend
    trend = []
    today = datetime.utcnow().date()
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_start = datetime.combine(day, datetime.min.time())
        day_end = datetime.combine(day, datetime.max.time())
        submitted_cnt = db.query(HazardReport).filter(HazardReport.created_at >= day_start, HazardReport.created_at <= day_end).count()
        resolved_cnt = db.query(HazardReport).filter(HazardReport.resolved_at >= day_start, HazardReport.resolved_at <= day_end).count()
        trend.append({
            "date": day.strftime("%b %d"),
            "submitted": submitted_cnt,
            "resolved": resolved_cnt
        })

    is_demo = db.query(HazardReport).filter(HazardReport.is_demo_data == True).count() > 0

    return DashboardStats(
        total_reports=total,
        awaiting_review=awaiting,
        verified_hazards=verified,
        in_progress=in_progress,
        confirmed_resolutions=resolved,
        average_review_hours=avg_hours,
        category_counts=category_counts,
        severity_counts=severity_counts,
        status_counts=status_counts,
        recent_trend=trend,
        is_demo_mode=is_demo
    )


# ==================== PHOTO UPLOAD & DEMO RESET ====================

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Allowed: JPG, PNG, WebP.")

    ext = os.path.splitext(file.filename)[1].lower() or ".jpg"
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, unique_filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"url": f"/uploads/{unique_filename}", "filename": unique_filename}


@app.post("/api/demo/seed")
def reload_seed_data(force: bool = True, db: Session = Depends(get_db)):
    """Reset or reload demo data without touching user submitted reports."""
    result = seed_database(db, force=force)
    return result


# ==================== AUTHENTICATION & ROLES ====================

@app.post("/api/auth/register", response_model=TokenResponse)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        role=user_in.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return TokenResponse(access_token=token, user=user)


@app.post("/api/auth/login", response_model=TokenResponse)
def login(creds: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == creds.email).first()
    if not user or not verify_password(creds.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return TokenResponse(access_token=token, user=user)


@app.get("/api/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return current_user
