import math
from typing import Dict, Any, Optional, List
from datetime import datetime
import io
try:
    from PIL import Image
    import imagehash
except ImportError:
    Image = None
    imagehash = None

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates distance in meters between two lat/lng coordinates."""
    R = 6371000  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def compute_image_phash(image_bytes: bytes) -> Optional[str]:
    """Generates perceptual hash (pHash) for image deduplication."""
    if not Image or not imagehash:
        return None
    try:
        img = Image.open(io.BytesIO(image_bytes))
        h = imagehash.phash(img)
        return str(h)
    except Exception:
        return None

def compute_evidence_score(
    distance_to_river_m: float,
    has_photo: bool,
    is_in_app_capture: bool,
    is_duplicate: bool,
    nearby_reports_count: int,
    water_quality_anomaly: bool
) -> Dict[str, Any]:
    """
    Computes an evidence score (0-100) and confidence (LOW, MEDIUM, HIGH)
    from multi-factor verification checks.
    """
    score = 40.0 # base score

    # GPS proximity to river
    if distance_to_river_m <= 100:
        score += 25.0
    elif distance_to_river_m <= 500:
        score += 15.0
    elif distance_to_river_m <= 1500:
        score += 5.0
    else:
        score -= 20.0 # Far from river

    # Photo checks
    if has_photo:
        score += 15.0
    if is_in_app_capture:
        score += 10.0
    if is_duplicate:
        score -= 35.0 # Duplicate penalty

    # Clustering / corroborated by other citizens
    if nearby_reports_count >= 3:
        score += 15.0
    elif nearby_reports_count >= 1:
        score += 8.0

    # Corroborated by water quality sensor anomaly
    if water_quality_anomaly:
        score += 15.0

    final_score = max(0.0, min(100.0, score))
    
    if final_score >= 75.0:
        confidence = "HIGH"
    elif final_score >= 45.0:
        confidence = "MEDIUM"
    else:
        confidence = "LOW"

    return {
        "evidence_score": round(final_score, 1),
        "confidence": confidence,
        "factors": {
            "distance_to_river_m": distance_to_river_m,
            "has_photo": has_photo,
            "is_in_app_capture": is_in_app_capture,
            "is_duplicate": is_duplicate,
            "nearby_reports_count": nearby_reports_count,
            "water_quality_anomaly": water_quality_anomaly
        }
    }

def calculate_severity(
    pollution_type: str,
    evidence_score: float,
    nearby_population_density: str = "medium",
    nearby_critical_wq: bool = False
) -> str:
    """
    Determines severity: LOW, MEDIUM, HIGH, CRITICAL.
    """
    high_impact_types = ["industrial_discharge", "chemical", "oil_chemical", "dead_fish"]
    
    if pollution_type in high_impact_types and (evidence_score >= 60.0 or nearby_critical_wq):
        return "CRITICAL"
    elif pollution_type in high_impact_types or (pollution_type == "sewage" and nearby_population_density in ["high", "medium"]):
        return "HIGH"
    elif pollution_type in ["sewage", "plastic_waste"] and evidence_score >= 40.0:
        return "MEDIUM"
    else:
        return "LOW"
