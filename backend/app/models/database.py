from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON, Enum
)
from sqlalchemy.orm import declarative_base, relationship
import enum

Base = declarative_base()

class IncidentStatus(str, enum.Enum):
    REPORTED = "REPORTED"
    TRIAGED = "TRIAGED"
    VERIFIED = "VERIFIED"
    ASSIGNED = "ASSIGNED"
    UNDER_INVESTIGATION = "UNDER_INVESTIGATION"
    ACTION_TAKEN = "ACTION_TAKEN"
    RESOLVED = "RESOLVED"
    POST_RESOLUTION_CHECK = "POST_RESOLUTION_CHECK"

class IncidentType(str, enum.Enum):
    SEWAGE = "sewage"
    INDUSTRIAL_DISCHARGE = "industrial_discharge"
    PLASTIC_WASTE = "plastic_waste"
    OIL_CHEMICAL = "oil_chemical"
    DEAD_FISH = "dead_fish"
    OTHER = "other"

class ConfidenceLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class SeverityLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class UserRole(str, enum.Enum):
    CITIZEN = "citizen"
    AUTHORITY = "authority"
    ADMIN = "admin"

class River(Base):
    __tablename__ = "rivers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    state = Column(String(100), nullable=True)
    length_km = Column(Float, nullable=True)
    # Stored as GeoJSON linestring or coordinates array for lightweight multi-DB support
    geometry_geojson = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    stations = relationship("Station", back_populates="river")
    measurements = relationship("Measurement", back_populates="river")
    incidents = relationship("Incident", back_populates="river")

class Station(Base):
    __tablename__ = "stations"

    id = Column(Integer, primary_key=True, index=True)
    river_id = Column(Integer, ForeignKey("rivers.id"), nullable=False)
    name = Column(String(150), nullable=False)
    code = Column(String(50), unique=True, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    district = Column(String(100), nullable=True)
    source = Column(String(100), default="CPCB/NWMP")

    river = relationship("River", back_populates="stations")
    measurements = relationship("Measurement", back_populates="station")

class Measurement(Base):
    __tablename__ = "measurements"

    id = Column(Integer, primary_key=True, index=True)
    river_id = Column(Integer, ForeignKey("rivers.id"), nullable=False)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    measured_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    ph = Column(Float, nullable=True)
    do_mgl = Column(Float, nullable=True)
    bod_mgl = Column(Float, nullable=True)
    cod_mgl = Column(Float, nullable=True)
    turbidity_ntu = Column(Float, nullable=True)
    fecal_coliform = Column(Float, nullable=True)
    
    # Pre-calculated health score metrics
    health_score = Column(Float, nullable=True)
    health_band = Column(String(50), nullable=True)
    completeness_pct = Column(Float, nullable=True)
    sub_scores_json = Column(JSON, nullable=True)

    source = Column(String(100), default="CPCB/NWMP")
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    river = relationship("River", back_populates="measurements")
    station = relationship("Station", back_populates="measurements")

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    tracking_number = Column(String(50), unique=True, index=True)  # e.g. R-2026-0001
    river_id = Column(Integer, ForeignKey("rivers.id"), nullable=False)
    
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_name = Column(String(200), nullable=True)
    
    reported_at = Column(DateTime, default=datetime.utcnow)
    pollution_type = Column(String(50), default="sewage")
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    image_hash = Column(String(100), nullable=True) # Perceptual hash for dedup

    # Evidence & AI triage
    evidence_score = Column(Float, default=50.0) # 0-100
    confidence = Column(String(20), default=ConfidenceLevel.MEDIUM.value) # HIGH, MEDIUM, LOW
    severity = Column(String(20), default=SeverityLevel.MEDIUM.value)     # LOW, MEDIUM, HIGH, CRITICAL
    ai_predicted_type = Column(String(50), nullable=True)
    ai_confidence = Column(Float, nullable=True)

    status = Column(String(50), default=IncidentStatus.REPORTED.value)
    assigned_to = Column(String(150), nullable=True)
    assigned_org = Column(String(150), nullable=True)
    is_demo = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    river = relationship("River", back_populates="incidents")
    events = relationship("IncidentEvent", back_populates="incident", order_by="IncidentEvent.created_at.asc()")
    impact_snapshot = relationship("ImpactSnapshot", back_populates="incident", uselist=False)

class IncidentEvent(Base):
    __tablename__ = "incident_events"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    from_status = Column(String(50), nullable=True)
    to_status = Column(String(50), nullable=False)
    actor_name = Column(String(100), default="System")
    actor_role = Column(String(50), default="authority")
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    incident = relationship("Incident", back_populates="events")

class Hotspot(Base):
    __tablename__ = "hotspots"

    id = Column(Integer, primary_key=True, index=True)
    river_id = Column(Integer, ForeignKey("rivers.id"), nullable=False)
    name = Column(String(150), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    radius_meters = Column(Float, default=500.0)
    incident_count = Column(Integer, default=1)
    confidence = Column(Float, default=0.8) # 0-1
    detected_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

class ImpactSnapshot(Base):
    __tablename__ = "impact_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False, unique=True)
    baseline_metrics = Column(JSON, nullable=True) # { "bod": 14.2, "do": 1.1, "reports_count": 5 }
    followup_metrics = Column(JSON, nullable=True) # { "bod": 3.8, "do": 4.9, "reports_count": 0 }
    outcome = Column(String(50), default="IMPROVED") # IMPROVED, NO_CHANGE, WORSENED
    discharge_prevented_kld = Column(Float, default=0.0) # Estimated kL/day
    created_at = Column(DateTime, default=datetime.utcnow)

    incident = relationship("Incident", back_populates="impact_snapshot")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(150), unique=True, index=True, nullable=False)
    full_name = Column(String(150), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default=UserRole.CITIZEN.value) # citizen, authority, admin
    organization = Column(String(150), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
