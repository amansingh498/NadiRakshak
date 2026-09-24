from typing import Dict, Any, List, Optional
from datetime import datetime
from app.models.database import IncidentStatus

# Valid lifecycle state transitions
VALID_TRANSITIONS: Dict[str, List[str]] = {
    IncidentStatus.REPORTED.value: [IncidentStatus.TRIAGED.value, IncidentStatus.RESOLVED.value],
    IncidentStatus.TRIAGED.value: [IncidentStatus.VERIFIED.value, IncidentStatus.RESOLVED.value],
    IncidentStatus.VERIFIED.value: [IncidentStatus.ASSIGNED.value, IncidentStatus.UNDER_INVESTIGATION.value],
    IncidentStatus.ASSIGNED.value: [IncidentStatus.UNDER_INVESTIGATION.value, IncidentStatus.ACTION_TAKEN.value],
    IncidentStatus.UNDER_INVESTIGATION.value: [IncidentStatus.ACTION_TAKEN.value, IncidentStatus.RESOLVED.value],
    IncidentStatus.ACTION_TAKEN.value: [IncidentStatus.RESOLVED.value, IncidentStatus.POST_RESOLUTION_CHECK.value],
    IncidentStatus.POST_RESOLUTION_CHECK.value: [IncidentStatus.RESOLVED.value, IncidentStatus.UNDER_INVESTIGATION.value],
    IncidentStatus.RESOLVED.value: [IncidentStatus.REPORTED.value] # Re-open if recurring
}

# SLA configurations in hours
SLA_HOURS_MAP: Dict[str, int] = {
    IncidentStatus.REPORTED.value: 24,
    IncidentStatus.TRIAGED.value: 48,
    IncidentStatus.VERIFIED.value: 72,
    IncidentStatus.ASSIGNED.value: 96,
    IncidentStatus.UNDER_INVESTIGATION.value: 168, # 7 days
    IncidentStatus.ACTION_TAKEN.value: 72,
    IncidentStatus.POST_RESOLUTION_CHECK.value: 168,
}

def is_transition_valid(current_status: str, target_status: str) -> bool:
    """Verifies whether moving from current_status to target_status is permitted."""
    allowed = VALID_TRANSITIONS.get(current_status, [])
    return target_status in allowed

def check_sla_breach(current_status: str, updated_at: datetime) -> Dict[str, Any]:
    """Calculates if the incident has exceeded the SLA for its current state."""
    sla_limit = SLA_HOURS_MAP.get(current_status, 72)
    elapsed_hours = (datetime.utcnow() - updated_at).total_seconds() / 3600.0
    is_breached = elapsed_hours > sla_limit
    return {
        "is_breached": is_breached,
        "elapsed_hours": round(elapsed_hours, 1),
        "sla_limit_hours": sla_limit,
        "overdue_hours": round(max(0.0, elapsed_hours - sla_limit), 1)
    }
