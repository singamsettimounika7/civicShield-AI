import math
import re
import json
from typing import Dict, Any, List, Optional
from .config import GEMINI_API_KEY, HAS_REAL_AI

# Category baseline risk weights (0 to 100 scale)
CATEGORY_RISK_BASELINE = {
    "Electrical Hazard": 88,
    "Open Drain / Manhole": 82,
    "Waterlogging": 75,
    "Fallen Tree": 68,
    "Road Damage / Pothole": 58,
    "Blocked Footpath": 45,
    "Broken Streetlight": 42,
    "Waste Accumulation": 36,
    "Other Public Hazard": 50,
}

SEVERITY_MULTIPLIERS = {
    "Critical": 1.35,
    "High": 1.20,
    "Medium": 1.00,
    "Low": 0.80,
}

VULNERABLE_KEYWORDS = [
    "school", "hospital", "clinic", "elderly", "children", "kids", "busy", 
    "highway", "crossing", "metro", "bus stop", "market", "intersection", 
    "pedestrian", "blind spot", "sparks", "flooding", "submerged", "live wire"
]

CATEGORY_KEYWORDS = {
    "Electrical Hazard": ["wire", "electric", "spark", "cable", "pole", "shock", "transformer", "live wire", "meter box"],
    "Open Drain / Manhole": ["drain", "manhole", "gutter", "sewer", "lid", "uncovered", "chamber", "culvert"],
    "Waterlogging": ["water", "flood", "submerged", "monsoon", "rain", "puddle", "drainage", "waterlogged", "stagnant"],
    "Fallen Tree": ["tree", "branch", "trunk", "fallen", "bough", "timber", "roots"],
    "Road Damage / Pothole": ["pothole", "crater", "asphalt", "tar", "road", "cavity", "sinkhole", "uneven", "bump"],
    "Broken Streetlight": ["streetlight", "lamp", "light", "dark", "illumination", "bulb", "darkness", "street lamp"],
    "Blocked Footpath": ["footpath", "sidewalk", "encroach", "vendor", "debris", "blocked", "pedestrian path", "walkway"],
    "Waste Accumulation": ["garbage", "trash", "waste", "dump", "bin", "overflow", "rubbish", "litter", "stench"],
}


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate great-circle distance between two GPS coordinates in kilometers."""
    R = 6371.0  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


def calculate_text_similarity(text1: str, text2: str) -> float:
    """Calculate token overlap Jaccard similarity."""
    tokens1 = set(re.findall(r"\w+", text1.lower()))
    tokens2 = set(re.findall(r"\w+", text2.lower()))
    if not tokens1 or not tokens2:
        return 0.0
    intersection = tokens1.intersection(tokens2)
    union = tokens1.union(tokens2)
    return round(len(intersection) / len(union), 2)


def classify_hazard_text(title: str, description: str, current_category: Optional[str] = None) -> Dict[str, Any]:
    """Classify hazard category from text content."""
    combined_text = f"{title} {description}".lower()
    scores = {}

    for cat, kws in CATEGORY_KEYWORDS.items():
        score = sum(2 for kw in kws if re.search(r"\b" + re.escape(kw) + r"\b", combined_text))
        if current_category and cat.lower() in current_category.lower():
            score += 3
        scores[cat] = score

    best_cat = max(scores, key=scores.get)
    if scores[best_cat] == 0:
        best_cat = current_category or "Road Damage / Pothole"

    confidence = min(0.95, 0.65 + (scores[best_cat] * 0.05))
    return {
        "suggested_category": best_cat,
        "category_confidence": round(confidence, 2)
    }


def find_duplicates(new_report: Dict[str, Any], existing_reports: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Identify similar/duplicate reports within geographic radius and semantic similarity."""
    duplicates = []
    new_lat = new_report.get("latitude")
    new_lon = new_report.get("longitude")
    new_cat = new_report.get("category", "")
    new_text = f"{new_report.get('title', '')} {new_report.get('general_location', '')} {new_report.get('description', '')}"

    for rep in existing_reports:
        # Don't match self
        if rep.get("id") == new_report.get("id"):
            continue

        reasons = []
        similarity_score = 0.0

        # Category match
        same_category = rep.get("category", "").lower() == new_cat.lower()
        if same_category:
            similarity_score += 0.35
            reasons.append("Exact category match")

        # Distance calculation
        rep_lat = rep.get("latitude")
        rep_lon = rep.get("longitude")
        dist_km = None
        if new_lat and new_lon and rep_lat and rep_lon:
            dist_km = haversine_distance_km(new_lat, new_lon, rep_lat, rep_lon)
            if dist_km <= 0.2:  # within 200m
                similarity_score += 0.45
                reasons.append(f"Very close proximity ({int(dist_km * 1000)}m away)")
            elif dist_km <= 0.6:  # within 600m
                similarity_score += 0.25
                reasons.append(f"Nearby neighborhood ({int(dist_km * 1000)}m away)")
            elif dist_km <= 1.5:
                similarity_score += 0.10
                reasons.append(f"Within 1.5km radius")

        # Text overlap
        rep_text = f"{rep.get('title', '')} {rep.get('general_location', '')} {rep.get('description', '')}"
        text_sim = calculate_text_similarity(new_text, rep_text)
        if text_sim > 0.25:
            similarity_score += min(0.35, text_sim * 0.7)
            reasons.append(f"High descriptive similarity ({int(text_sim * 100)}% word overlap)")

        # Threshold for duplicate candidate
        if similarity_score >= 0.50:
            duplicates.append({
                "report_id": rep.get("id"),
                "report_code": rep.get("report_code", f"REP-{rep.get('id')}"),
                "title": rep.get("title"),
                "category": rep.get("category"),
                "general_location": rep.get("general_location"),
                "similarity_score": round(min(0.98, similarity_score), 2),
                "distance_km": dist_km,
                "status": rep.get("status"),
                "match_reasons": reasons
            })

    # Sort duplicates by highest similarity
    duplicates.sort(key=lambda d: d["similarity_score"], reverse=True)
    return duplicates[:5]


