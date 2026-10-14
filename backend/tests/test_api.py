import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import Base, engine, SessionLocal
from backend.app.seed_data import seed_database
from backend.app.ai_service import classify_hazard_text, assess_risk_intelligence, find_duplicates

client = TestClient(app)

def run_all_tests():
    print("========================================")
    print("CIVICSHIELD AI - BACKEND TEST SUITE")
    print("========================================")
    
    # Setup test DB
    print("[1/7] Seeding test database...")
    db = SessionLocal()
    try:
        seed_database(db, force=True)
    finally:
        db.close()
    print("  [OK] Database seeded successfully")

    # Test health check
    print("[2/7] Testing health check endpoint...")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    assert data["app"] == "CivicShield AI"
    assert "ai_provider" in data
    print(f"  [OK] Health check passed. AI Provider: {data['ai_provider']}")

    # Test reports listing
    print("[3/7] Testing reports retrieval and seed verification...")
    res = client.get("/api/reports")
    assert res.status_code == 200
    reports = res.json()
    assert len(reports) >= 5, f"Expected at least 5 reports, got {len(reports)}"
    assert any(r["status"] == "Verified" for r in reports)
    assert any(r["status"] == "In Progress" for r in reports)
    print(f"  [OK] Retrieved {len(reports)} reports with diverse statuses.")

    # Test AI classification & risk engine
    print("[4/7] Testing AI text classification & multi-factor risk prioritization...")
    text_result = classify_hazard_text(
        title="Live wire sparked on street pole",
        description="Sparks showering near bus stand after cable snapped"
    )
    assert text_result["suggested_category"] == "Electrical Hazard"

    risk_result = assess_risk_intelligence(
        title="Live wire sparking near school gate",
        description="Sparks and dangling wire right where kids exit",
        category="Electrical Hazard",
        severity="Critical",
        general_location="School gate area",
        has_photo=True,
        has_gps=True,
        nearby_duplicates_count=1
    )
    assert risk_result["suggested_priority"] == "Critical"
    assert risk_result["risk_score"] >= 85.0
    print(f"  [OK] AI Classification: Electrical Hazard, Risk Score: {risk_result['risk_score']} ({risk_result['suggested_priority']})")

    # Test Duplicate Detection
    print("[5/7] Testing duplicate candidate detection...")
    existing = [
        {
            "id": 1,
            "report_code": "CS-101",
            "title": "Large crater pothole on Oakridge road",
            "category": "Road Damage / Pothole",
            "general_location": "Oakridge District",
            "description": "Deep asphalt hole damaging wheels",
            "latitude": 37.7749,
            "longitude": -122.4194
        }
    ]
    new_report = {
        "id": 2,
        "title": "Deep pothole in Oakridge near school",
        "category": "Road Damage / Pothole",
        "general_location": "Oakridge District",
        "description": "Asphalt depression broke bike tire",
        "latitude": 37.7751,
        "longitude": -122.4196
    }
    dups = find_duplicates(new_report, existing)
    assert len(dups) == 1, "Duplicate should be detected"
    assert dups[0]["similarity_score"] >= 0.5
    print(f"  [OK] Duplicate detected: {dups[0]['report_code']} (Similarity: {dups[0]['similarity_score'] * 100}%)")

    # Test Create Report & Moderator Status Transition
    print("[6/7] Testing report creation, AI triage save, and Moderator Verification...")
    payload = {
        "title": "Uncovered drainage hole near supermarket entrance",
        "description": "Grate is missing, deep sewer hole exposed right next to grocery entrance. High pedestrian footfall.",
        "category": "Open Drain / Manhole",
        "severity": "Critical",
        "general_location": "Market Plaza, West Entryway",
        "landmark": "Near Supermart #3",
        "latitude": 37.7760,
        "longitude": -122.4175,
        "image_url": "https://images.unsplash.com/photo-1584467735871-8e85353a8413",
        "reporter_name": "Test Citizen"
    }
    res = client.post("/api/reports", json=payload)
    assert res.status_code == 201
    created = res.json()
    assert created["status"] == "Submitted"
    report_id = created["id"]

    # Verify report via moderator status transition
    patch_res = client.patch(
        f"/api/reports/{report_id}/status",
        json={
            "status": "Verified",
            "verification_status": "Verified",
            "moderator_notes": "Hazard confirmed on site. Temporary barricade placed.",
            "moderator_name": "Senior Safety Moderator"
        }
    )
    assert patch_res.status_code == 200
    updated = patch_res.json()
    assert updated["status"] == "Verified"
    assert updated["verified_by"] == "Senior Safety Moderator"
    assert len(updated["status_history"]) >= 2
    print(f"  [OK] Report {created['report_code']} created and successfully verified by moderator.")

    # Test Dashboard Metrics & Community Support
    print("[7/7] Testing dashboard analytics & community upvote deduplication...")
    stats_res = client.get("/api/dashboard/stats")
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_reports"] >= 5
    assert len(stats["recent_trend"]) == 7

    supp_res1 = client.post(f"/api/reports/{report_id}/support", json={"user_identifier": "user_demo_session_1"})
    assert supp_res1.status_code == 200
    assert supp_res1.json()["already_recorded"] is False

    supp_res2 = client.post(f"/api/reports/{report_id}/support", json={"user_identifier": "user_demo_session_1"})
    assert supp_res2.status_code == 200
    assert supp_res2.json()["already_recorded"] is True
    print(f"  [OK] Community support deduplication verified.")
    print("========================================")
    print("ALL TESTS PASSED! Backend is 100% healthy.")
    print("========================================")

if __name__ == "__main__":
    run_all_tests()
