import pytest
from app.services.health_score import (
    score_ph, score_do, score_bod, score_turbidity, score_fecal_coliform,
    calculate_river_health_score, determine_band
)

def test_pristine_water_score():
    res = calculate_river_health_score(
        ph=7.4,
        do_mgl=8.2,
        bod_mgl=1.2,
        turbidity_ntu=3.0,
        fecal_coliform=50.0
    )
    assert res["score"] >= 90.0
    assert res["band"] == "Excellent"
    assert res["completeness_pct"] == 100.0

def test_critical_polluted_water_score():
    res = calculate_river_health_score(
        ph=5.2,
        do_mgl=0.8,
        bod_mgl=24.0,
        turbidity_ntu=85.0,
        fecal_coliform=45000.0
    )
    assert res["score"] < 20.0
    assert res["band"] == "Critical"

def test_partial_measurements_completeness():
    res = calculate_river_health_score(
        ph=7.2,
        do_mgl=6.5
    )
    # Only 2 out of 5 parameters provided
    assert res["completeness_pct"] == 40.0
    assert res["score"] is not None
    assert res["band"] in ["Excellent", "Good"]

def test_sub_scoring_individual_parameters():
    assert score_ph(7.4) == 100.0
    assert score_ph(6.5) == 70.0
    assert score_do(7.5) == 100.0
    assert score_do(5.0) == 70.0
    assert score_bod(2.0) == 100.0
    assert score_bod(3.0) == 80.0
