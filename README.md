# NadiRakshak (River Health Platform) 🌊

> **Know your river. Protect your river. Track whether it actually gets cleaner.**

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com)
[![React 18](https://img.shields.io/badge/React-18.3+-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-3178C6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.2+-646CFF.svg)](https://vitejs.dev/)
[![CPCB Standards](https://img.shields.io/badge/Water%20Quality-CPCB%20Class%20B-10b981.svg)](https://cpcb.nic.in/water-quality-criteria/)
[![Docker Ready](https://img.shields.io/badge/Docker-Production%20Ready-2496ED.svg)](https://www.docker.com/)

NadiRakshak is an open-source, scientific environmental monitoring and incident accountability platform designed for India's rivers. It combines **CPCB-standardized water-quality telemetry**, **Copernicus Sentinel-2 satellite optical gap-filling**, **NGO/testing lab CSV batch ingestion**, **a non-technical Ghat Bathing Safety Advisory**, **citizen complaint tracking**, **major drain & STP infrastructure mapping**, and an **enforced municipal accountability lifecycle** with verified before/after impact snapshots.

---

## 🏛 Architecture & Key Features

```
                                ┌────────────────────────────────────────────────────────┐
                                │               CITIZEN & PUBLIC WEB APP                 │
                                │  - Live River Health Map & Sentinel-2 Optical Overlay  │
                                │  - "Is It Safe to Bathe Today?" Ghat Safety Advisory   │
                                │  - Citizen Geo-tagged Photo Reporting                  │
                                │  - 🔍 Real-Time Complaint Tracking by Incident ID      │
                                └───────────────────────────┬────────────────────────────┘
                                                            │
                                    Evidence Scoring (pHash, River Buffer, Anomaly)
                                                            ▼
┌─────────────────────────────────┐      ┌─────────────────────────────────┐      ┌─────────────────────────────────┐
│     DATA INGESTION CHANNELS     │─────▶│      FASTAPI BACKEND & AI       │◀─────│       AUTHORITY DASHBOARD       │
│  - CPCB Sensor Telemetry        │      │  - DBSCAN Hotspot Clustering    │      │  - 8-Stage Lifecycle Machine    │
│  - Sentinel-2 NDTI Satellite    │      │  - Optical Turbidity Modelling  │      │  - SLA Breach Countdown & Escal │
│  - NGO & Lab CSV/JSON Batch     │      │  - Rule & Vision AI Triage      │      │  - Officer Audit Trail & Proof  │
└─────────────────────────────────┘      └────────────────┬────────────────┘      └─────────────────────────────────┘
                                                          │
                                                          ▼
                                         ┌─────────────────────────────────┐
                                         │    MEASURABLE IMPACT ENGINE     │
                                         │  - kL/day Effluent Stopped      │
                                         │  - Inflow Drains & STP Mapping  │
                                         │  - Verified River Recovery      │
                                         └─────────────────────────────────┘
```

### 1. 🧪 Scientific River Health Scoring (0–100) & NGO Batch Ingestion
- Transparent sub-indexing based on **Central Pollution Control Board (CPCB)** *Designated Best Use Class B (Outdoor Bathing)* criteria:
  - **Dissolved Oxygen (DO)**: $\ge 5.0\text{ mg/L}$ (Weight: 30%)
  - **Biochemical Oxygen Demand (BOD)**: $\le 3.0\text{ mg/L}$ (Weight: 30%)
  - **pH Value**: 6.5 – 8.5 (Weight: 15%)
  - **Fecal Coliform**: $\le 500\text{ MPN/100 mL}$ (Weight: 15%)
  - **Turbidity**: $\le 10.0\text{ NTU}$ (Weight: 10%)
- **NGO & Lab CSV Batch Uploader**: External water testing vans and citizen labs can upload CSV/JSON field test results directly via the UI, instantly updating the map and calculating compliance scores.

### 2. 🛰 Copernicus Sentinel-2 Optical Gap-Filling
- Fills monitoring blind spots between physical in-situ stations using ESA Copernicus Sentinel-2 Level-2A BOA reflectance.
- Computes **NDTI (Normalized Difference Turbidity Index)** across unmonitored river reaches:
  $$\text{NDTI} = \frac{B04 - B03}{B04 + B03}$$
- Renders dashed optical turbidity segments dynamically along the river geometry.

### 3. 🌊 "Is It Safe to Bathe Today?" Ghat Safety Advisory
- Non-technical, plain-language religious bathing guidance for pilgrims at major ghats (Haridwar, Varanasi, Prayagraj, Yamuna Ghats).
- Translates chemical metrics into ritual safety guidance:
  - 🟢 **Full Snan Safe**: $DO \ge 5\text{ mg/L}$, $BOD \le 3\text{ mg/L}$, low coliform.
  - 🟡 **Caution / Marjana Only**: High bacterial count; light sprinkling recommended instead of deep immersion.
  - 🔴 **Hazardous / Avoid Immersion**: Direct raw sewage discharge detected; high skin/eye infection risk.
- Includes one-click camera zoom to each ghat on the interactive map.

### 4. 🔍 Public Citizen "Track My Complaint" Engine
- Citizens can enter their incident number (e.g., `#R-2026-1001`) from anywhere in the app.
- Inspects real-time verification status, assigned authority office, SLA remaining hours, and official action notes.
- Displays verified environmental remediation impact (e.g. *350 KLD discharge prevented, 42% BOD reduction*).

### 5. 🏭 Major Inflow Drains & Sewage Treatment Plant (STP) Overlay
- Interactive map markers for major pollution outfalls and municipal treatment infrastructure:
  - **Major Drains (🌊)**: Najafgarh Drain (2,050 MLD), Shahdara Drain (480 MLD), Barapullah Drain (320 MLD), Assi River Outfall (110 MLD).
  - **STP Facilities (🏭)**: Okhla STP (564 MLD BNR), Coronation Pillar Phase III (318 MLD), Dinapur STP (140 MLD ASP).

### 6. 🛡 Authority Incident State Machine & SLA Accountability
- Strictly enforced 8-stage lifecycle:
  $$\text{REPORTED} \rightarrow \text{TRIAGED} \rightarrow \text{VERIFIED} \rightarrow \text{ASSIGNED} \rightarrow \text{UNDER\_INVESTIGATION} \rightarrow \text{ACTION\_TAKEN} \rightarrow \text{RESOLVED} \rightarrow \text{POST\_RESOLUTION\_CHECK}$$
- Cryptographic event audit trail for every officer action.
- Automatic **SLA countdown and overdue breach alerts**.
- **pHash Anti-Spoofing**: Detects and penalizes duplicate or recycled citizen photos.

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** & **npm**
- *(Optional)* Docker & Docker Compose

### 1. Clone & Navigate
```bash
git clone https://github.com/amansingh498/NadiRakshak.git
cd NadiRakshak
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Run unit tests
python -m pytest tests

# Seed database with pilot river data (Yamuna & Ganga)
python seed.py

# Start FastAPI server
python -m uvicorn app.main:app --reload --port 8000
```
- Backend API: `http://127.0.0.1:8000`
- Interactive Swagger Docs: `http://127.0.0.1:8000/docs`

### 3. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🐳 Production Deployment with Docker Compose

To launch the complete containerized stack (FastAPI Backend + Multi-Stage Nginx Frontend + PostgreSQL 15):
```bash
docker-compose up --build -d
```
- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **Database**: PostgreSQL on port `5432`

---

## 📂 Project Structure

```
NadiRakshak/
├── backend/
│   ├── app/
│   │   ├── models/            # SQLAlchemy database models (Rivers, Stations, Measurements, Incidents)
│   │   ├── services/          # Health score, lifecycle, evidence pHash, AI clustering
│   │   ├── db.py              # Engine & session management (SQLite / PostgreSQL)
│   │   └── main.py            # FastAPI REST endpoints
│   ├── tests/                 # Pytest unit tests
│   ├── Dockerfile             # Production Python 3.11 container
│   ├── requirements.txt       # Python dependencies
│   └── seed.py                # Pilot river & demo incident generator
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── RiverHealthMap.tsx        # Leaflet map with drains, STPs, stations & satellite
│   │   │   ├── GhatSafetyAdvisory.tsx    # "Is It Safe to Bathe Today?" pilgrim advisory
│   │   │   ├── TrackComplaintModal.tsx   # Public citizen incident lookup modal
│   │   │   ├── BatchUploadModal.tsx      # NGO / Lab CSV bulk data ingestion
│   │   │   ├── TelegramAlertModal.tsx    # Multilingual alert bot simulator
│   │   │   ├── CitizenReportForm.tsx     # Geo-tagged incident reporting form
│   │   │   ├── AuthorityDashboard.tsx    # 8-stage state machine & remediation panel
│   │   │   ├── ImpactMetricsView.tsx     # Environmental recovery metrics
│   │   │   └── Navbar.tsx                # Glassmorphic header with quick actions
│   │   ├── types/             # TypeScript schema definitions
│   │   ├── App.tsx            # Main application shell
│   │   └── index.css          # Dark glassmorphic design system
│   ├── Dockerfile             # Multi-stage production build
│   ├── nginx.conf             # Production Nginx reverse proxy config
│   ├── package.json
│   └── vite.config.ts
├── config/
│   └── standards.yaml         # Official CPCB parameter thresholds & weights
├── docs/
│   └── ASSUMPTIONS.md         # Data sources, proxy methods, and domain rules
├── docker-compose.yml         # Full-stack production orchestration
└── README.md
```

---

## 📜 Domain Integrity & Claims Policy
- All AI predictions are explicitly labeled as **decision triage aids, not legal proof**.
- Water quality measurements are labeled as **platform estimates based on CPCB criteria**.
- Any demo or synthetic seed data is explicitly flagged with `is_demo = true` in both API responses and UI displays.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
