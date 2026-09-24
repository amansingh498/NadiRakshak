from datetime import datetime, timedelta
import random
from app.models.database import River, Station, Measurement, Incident, IncidentEvent, IncidentStatus, SeverityLevel, ConfidenceLevel
from app.services.health_score import calculate_river_health_score

def seed_database_internal(db):
    """Internal seeder function accepting an active SQLAlchemy session."""
    # Check if already seeded
    if db.query(River).first():
        return False

    print("Seeding database with realistic river stretches, stations, and incident demo data...")

    # 1. Rivers
    yamuna_coords = [
        [77.2285, 28.7112], # Wazirabad Barrage
        [77.2341, 28.6750], # ISBT Kashmere Gate / Old Yamuna Bridge
        [77.2514, 28.6418], # ITO Bridge
        [77.2721, 28.6139], # Nizamuddin Bridge
        [77.3012, 28.5684], # Kalindi Kunj
        [77.3105, 28.5441], # Okhla Barrage
    ]

    ganga_coords = [
        [83.0031, 25.2814], # Assi Ghat
        [83.0108, 25.3042], # Dashashwamedh Ghat
        [83.0175, 25.3115], # Manikarnika Ghat
        [83.0312, 25.3321], # Rajghat / Malviya Bridge
    ]

    yamuna = River(
        name="Yamuna (Delhi Stretch)",
        state="Delhi / NCR",
        length_km=48.0,
        geometry_geojson={"type": "LineString", "coordinates": yamuna_coords}
    )
    ganga = River(
        name="Ganga (Varanasi Stretch)",
        state="Uttar Pradesh",
        length_km=22.0,
        geometry_geojson={"type": "LineString", "coordinates": ganga_coords}
    )

    db.add_all([yamuna, ganga])
    db.commit()
    db.refresh(yamuna)
    db.refresh(ganga)

    # 2. Monitoring Stations
    stations_data = [
        {"river_id": yamuna.id, "name": "Wazirabad Intake", "code": "YAM-DEL-01", "lat": 28.7112, "lng": 77.2285, "district": "North Delhi"},
        {"river_id": yamuna.id, "name": "Old Railway Bridge (ISBT)", "code": "YAM-DEL-02", "lat": 28.6750, "lng": 77.2341, "district": "Central Delhi"},
        {"river_id": yamuna.id, "name": "ITO Bridge Outfall", "code": "YAM-DEL-03", "lat": 28.6418, "lng": 77.2514, "district": "East Delhi"},
        {"river_id": yamuna.id, "name": "Nizamuddin Bridge", "code": "YAM-DEL-04", "lat": 28.6139, "lng": 77.2721, "district": "South East Delhi"},
        {"river_id": yamuna.id, "name": "Okhla Barrage / Kalindi Kunj", "code": "YAM-DEL-05", "lat": 28.5441, "lng": 77.3105, "district": "South Delhi"},

        {"river_id": ganga.id, "name": "Assi Ghat Monitoring Station", "code": "GAN-VAR-01", "lat": 25.2814, "lng": 83.0031, "district": "Varanasi"},
        {"river_id": ganga.id, "name": "Dashashwamedh Ghat", "code": "GAN-VAR-02", "lat": 25.3042, "lng": 83.0108, "district": "Varanasi"},
        {"river_id": ganga.id, "name": "Rajghat Outfall", "code": "GAN-VAR-03", "lat": 25.3321, "lng": 83.0312, "district": "Varanasi"},
    ]

    station_objs = []
    for s in stations_data:
        st = Station(
            river_id=s["river_id"],
            name=s["name"],
            code=s["code"],
            latitude=s["lat"],
            longitude=s["lng"],
            district=s["district"],
            source="CPCB / DPCC NWMP"
        )
        db.add(st)
        station_objs.append(st)
    db.commit()

    # 3. Water Quality Measurements
    station_profiles = {
        "YAM-DEL-01": {"ph": 7.4, "do": 6.8, "bod": 2.6, "turb": 8.0, "fc": 420.0},
        "YAM-DEL-02": {"ph": 7.2, "do": 3.4, "bod": 11.5, "turb": 24.0, "fc": 18000.0},
        "YAM-DEL-03": {"ph": 6.9, "do": 1.1, "bod": 28.0, "turb": 48.0, "fc": 65000.0},
        "YAM-DEL-04": {"ph": 6.8, "do": 0.5, "bod": 36.0, "turb": 62.0, "fc": 120000.0},
        "YAM-DEL-05": {"ph": 6.7, "do": 0.2, "bod": 42.0, "turb": 75.0, "fc": 210000.0},
        "GAN-VAR-01": {"ph": 7.8, "do": 7.2, "bod": 3.1, "turb": 12.0, "fc": 1800.0},
        "GAN-VAR-02": {"ph": 7.7, "do": 6.6, "bod": 4.8, "turb": 16.0, "fc": 5200.0},
        "GAN-VAR-03": {"ph": 7.3, "do": 4.9, "bod": 8.2, "turb": 28.0, "fc": 22000.0},
    }

    now = datetime.utcnow()
    for st in station_objs:
        prof = station_profiles.get(st.code, {"ph": 7.0, "do": 5.0, "bod": 4.0, "turb": 10.0, "fc": 1000.0})
        for i in range(4):
            m_date = now - timedelta(days=i * 28)
            jitter = (random.random() - 0.5) * 0.1
            calc = calculate_river_health_score(
                ph=round(prof["ph"] * (1 + jitter), 2),
                do_mgl=round(max(0.1, prof["do"] * (1 - jitter)), 2),
                bod_mgl=round(max(1.0, prof["bod"] * (1 + jitter)), 2),
                turbidity_ntu=round(prof["turb"] * (1 + jitter), 1),
                fecal_coliform=round(prof["fc"] * (1 + jitter), 0)
            )
            meas = Measurement(
                river_id=st.river_id,
                station_id=st.id,
                latitude=st.latitude,
                longitude=st.longitude,
                measured_at=m_date,
                ph=prof["ph"],
                do_mgl=prof["do"],
                bod_mgl=prof["bod"],
                turbidity_ntu=prof["turb"],
                fecal_coliform=prof["fc"],
                health_score=calc["score"],
                health_band=calc["band"],
                completeness_pct=calc["completeness_pct"],
                sub_scores_json=calc["sub_scores"],
                source="CPCB Realtime Grid",
                is_demo=True
            )
            db.add(meas)

    # 4. Realistic Incidents
    demo_incidents = [
        {
            "river_id": yamuna.id,
            "track": "R-2026-10492",
            "lat": 28.6432, "lng": 77.2530,
            "loc": "ITO Bridge Underpass Drain Outfall",
            "type": "industrial_discharge",
            "desc": "Heavy toxic white foam and pungent chemical smell bubbling near the stormwater drain outlet.",
            "evidence": 88.0,
            "conf": ConfidenceLevel.HIGH.value,
            "sev": SeverityLevel.CRITICAL.value,
            "status": IncidentStatus.ACTION_TAKEN.value,
            "assigned_to": "Officer V. Sharma (DPCC Triage Cell)",
            "assigned_org": "Delhi Pollution Control Committee",
            "reported_days_ago": 6
        },
        {
            "river_id": yamuna.id,
            "track": "R-2026-10498",
            "lat": 28.5695, "lng": 77.3025,
            "loc": "Kalindi Kunj Ghat / Agra Canal Junction",
            "type": "sewage",
            "desc": "Untreated black sludge dumping directly into main river stream from unauthorized tankers.",
            "evidence": 92.0,
            "conf": ConfidenceLevel.HIGH.value,
            "sev": SeverityLevel.HIGH.value,
            "status": IncidentStatus.UNDER_INVESTIGATION.value,
            "assigned_to": "Sub-divisional Magistrate (South East)",
            "assigned_org": "Revenue & Municipal Enforcement",
            "reported_days_ago": 3
        },
        {
            "river_id": yamuna.id,
            "track": "R-2026-10512",
            "lat": 28.6765, "lng": 77.2355,
            "loc": "Old Yamuna Bridge Ghat",
            "type": "plastic_waste",
            "desc": "Substantial plastic garlands, polythene bags and religious waste choking the river bank edge.",
            "evidence": 76.0,
            "conf": ConfidenceLevel.HIGH.value,
            "sev": SeverityLevel.MEDIUM.value,
            "status": IncidentStatus.ASSIGNED.value,
            "assigned_to": "MCD Sanitation Zone 3",
            "assigned_org": "Municipal Corporation of Delhi",
            "reported_days_ago": 2
        },
        {
            "river_id": yamuna.id,
            "track": "R-2026-10530",
            "lat": 28.6148, "lng": 77.2735,
            "loc": "Nizamuddin Railway Drain Convergence",
            "type": "sewage",
            "desc": "Sewage overflow bypassing the secondary treatment pump station after heavy rain.",
            "evidence": 82.0,
            "conf": ConfidenceLevel.HIGH.value,
            "sev": SeverityLevel.HIGH.value,
            "status": IncidentStatus.REPORTED.value,
            "assigned_to": None,
            "assigned_org": None,
            "reported_days_ago": 1
        },
        {
            "river_id": yamuna.id,
            "track": "R-2026-10410",
            "lat": 28.7125, "lng": 77.2298,
            "loc": "Wazirabad Upstream Embankment",
            "type": "plastic_waste",
            "desc": "Debris pile cleared and temporary floating boom barrier installed.",
            "evidence": 95.0,
            "conf": ConfidenceLevel.HIGH.value,
            "sev": SeverityLevel.LOW.value,
            "status": IncidentStatus.RESOLVED.value,
            "assigned_to": "DJB Field Operations",
            "assigned_org": "Delhi Jal Board",
            "reported_days_ago": 12
        }
    ]

    for inc in demo_incidents:
        rep_time = now - timedelta(days=inc["reported_days_ago"])
        incident_obj = Incident(
            tracking_number=inc["track"],
            river_id=inc["river_id"],
            latitude=inc["lat"],
            longitude=inc["lng"],
            location_name=inc["loc"],
            pollution_type=inc["type"],
            description=inc["desc"],
            image_url="/uploads/demo_pollution.jpg",
            evidence_score=inc["evidence"],
            confidence=inc["conf"],
            severity=inc["sev"],
            ai_predicted_type=inc["type"],
            ai_confidence=0.89,
            status=inc["status"],
            assigned_to=inc["assigned_to"],
            assigned_org=inc["assigned_org"],
            is_demo=True,
            reported_at=rep_time,
            updated_at=rep_time + timedelta(hours=12)
        )
        db.add(incident_obj)
        db.commit()
        db.refresh(incident_obj)

        event = IncidentEvent(
            incident_id=incident_obj.id,
            from_status=None,
            to_status=IncidentStatus.REPORTED.value,
            actor_name="Citizen Guard",
            actor_role="citizen",
            note="Citizen reported pollution incident with verified GPS and in-app photo.",
            created_at=rep_time
        )
        db.add(event)

        if inc["status"] != IncidentStatus.REPORTED.value:
            ev2 = IncidentEvent(
                incident_id=incident_obj.id,
                from_status=IncidentStatus.REPORTED.value,
                to_status=inc["status"],
                actor_name=inc["assigned_to"] or "Command Center AI Dispatcher",
                actor_role="authority",
                note=f"Incident transitioned to {inc['status']}. Assigned to {inc['assigned_org'] or 'Local Cell'}.",
                created_at=rep_time + timedelta(hours=10)
            )
            db.add(ev2)

    db.commit()
    print("Database seeding completed successfully!")
    return True
