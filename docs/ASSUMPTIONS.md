# River Health Platform (NadiRakshak) - Engineering Assumptions & Sources

## 1. Water Quality Criteria
- Standards sourced directly from **Central Pollution Control Board (CPCB)** *Water Quality Criteria for Designated Best Use (Class B: Outdoor Bathing)*.
- Primary Parameters:
  - **pH**: 6.5 – 8.5
  - **Dissolved Oxygen (DO)**: $\ge 5.0\text{ mg/L}$
  - **Biochemical Oxygen Demand (BOD)**: $\le 3.0\text{ mg/L}$
  - **Fecal Coliform**: Desirable $\le 500\text{ MPN/100 mL}$, Permissible $\le 2500\text{ MPN/100 mL}$
- Source config file: `config/standards.yaml`

## 2. Evidence Scoring & Anti-Spoofing Rules
- **GPS Proximity**: Incidents located within $\le 500\text{ m}$ of registered river geometries receive positive verification weight.
- **In-App Camera & pHash**: Perceptual hash calculated on ingestion to flag and down-rank duplicate image submissions.
- **Corroboration**: Spatial clustering ($\le 1.0\text{ km}$) of citizen reports within 72 hours boosts confidence to HIGH.

## 3. Impact & Metric Estimation
- **Discharge Stopped (kL/day)**: Approximated based on standardized drain outfall capacity and municipal storm drain average flow models.
- **Downstream Population Benefitted**: Estimated from ward-level census aggregation within 10 km downstream buffer.
- *All estimated figures are explicitly labeled as estimates in UI per domain rules.*
