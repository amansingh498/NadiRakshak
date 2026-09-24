# NadiRakshak (River Health Platform) 🌊

> **Know your river. Protect your river. Track whether it actually gets cleaner.**

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com)
[![React 18](https://img.shields.io/badge/React-18.3+-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.2+-646CFF.svg)](https://vitejs.dev/)
[![CPCB Standards](https://img.shields.io/badge/Water%20Quality-CPCB%20Class%20B-10b981.svg)](https://cpcb.nic.in/water-quality-criteria/)

NadiRakshak is an open-source, scientific environmental platform designed to safeguard India's rivers. It combines **CPCB-standardized water-quality telemetry**, **cryptographically verified citizen pollution reporting**, **AI-assisted spatial hotspot triage**, and an **enforced municipal accountability lifecycle** with measurable before/after impact snapshots.

---

## 🏛 Architecture & Key Features

```
                               ┌─────────────────────────────┐
                               │     CITIZEN & PUBLIC APP    │
                               │  - Live River Health Map    │
                               │  - Geo-tagged Photo Report  │
                               └──────────────┬──────────────┘
                                              │
                      Evidence Verification (pHash, GPS, Buffer)
                                              ▼
┌───────────────────────────┐      ┌─────────────────────────────┐      ┌─────────────────────────────┐
│    CPCB WATER QUALITY     │─────▶│   FASTAPI BACKEND & AI      │◀─────│     AUTHORITY DASHBOARD     │
│  - pH, DO, BOD, FC, Turb  │      │  - DBSCAN Hotspot Detection │      │  - 8-Stage Lifecycle State  │
│  - 0-100 Scientific Score │      │  - AI Vision Triage Model   │      │  - SLA Breach Monitoring    │
└───────────────────────────┘      └──────────────┬──────────────┘      └─────────────────────────────┘
                                                  │
                                                  ▼
                                   ┌─────────────────────────────┐
                                   │  BEFORE / AFTER IMPACT LOG  │
                                   │  - kL/day Discharge Stopped │
                                   │  - Verified River Recovery  │
                                   └─────────────────────────────┘
```

### 1. 🧪 Scientific River Health Scoring (0–100)
- Fully transparent sub-indexing based on **Central Pollution Control Board (CPCB)** *Designated Best Use Class B (Outdoor Bathing)* criteria:
  - **Dissolved Oxygen (DO)**: $\ge 5.0\text{ mg/L}$ (Weight: 30%)
  - **Biochemical Oxygen Demand (BOD)**: $\le 3.0\text{ mg/L}$ (Weight: 30%)
  - **pH Value**: 6.5 – 8.5 (Weight: 15%)
  - **Fecal Coliform**: $\le 500\text{ MPN/100 mL}$ (Weight: 15%)
  - **Turbidity**: $\le 10.0\text{ NTU}$ (Weight: 10%)
- Categorized into clear health bands: `Excellent (80-100)`, `Good (60-79)`, `Moderate (40-59)`, `Poor (20-39)`, and `Critical (0-19)`.
- Explicitly labeled as **platform estimates** distinct from official advisories.

### 2. 📸 Citizen Reporting & Anti-Spoofing Verification
- In-app photo capture with geo-coordinates.
- **Perceptual Hash (`pHash`)**: Detects and penalizes duplicate / re-uploaded images.
- **River Proximity Buffer**: Evaluates distance within river vector geometry.
- Multi-factor evidence scoring producing confidence ratings (`HIGH`, `MEDIUM`, `LOW`).

### 3. 🛡 Authority Incident State Machine & SLA Accountability
- Strictly enforced 8-stage lifecycle:
  $$\text{REPORTED} \rightarrow \text{TRIAGED} \rightarrow \text{VERIFIED} \rightarrow \text{ASSIGNED} \rightarrow \text{UNDER\_INVESTIGATION} \rightarrow \text{ACTION\_TAKEN} \rightarrow \text{RESOLVED} \rightarrow \text{POST\_RESOLUTION\_CHECK}$$
- Cryptographic event audit trail for every officer action.
- Automatic **SLA countdown and overdue breach alerts**.

### 4. 🧠 AI Hotspot Intelligence
- **DBSCAN Spatial Clustering**: Detects recurring pollution clusters and outfall points with centroid and radius calculations.
- **Vision Triage Classifier**: Automatic categorization of incoming imagery (industrial chemical froth, domestic sewage, plastic accumulation, hypoxia/fish mortality).

### 5. 📈 Measurable Environmental Impact
- Before vs. After baseline tracking upon remediation action.
- Telemetry on **kL/day untreated effluent prevented** and **downstream population protected**.

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** & **npm**
- *(Optional)* Docker & Docker Compose

### 1. Clone & Navigate
```bash
git clone https://github.com/your-org/NadiRakshak.git
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
Backend API will run at `http://127.0.0.1:8000`.  
Swagger interactive documentation at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🐳 Running with Docker Compose

To launch the complete containerized stack:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`

---

## 📂 Project Structure

```
NadiRakshak/
├── backend/
│   ├── app/
│   │   ├── models/            # SQLAlchemy database models
│   │   ├── services/          # Health score, lifecycle, evidence & AI clustering
│   │   ├── db.py              # Engine & session management
│   │   └── main.py            # FastAPI endpoints
│   ├── tests/                 # Pytest unit tests
│   ├── requirements.txt       # Python dependencies
│   └── seed.py                # Pilot river & demo incident generator
├── frontend/
│   ├── src/
│   │   ├── components/        # RiverHealthMap, CitizenReportForm, AuthorityDashboard, Impact
│   │   ├── types/             # TypeScript schema definitions
│   │   ├── App.tsx            # Main application shell
│   │   └── index.css          # Dark glassmorphic design system
│   ├── package.json
│   └── vite.config.ts
├── config/
│   └── standards.yaml         # Official CPCB parameter thresholds & weights
├── docs/
│   └── ASSUMPTIONS.md         # Data sources, proxy methods, and domain rules
├── PROGRESS.md                # Phase execution milestones
└── docker-compose.yml         # Container deployment configuration
```

---

## 📜 Domain Integrity & Claims Policy
- All AI predictions are explicitly labeled as **decision triage aids, not legal proof**.
- Water quality measurements are labeled as **platform estimates based on CPCB criteria**.
- Any demo or synthetic seed data is explicitly flagged with `is_demo = true` in both API responses and UI displays.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
