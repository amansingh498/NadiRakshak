from typing import Dict, Any, Tuple, Optional
import yaml
from pathlib import Path

# Load standards configuration
CONFIG_PATH = Path(__file__).resolve().parent.parent.parent / "config" / "standards.yaml"

def load_standards() -> Dict[str, Any]:
    if not CONFIG_PATH.exists():
        # Fallback default configuration if path differs
        return {
            "version": "cpcb_default",
            "parameters": {
                "ph": {"min": 6.5, "max": 8.5, "weight": 0.15, "ideal_min": 7.0, "ideal_max": 7.8},
                "do_mgl": {"min": 5.0, "weight": 0.30, "ideal_min": 7.0},
                "bod_mgl": {"max": 3.0, "weight": 0.30, "ideal_max": 2.0, "critical_threshold": 10.0},
                "turbidity_ntu": {"max": 10.0, "weight": 0.10, "ideal_max": 5.0},
                "fecal_coliform": {"max_desirable": 500, "max_permissible": 2500, "weight": 0.15, "ideal_max": 100, "critical_threshold": 10000}
            },
            "health_bands": [
                {"band": "Excellent", "range": [80, 100], "color": "#10b981"},
                {"band": "Good", "range": [60, 79], "color": "#3b82f6"},
                {"band": "Moderate", "range": [40, 59], "color": "#f59e0b"},
                {"band": "Poor", "range": [20, 39], "color": "#f97316"},
                {"band": "Critical", "range": [0, 19], "color": "#ef4444"}
            ]
        }
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

STANDARDS = load_standards()

def score_ph(ph: Optional[float]) -> Optional[float]:
    """Scores pH on a 0-100 scale based on CPCB bathing standards (6.5 - 8.5)."""
    if ph is None:
        return None
    if 7.0 <= ph <= 7.8:
        return 100.0
    elif 6.5 <= ph < 7.0:
        return 70.0 + 30.0 * ((ph - 6.5) / 0.5)
    elif 7.8 < ph <= 8.5:
        return 70.0 + 30.0 * ((8.5 - ph) / 0.7)
    elif 6.0 <= ph < 6.5:
        return 40.0 + 30.0 * ((ph - 6.0) / 0.5)
    elif 8.5 < ph <= 9.0:
        return 40.0 + 30.0 * ((9.0 - ph) / 0.5)
    elif ph < 6.0:
        return max(0.0, 40.0 * (ph / 6.0))
    else:  # ph > 9.0
        return max(0.0, 40.0 * max(0.0, (14.0 - ph) / 5.0))

def score_do(do: Optional[float]) -> Optional[float]:
    """Scores Dissolved Oxygen (DO mg/L). Higher is better. CPCB bathing min = 5.0 mg/L."""
    if do is None:
        return None
    if do >= 7.0:
        return 100.0
    elif do >= 5.0:
        # 5.0 -> 70, 7.0 -> 100
        return 70.0 + 30.0 * ((do - 5.0) / 2.0)
    elif do >= 3.0:
        # 3.0 -> 40, 5.0 -> 70
        return 40.0 + 30.0 * ((do - 3.0) / 2.0)
    elif do >= 1.0:
        # 1.0 -> 10, 3.0 -> 40
        return 10.0 + 30.0 * ((do - 1.0) / 2.0)
    else:
        return max(0.0, 10.0 * do)

def score_bod(bod: Optional[float]) -> Optional[float]:
    """Scores Biochemical Oxygen Demand (BOD mg/L). Lower is better. CPCB bathing max = 3.0 mg/L."""
    if bod is None:
        return None
    if bod <= 2.0:
        return 100.0
    elif bod <= 3.0:
        # 2.0 -> 100, 3.0 -> 80
        return 80.0 + 20.0 * ((3.0 - bod) / 1.0)
    elif bod <= 6.0:
        # 3.0 -> 80, 6.0 -> 40
        return 40.0 + 40.0 * ((6.0 - bod) / 3.0)
    elif bod <= 12.0:
        # 6.0 -> 40, 12.0 -> 10
        return 10.0 + 30.0 * ((12.0 - bod) / 6.0)
    else:
        return max(0.0, 10.0 * max(0.0, (30.0 - bod) / 18.0))

