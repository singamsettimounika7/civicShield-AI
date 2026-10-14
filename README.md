# CivicShield AI

> **“Spot the Risk. Alert the Community. Prevent the Harm.”**

CivicShield AI is an intelligent, accessible community safety platform that helps citizens report everyday public hazards (potholes, waterlogging, open drains, fallen trees, electrical hazards, broken streetlights), assists moderators in rapid verification, detects duplicate reports, and communicates useful safety warnings to the community.

---

## 🌟 Key Features

1. **Cinematic Landing Page (`/`)**:
   - Hero text: *“Safer streets start with someone speaking up.”*
   - Live safety preview cards (Recently Submitted, Verified Hazard, Resolved Community Issue).
   - Real-time community metrics counters and 4-stage lifecycle breakdown.

2. **Community Safety Map (`/map`)**:
   - Leaflet interactive map with custom colored hazard pins and pulse rings for critical hazards.
   - Filters by category, status, and text search.
   - Map / List view toggle with slide-out hazard inspection drawer.
   - Graceful offline fallback if external map tiles cannot be fetched.

3. **Multi-Step Report Submission Wizard (`/report`)**:
   - **Step 1: Category Selection** (Road Damage, Waterlogging, Open Drain, Electrical Hazard, etc.).
   - **Step 2: Evidence Upload** with preview, format validation, and demo photo presets.
   - **Step 3: Location Pinning** with interactive map click and optional GPS permission.
   - **Step 4: Details & Severity** (Title, description, impact, observed severity).
   - **Step 5: Real-Time AI Triage Preview** displaying calculated risk score, reasoning, and duplicate suggestions before final submission.
   - Real SQLite database persistence with immediate success screen and unique report code (e.g. `CS-2025-0101`).

4. **Community Risk Intelligence Engine (AI Feature)**:
   - Multi-factor risk calculation combining category baseline, severity multiplier, sensitive vulnerability proximity (e.g. schools, transit hubs, hospitals), and duplicate clustering density.
   - Spatial duplicate detection algorithm using Haversine distance and text similarity.
   - Dual-mode architecture: connects to live Gemini/OpenAI API if keys are provided, or runs on a transparent, deterministic rule engine fallback with 0 external API dependencies.

5. **Report Detail & Audit Timeline (`/reports/:id`)**:
   - Full photographic evidence display, map pinpoint, and AI triage breakdown.
   - Immutable audit trail recording every state transition (`Submitted` → `Verified` → `In Progress` → `Resolved`).
   - Community confirmation button (`+1 Confirmed`) with session deduplication.

6. **City Moderator Desk (`/moderator`)**:
   - Pending report queue sorted by Risk Score (Critical first).
   - One-click verification and duplicate closing controls.
   - Inspection drawer with evidence zoom, moderator notes, and resolution proof logging.
   - 1-click **Role Switcher** in the navbar to toggle between Citizen, Moderator, and Admin views.

7. **Community Impact Analytics (`/impact`)**:
   - Recharts visual data charts: category distribution bar chart, severity pie chart, and 7-day activity & resolution area trend.
   - Average review time KPI and confirmed resolution counters.
   - **Export Impact Card** feature generating a shareable summary image via HTML5 Canvas.

8. **Community Safety Cards (`/feed` and modal)**:
   - Generates visually polished 16:9 social cards with category, location, status, and safety advisories.
   - Instant HTML5 Canvas PNG download.
   - Copyable pre-formatted caption for WhatsApp, SMS, and Instagram.

---

## 🏗️ Technology Stack & Architecture

```
d:/singamsettimounika7_demo_codes_files/
├── backend/
│   ├── app/
│   │   ├── config.py         # App configuration & AI keys
│   │   ├── database.py       # SQLite engine & session
│   │   ├── models.py         # SQLAlchemy models (User, HazardReport, AIAnalysis, StatusHistory)
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── ai_service.py     # Community Risk Intelligence Engine
│   │   ├── auth.py           # JWT auth & demo roles
│   │   ├── seed_data.py      # Realistic urban hazard seed records
│   │   └── main.py           # FastAPI application & REST endpoints
│   ├── tests/
│   │   └── test_api.py       # Test suite
│   └── run.py                # Backend server runner
├── src/
│   ├── components/           # Reusable UI components (Navbar, Footer, MapView, HazardCard, etc.)
│   ├── pages/                # All 8 connected application views
│   ├── services/
│   │   ├── api.ts            # Typed client with automatic fallback
│   │   └── mockData.ts       # Embedded demo seed dataset
│   ├── types/
│   │   └── index.ts          # TypeScript type definitions
│   ├── index.css             # Tailwind base & glassmorphic tokens
│   ├── App.tsx               # Root router
│   └── main.tsx              # React entry point
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── .env.example
└── README.md
```

