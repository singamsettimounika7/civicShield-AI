import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .models import User, HazardReport, AIAnalysis, ReportStatusHistory
from .auth import hash_password

SAMPLE_REPORTS = [
    {
        "report_code": "CS-2025-0101",
        "title": "Severe Pothole Cluster on Oakridge Main Road",
        "description": "Deep asphalt crater roughly 1.5m across right in front of Oakridge Community School. Two two-wheelers skidded this morning during rush hour. Immediate patching needed before rain fills it.",
        "category": "Road Damage / Pothole",
        "severity": "High",
        "general_location": "Oakridge District, Near School Gate #2",
        "landmark": "Opposite Oakridge High School",
        "latitude": 37.7749,
        "longitude": -122.4194,
        "image_url": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
        "status": "Verified",
        "verification_status": "Verified",
        "ai_suggested_category": "Road Damage / Pothole",
        "ai_suggested_priority": "High",
        "ai_risk_score": 78.5,
        "ai_explanation": "Category baseline risk evaluated at 58/100. High severity multiplier applied (1.2x). Detected sensitive proximity indicator: 'school', 'rush hour'. Photographic evidence attached increases credibility.",
        "ai_confidence": 0.92,
        "is_ai_fallback": True,
        "ai_duplicate_count": 1,
        "support_count": 14,
        "moderator_notes": "Verified on-site by Ward Field Inspector Martinez. School administration notified.",
        "resolution_notes": None,
        "verified_by": "Officer Elena Vance (Ward Inspector)",
        "verified_at": datetime.utcnow() - timedelta(days=2),
        "created_at": datetime.utcnow() - timedelta(days=3),
        "is_demo_data": True
    },
    {
        "report_code": "CS-2025-0102",
        "title": "Large Crater near Oakridge School Pedestrian Crossing",
        "description": "Vehicle damaged tires on a massive depression in the road 80 meters from Oakridge School gate. Cars swerving dangerously into oncoming traffic.",
        "category": "Road Damage / Pothole",
        "severity": "High",
        "general_location": "Oakridge District, 100m West of School Crossing",
        "landmark": "Near Blue Horizon Cafe",
        "latitude": 37.7758,
        "longitude": -122.4208,
        "image_url": "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f9?auto=format&fit=crop&w=800&q=80",
        "status": "Submitted",
        "verification_status": "Unverified",
        "ai_suggested_category": "Road Damage / Pothole",
        "ai_suggested_priority": "High",
        "ai_risk_score": 76.0,
        "ai_explanation": "Category baseline risk for 'Road Damage / Pothole' evaluated at 58/100. Potential duplicate candidate detected within 180m radius of Oakridge Main Road report CS-2025-0101.",
        "ai_confidence": 0.88,
        "is_ai_fallback": True,
        "ai_duplicate_count": 1,
        "support_count": 6,
        "moderator_notes": "AI flagged as potential duplicate of CS-2025-0101. Awaiting merge or secondary verification.",
        "created_at": datetime.utcnow() - timedelta(hours=6),
        "is_demo_data": True
    },
    {
        "report_code": "CS-2025-0103",
        "title": "Submerged Underpass & Rising Waterlogged Carriageway",
        "description": "Storm drain blockage caused over 1.5 feet of stagnant flood water at Riverfront Transit Underpass. Bus service redirected, compact cars stalling in middle.",
        "category": "Waterlogging",
        "severity": "Critical",
        "general_location": "Riverfront Sector, Metro Underpass #4",
        "landmark": "Adjacent to Central Metro Line Entry",
        "latitude": 37.7810,
        "longitude": -122.4080,
        "image_url": "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
        "status": "In Progress",
        "verification_status": "Verified",
        "ai_suggested_category": "Waterlogging",
        "ai_suggested_priority": "Critical",
        "ai_risk_score": 93.0,
        "ai_explanation": "Category baseline risk for 'Waterlogging' evaluated at 75/100. Critical multiplier (1.35x). Sensitive proximity: 'metro', 'underpass', 'transit'. Urgent public transit impact.",
        "ai_confidence": 0.94,
        "is_ai_fallback": True,
        "ai_duplicate_count": 3,
        "support_count": 28,
        "moderator_notes": "High priority emergency alert dispatched to Municipal Drainage Unit.",
        "resolution_notes": "Municipal de-watering high-capacity pumps operating. Water level reduced by 8 inches. Crew clearing drain grates.",
        "verified_by": "Lead Moderator Sarah Jenkins",
        "verified_at": datetime.utcnow() - timedelta(days=1),
        "created_at": datetime.utcnow() - timedelta(days=1, hours=8),
        "is_demo_data": True
    },
    {
        "report_code": "CS-2025-0104",
        "title": "Uncovered Storm Manhole on Pedestrian Sidewalk",
        "description": "Metal manhole cover broken or stolen. Open 6-foot vertical drop directly on pedestrian walking path used by evening joggers and families. Extremely dangerous in dim lighting.",
        "category": "Open Drain / Manhole",
        "severity": "Critical",
        "general_location": "Greenway Boulevard, East Promenade",
        "landmark": "Between 4th & 5th Avenue Trees",
        "latitude": 37.7682,
        "longitude": -122.4312,
        "image_url": "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80",
        "status": "Needs Review",
        "verification_status": "Unverified",
        "ai_suggested_category": "Open Drain / Manhole",
        "ai_suggested_priority": "Critical",
        "ai_risk_score": 91.5,
        "ai_explanation": "Category baseline 82/100. Critical multiplier applied. Proximity keywords: 'pedestrian', 'children', 'dim lighting'. High fall risk requires immediate barricading.",
        "ai_confidence": 0.91,
        "is_ai_fallback": True,
        "ai_duplicate_count": 0,
        "support_count": 9,
        "created_at": datetime.utcnow() - timedelta(hours=3),
        "is_demo_data": True
    },
    {
        "report_code": "CS-2025-0105",
        "title": "Fallen Banyan Branch Snapping Overhead Electric Cables",
        "description": "Heavy gale storm snapped massive oak branch which is now resting on overhead power lines. Sparks witnessed intermittently. Pedestrians warned to stay back.",
        "category": "Electrical Hazard",
        "severity": "Critical",
        "general_location": "Pinewood Terrace, Near Substation Block C",
        "landmark": "Substation Pole #88",
        "latitude": 37.7895,
        "longitude": -122.4150,
        "image_url": "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
        "status": "Verified",
        "verification_status": "Verified",
        "ai_suggested_category": "Electrical Hazard",
        "ai_suggested_priority": "Critical",
        "ai_risk_score": 97.2,
        "ai_explanation": "Category baseline 88/100. Detected critical keywords: 'sparks', 'power lines', 'electric cables', 'overhead'. Top priority triage score.",
        "ai_confidence": 0.96,
        "is_ai_fallback": True,
        "ai_duplicate_count": 2,
        "support_count": 31,
        "moderator_notes": "Power Grid Safety Officer contacted immediately. Emergency crew on scene.",
        "verified_by": "City Dispatch Coordinator Miller",
        "verified_at": datetime.utcnow() - timedelta(hours=14),
        "created_at": datetime.utcnow() - timedelta(hours=18),
        "is_demo_data": True
    },
    {
        "report_code": "CS-2025-0106",
        "title": "Broken Streetlight Array Plunging Intersection into Darkness",
        "description": "Four consecutive LED street poles non-functional for past week. Intersection is pitch black at night, making zebra crossing unsafe for pedestrians crossing towards the transit hub.",
        "category": "Broken Streetlight",
        "severity": "Medium",
        "general_location": "Market & 9th Street Crossing",
        "landmark": "Near Central Library Plaza",
        "latitude": 37.7770,
        "longitude": -122.4160,
        "image_url": "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80",
        "status": "Resolved",
        "verification_status": "Verified",
        "ai_suggested_category": "Broken Streetlight",
        "ai_suggested_priority": "Medium",
        "ai_risk_score": 52.0,
        "ai_explanation": "Category baseline 42/100. Medium severity. Proximity to transit crossing noted. Full photographic verification submitted.",
        "ai_confidence": 0.89,
        "is_ai_fallback": True,
        "ai_duplicate_count": 0,
        "support_count": 19,
        "moderator_notes": "Ticket #PW-8812 logged with City Lighting Dept.",
        "resolution_notes": "Municipal electrical maintenance team replaced faulty junction box and all four LED modules on Oct 12. Luminance verified at 45 lux.",
        "resolution_evidence_url": "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80",
        "verified_by": "Moderator Sarah Jenkins",
        "verified_at": datetime.utcnow() - timedelta(days=5),
        "resolved_at": datetime.utcnow() - timedelta(days=1),
        "created_at": datetime.utcnow() - timedelta(days=7),
        "is_demo_data": True
    },
    {
        "report_code": "CS-2025-0107",
        "title": "Overflowing Public Waste Bins Blocking Sidewalk Ramp",
        "description": "Commercial waste dumped beside municipal bins. Debris spills across wheelchair accessible curb ramp, forcing pedestrians into the vehicle lane.",
        "category": "Waste Accumulation",
        "severity": "Low",
        "general_location": "Civic Center Commercial Lane",
        "landmark": "Opposite City Hall Annex",
        "latitude": 37.7792,
        "longitude": -122.4182,
        "image_url": "https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80",
        "status": "Submitted",
        "verification_status": "Unverified",
        "ai_suggested_category": "Waste Accumulation",
        "ai_suggested_priority": "Low",
        "ai_risk_score": 41.0,
        "ai_explanation": "Category baseline 36/100. Low severity. Accessible ramp blockage noted. Standard sanitation routing suggested.",
        "ai_confidence": 0.87,
        "is_ai_fallback": True,
        "ai_duplicate_count": 0,
        "support_count": 4,
        "created_at": datetime.utcnow() - timedelta(hours=1),
        "is_demo_data": True
    }
]