def score_turbidity(turbidity: Optional[float]) -> Optional[float]:
    """Scores Turbidity (NTU). Lower is clearer."""
    if turbidity is None:
        return None
    if turbidity <= 5.0:
        return 100.0
    elif turbidity <= 10.0:
        return 75.0 + 25.0 * ((10.0 - turbidity) / 5.0)
    elif turbidity <= 25.0:
        return 40.0 + 35.0 * ((25.0 - turbidity) / 15.0)
    elif turbidity <= 50.0:
        return 15.0 + 25.0 * ((50.0 - turbidity) / 25.0)
    else:
        return max(0.0, 15.0 * max(0.0, (100.0 - turbidity) / 50.0))

def score_fecal_coliform(fc: Optional[float]) -> Optional[float]:
    """Scores Fecal Coliform (MPN/100 mL). Desirable <= 500, Permissible <= 2500."""
    if fc is None:
        return None
    if fc <= 100:
        return 100.0
    elif fc <= 500:
        return 80.0 + 20.0 * ((500.0 - fc) / 400.0)
    elif fc <= 2500:
        return 40.0 + 40.0 * ((2500.0 - fc) / 2000.0)
    elif fc <= 10000:
        return 10.0 + 30.0 * ((10000.0 - fc) / 7500.0)
    else:
        return max(0.0, 10.0 * max(0.0, (50000.0 - fc) / 40000.0))

def determine_band(score: float) -> Tuple[str, str]:
    """Returns band name and color hex for a given 0-100 score."""
    bands = STANDARDS.get("health_bands", [])
    for b in bands:
        low, high = b["range"]
        if low <= score <= high:
            return b["band"], b.get("color", "#6b7280")
    if score >= 100.0:
        return "Excellent", "#10b981"
    return "Critical", "#ef4444"

def calculate_river_health_score(
    ph: Optional[float] = None,
    do_mgl: Optional[float] = None,
    bod_mgl: Optional[float] = None,
    turbidity_ntu: Optional[float] = None,
    fecal_coliform: Optional[float] = None,
    cod_mgl: Optional[float] = None
) -> Dict[str, Any]:
    """
    Computes overall River Health Score (0-100), band classification,
    and parameter completeness according to CPCB standards.
    """
    sub_scores = {
        "ph": score_ph(ph),
        "do_mgl": score_do(do_mgl),
        "bod_mgl": score_bod(bod_mgl),
        "turbidity_ntu": score_turbidity(turbidity_ntu),
        "fecal_coliform": score_fecal_coliform(fecal_coliform),
    }

    weights = {
        "ph": 0.15,
        "do_mgl": 0.30,
        "bod_mgl": 0.30,
        "turbidity_ntu": 0.10,
        "fecal_coliform": 0.15,
    }

    active_weights = 0.0
    weighted_sum = 0.0
    parameters_present = 0
    total_parameters = len(weights)

    for param, score in sub_scores.items():
        if score is not None:
            w = weights.get(param, 0.0)
            active_weights += w
            weighted_sum += score * w
            parameters_present += 1

    if active_weights == 0.0:
        return {
            "score": None,
            "band": "Unknown",
            "band_color": "#9ca3af",
            "completeness_pct": 0.0,
            "sub_scores": sub_scores,
            "config_version": STANDARDS.get("version", "cpcb_v1"),
            "is_estimate": True,
        }

    final_score = round(weighted_sum / active_weights, 1)
    completeness = round((parameters_present / total_parameters) * 100.0, 1)
    band, band_color = determine_band(final_score)

    return {
        "score": final_score,
        "band": band,
        "band_color": band_color,
        "completeness_pct": completeness,
        "sub_scores": sub_scores,
        "config_version": STANDARDS.get("version", "cpcb_v1"),
        "is_estimate": True,
        "standard_source": STANDARDS.get("source", "CPCB Standards")
    }