---

## 🚀 How to Run Locally

### 1. Start the FastAPI Backend Server
```bash
# From workspace root:
python backend/run.py
```
*Backend runs on `http://127.0.0.1:8000` with API docs at `http://127.0.0.1:8000/docs`.*

### 2. Start the React/Vite Frontend
```bash
# In a new terminal window:
npm run dev
# Or:
npx vite --port 3000 --host 127.0.0.1
```
*Frontend runs on `http://127.0.0.1:3000`.*

---

## 🧪 Running the Backend Test Suite

To run the automated backend test suite (testing database seeding, health checks, AI risk scoring, duplicate detection, moderator verification, and community upvote deduplication):

```bash
python backend/tests/test_api.py
```

Expected output:
```
========================================
CIVICSHIELD AI - BACKEND TEST SUITE
========================================
[1/7] Seeding test database...
  [OK] Database seeded successfully
[2/7] Testing health check endpoint...
  [OK] Health check passed.
[3/7] Testing reports retrieval and seed verification...
  [OK] Retrieved reports with diverse statuses.
[4/7] Testing AI text classification & multi-factor risk prioritization...
  [OK] AI Classification & Risk Score (Critical)
[5/7] Testing duplicate candidate detection...
  [OK] Duplicate detected: CS-101 (Similarity: 98.0%)
[6/7] Testing report creation, AI triage save, and Moderator Verification...
  [OK] Report created and successfully verified by moderator.
[7/7] Testing dashboard analytics & community upvote deduplication...
  [OK] Community support deduplication verified.
========================================
ALL TESTS PASSED! Backend is 100% healthy.
========================================
```

---

## 🎭 Role Switcher & Demo Walkthrough

In the top navigation bar, use the **Role Switcher** pills to switch instantly between:
- 👤 **Citizen**: Default view to submit hazards, browse the map, upvote reports, and generate safety cards.
- 🛡️ **Moderator**: Unlocks the **Moderator Desk** (`/moderator`) with verification controls, duplicate merging, and status updates.
- ⚙️ **Admin**: High-level administrative view.

### 5-Minute Evaluator Walkthrough:
1. Open `http://127.0.0.1:3000/` and review the landing page hero, metrics, and problem breakdown.
2. Click **“Explore Safety Map”** (`/map`). Click any pin on the map to open the detail drawer. Toggle to List view.
3. Click **“Report Hazard”** (`/report`). Follow the 5-step wizard:
   - Select **Open Drain / Manhole**.
   - Select a sample photo preset or upload a picture.
   - Pin the location on the map.
   - Enter details and select **Critical** severity.
   - Review the **Community Risk Intelligence** AI card showing calculated risk score and duplicate candidate warning.
   - Click **Confirm & Submit Report** to write to the database and generate a unique report ID.
4. Click **“Moderator Desk”** (`/moderator`) in the navbar.
5. Select the newly submitted report from the queue, review evidence, and click **Verify**.
6. Open **Impact Dashboard** (`/impact`) to see live updated statistics, category distribution, and export a PNG summary card.
7. Open **Community Feed** (`/feed`), click **Share Card** on any hazard, and test downloading the safety PNG or copying the WhatsApp caption.

---

## ⚖️ Ethics, Privacy & Disclaimers

- **Not an Emergency Service**: CivicShield AI is a community reporting and awareness tool, not an official 911 dispatch.
- **Transparent AI**: Clear disclaimers explain that AI prioritization is an assistance tool; issues require physical verification before work order dispatch.
- **Privacy First**: No private residential addresses are exposed. Geolocation is requested strictly with explicit user consent.