def seed_database(db: Session, force: bool = False):
    """Seed initial demo users and realistic hazard reports."""
    # Check if demo data already loaded
    existing_reports_count = db.query(HazardReport).count()
    if existing_reports_count > 0 and not force:
        return {"status": "skipped", "message": f"Database already has {existing_reports_count} reports."}

    # If force, clear demo records
    if force:
        db.query(ReportStatusHistory).delete()
        db.query(AIAnalysis).delete()
        db.query(HazardReport).filter(HazardReport.is_demo_data == True).delete()
        db.commit()

    # Seed demo users if not present
    demo_users = [
        {"name": "Maya Lin (Citizen)", "email": "citizen@civicshield.org", "role": "citizen"},
        {"name": "Sarah Jenkins (Moderator)", "email": "moderator@civicshield.org", "role": "moderator"},
        {"name": "Chief Administrator", "email": "admin@civicshield.org", "role": "admin"},
    ]

    for u_data in demo_users:
        existing_u = db.query(User).filter(User.email == u_data["email"]).first()
        if not existing_u:
            new_u = User(
                name=u_data["name"],
                email=u_data["email"],
                hashed_password=hash_password(f"{u_data['role']}123"),
                role=u_data["role"]
            )
            db.add(new_u)
    db.commit()

    # Seed sample hazard reports
    for rep_data in SAMPLE_REPORTS:
        existing_rep = db.query(HazardReport).filter(HazardReport.report_code == rep_data["report_code"]).first()
        if existing_rep:
            continue

        report = HazardReport(**rep_data)
        db.add(report)
        db.flush()

        # Add initial status history
        hist1 = ReportStatusHistory(
            report_id=report.id,
            from_status=None,
            to_status="Submitted",
            changed_by="Citizen Reporter",
            notes="Initial submission through CivicShield AI web app.",
            timestamp=report.created_at
        )
        db.add(hist1)

        if report.status in ["Verified", "In Progress", "Resolved"]:
            hist2 = ReportStatusHistory(
                report_id=report.id,
                from_status="Submitted",
                to_status="Verified",
                changed_by=report.verified_by or "City Safety Moderator",
                notes=report.moderator_notes or "Evidence verified against city ward parameters.",
                timestamp=report.verified_at or (report.created_at + timedelta(hours=4))
            )
            db.add(hist2)

        if report.status in ["In Progress", "Resolved"]:
            hist3 = ReportStatusHistory(
                report_id=report.id,
                from_status="Verified",
                to_status="In Progress",
                changed_by="Public Works Dispatch",
                notes="Assigned to municipal field response crew.",
                timestamp=report.created_at + timedelta(hours=8)
            )
            db.add(hist3)

        if report.status == "Resolved":
            hist4 = ReportStatusHistory(
                report_id=report.id,
                from_status="In Progress",
                to_status="Resolved",
                changed_by="Senior Safety Inspector",
                notes=report.resolution_notes or "Field inspection confirmed hazard cleared.",
                timestamp=report.resolved_at or (report.created_at + timedelta(days=2))
            )
            db.add(hist4)

        # Add AI analysis record
        ai_rec = AIAnalysis(
            report_id=report.id,
            suggested_category=report.ai_suggested_category,
            suggested_priority=report.ai_suggested_priority,
            risk_score=report.ai_risk_score,
            explanation=report.ai_explanation,
            duplicate_candidates=json.dumps([]),
            recommended_action=f"Priority triage for {report.ai_suggested_priority} risk level.",
            confidence_score=report.ai_confidence,
            limitations_note="Transparent deterministic evaluation based on spatial clustering and vulnerability keywords.",
            provider_name="CivicShield Risk Intelligence Engine (Demo Mode)",
            created_at=report.created_at
        )
        db.add(ai_rec)

    db.commit()
    return {"status": "success", "message": f"Successfully loaded {len(SAMPLE_REPORTS)} sample hazard records."}