def assess_risk_intelligence(
    title: str,
    description: str,
    category: str,
    severity: str,
    general_location: str,
    has_photo: bool,
    has_gps: bool,
    nearby_duplicates_count: int = 0
) -> Dict[str, Any]:
    """
    CivicShield Community Risk Intelligence Engine:
    Combines hazard category baseline, reported severity, vulnerability keywords,
    evidence completeness, and duplicate report cluster density.
    """
    baseline = CATEGORY_RISK_BASELINE.get(category, 50)
    mult = SEVERITY_MULTIPLIERS.get(severity, 1.0)
    raw_score = baseline * mult

    combined_text = f"{title} {description} {general_location}".lower()
    
    # Vulnerability proximity bonus
    found_vulnerabilities = [kw for kw in VULNERABLE_KEYWORDS if re.search(r"\b" + re.escape(kw) + r"\b", combined_text)]
    vuln_bonus = min(20, len(found_vulnerabilities) * 5)
    raw_score += vuln_bonus

    # Evidence completeness
    evidence_score = 0
    if has_photo:
        evidence_score += 6
    if has_gps:
        evidence_score += 5
    raw_score += evidence_score

    # Duplicate cluster density (multiple reports amplify priority)
    cluster_bonus = min(18, nearby_duplicates_count * 6)
    raw_score += cluster_bonus

    # Clamp score to 10 - 99
    risk_score = round(max(10.0, min(99.0, raw_score)), 1)

    # Determine priority tier
    if risk_score >= 82:
        priority = "Critical"
        recommended_action = "Urgent Moderator Review: Potential immediate danger to pedestrians or motorists. Alert local field response."
    elif risk_score >= 65:
        priority = "High"
        recommended_action = "Priority Verification: Review evidence and dispatch notification to ward safety inspectors."
    elif risk_score >= 45:
        priority = "Medium"
        recommended_action = "Standard Review: Queue for moderator verification within 24 hours."
    else:
        priority = "Low"
        recommended_action = "Routine Queue: Monitor for community confirmations or additional evidence."

    # Generate transparent reasoning
    reasons = [
        f"Category baseline risk for '{category}' evaluated at {baseline}/100.",
        f"Reporter indicated severity level: {severity} (weight {mult}x)."
    ]
    if found_vulnerabilities:
        reasons.append(f"Detected sensitive proximity indicators: {', '.join(found_vulnerabilities[:3])}.")
    if nearby_duplicates_count > 0:
        reasons.append(f"Clustering detected: {nearby_duplicates_count} similar report(s) in this vicinity amplify community risk.")
    if has_photo:
        reasons.append("Photographic evidence attached increases report credibility.")
    if has_gps:
        reasons.append("Precise location coordinates provided for field dispatch.")

    explanation = " ".join(reasons)

    limitations = (
        "Notice: This is an AI-assisted preliminary triage score derived from report attributes, "
        "evidence completeness, and spatial clustering. It is not an official municipal dispatch "
        "or emergency service declaration. Physical inspection by a human moderator or field officer is required."
    )

    return {
        "suggested_category": category,
        "suggested_priority": priority,
        "risk_score": risk_score,
        "explanation": explanation,
        "recommended_action": recommended_action,
        "confidence_score": 0.89 if has_photo else 0.76,
        "limitations_note": limitations,
        "provider_name": "CivicShield Community Risk Intelligence Engine (Transparent Deterministic Engine)",
        "is_fallback": True
    }


def analyze_report_full(
    report_dict: Dict[str, Any],
    existing_reports: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """Runs complete end-to-end AI hazard analysis."""
    title = report_dict.get("title", "")
    description = report_dict.get("description", "")
    category = report_dict.get("category", "Road Damage / Pothole")
    severity = report_dict.get("severity", "Medium")
    location = report_dict.get("general_location", "")
    has_photo = bool(report_dict.get("image_url"))
    has_gps = bool(report_dict.get("latitude") and report_dict.get("longitude"))

    # 1. Text Classification
    cat_analysis = classify_hazard_text(title, description, category)
    suggested_cat = cat_analysis["suggested_category"]

    # 2. Duplicate Detection
    duplicates = find_duplicates(report_dict, existing_reports)

    # 3. Risk Prioritization
    risk_analysis = assess_risk_intelligence(
        title=title,
        description=description,
        category=suggested_cat,
        severity=severity,
        general_location=location,
        has_photo=has_photo,
        has_gps=has_gps,
        nearby_duplicates_count=len(duplicates)
    )

    risk_analysis["duplicate_candidates"] = json.dumps(duplicates)
    risk_analysis["duplicates_list"] = duplicates
    risk_analysis["duplicate_count"] = len(duplicates)

    return risk_analysis
