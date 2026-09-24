from typing import List, Dict, Any
import numpy as np
from sklearn.cluster import DBSCAN
import math

def detect_hotspots(
    incidents: List[Dict[str, Any]],
    eps_km: float = 1.0,
    min_samples: int = 2
) -> List[Dict[str, Any]]:
    """
    Spatial clustering using DBSCAN with haversine metric on incident coordinates.
    Flags geographic clusters with high concentration of verified pollution reports.
    """
    if len(incidents) < min_samples:
        return []

    # Coordinates in radians for haversine
    coords = np.array([
        [math.radians(inc["latitude"]), math.radians(inc["longitude"])]
        for inc in incidents
    ])
    
    # Earth radius ~ 6371.0088 km
    kms_per_radian = 6371.0088
    epsilon = eps_km / kms_per_radian

    db = DBSCAN(eps=epsilon, min_samples=min_samples, metric='haversine')
    labels = db.fit_predict(coords)

    unique_labels = set(labels)
    hotspots = []

    for label in unique_labels:
        if label == -1:
            continue  # Noise points
        
        cluster_indices = [i for i, l in enumerate(labels) if l == label]
        cluster_incidents = [incidents[i] for i in cluster_indices]
        
        avg_lat = sum(inc["latitude"] for inc in cluster_incidents) / len(cluster_incidents)
        avg_lng = sum(inc["longitude"] for inc in cluster_incidents) / len(cluster_incidents)
        
        # Calculate cluster radius (max distance from centroid)
        max_dist_m = 0.0
        for inc in cluster_incidents:
            d_lat = math.radians(inc["latitude"] - avg_lat)
            d_lon = math.radians(inc["longitude"] - avg_lng)
            a = math.sin(d_lat/2)**2 + math.cos(math.radians(avg_lat)) * math.cos(math.radians(inc["latitude"])) * math.sin(d_lon/2)**2
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
            dist_m = 6371000 * c
            if dist_m > max_dist_m:
                max_dist_m = dist_m

        hotspots.append({
            "name": f"Hotspot Cluster #{label + 1} ({len(cluster_incidents)} reports)",
            "latitude": round(avg_lat, 6),
            "longitude": round(avg_lng, 6),
            "radius_meters": max(250.0, round(max_dist_m, 1)),
            "incident_count": len(cluster_incidents),
            "incident_ids": [inc.get("id") for inc in cluster_incidents if "id" in inc],
            "confidence": min(0.95, 0.6 + (len(cluster_incidents) * 0.08)),
            "dominant_type": max(set([inc.get("pollution_type", "sewage") for inc in cluster_incidents]), key=[inc.get("pollution_type", "sewage") for inc in cluster_incidents].count)
        })

    return hotspots

def classify_pollution_image_rule_mock(
    image_name: str,
    description: str = ""
) -> Dict[str, Any]:
    """
    Lightweight rule/keyword + simulated triage classifier for incoming evidence photos.
    Outputs: predicted type, confidence, and triage classification label.
    """
    desc_lower = (image_name + " " + description).lower()
    
    if "foam" in desc_lower or "froth" in desc_lower or "toxic" in desc_lower:
        return {"predicted_type": "industrial_discharge", "label": "Chemical / Industrial Froth", "confidence": 0.88}
    elif "plastic" in desc_lower or "bottle" in desc_lower or "garbage" in desc_lower or "trash" in desc_lower:
        return {"predicted_type": "plastic_waste", "label": "Solid Waste / Plastic Accumulation", "confidence": 0.91}
    elif "oil" in desc_lower or "slick" in desc_lower or "diesel" in desc_lower or "black" in desc_lower:
        return {"predicted_type": "oil_chemical", "label": "Oil / Hydrocarbon Discharge", "confidence": 0.85}
    elif "dead" in desc_lower or "fish" in desc_lower:
        return {"predicted_type": "dead_fish", "label": "Fish Mortality / Severe Hypoxia", "confidence": 0.94}
    elif "sewage" in desc_lower or "drain" in desc_lower or "nala" in desc_lower or "nallah" in desc_lower:
        return {"predicted_type": "sewage", "label": "Untreated Domestic Sewage Outfall", "confidence": 0.89}
    else:
        return {"predicted_type": "sewage", "label": "Potential Effluent Discharge", "confidence": 0.72}
