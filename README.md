# EcoBuild AI — Sustainable Construction Advisor

> **Design Smarter. Build Greener.**  
> An AI-powered full-stack web platform enabling architects, engineers, builders, institutions, and homeowners to evaluate building sustainability, predict lifecycle energy and carbon emissions, receive targeted engineering recommendations, compare design versions, and optimize construction decisions before construction begins.

---

## 1. System Architecture

```
                                +-----------------------------------+
                                |      EcoBuild AI Web Client       |
                                | (React 19 + Vite + Tailwind CSS)  |
                                +-----------------+-----------------+
                                                  |
                                      REST APIs / JWT Bearer
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                      FastAPI Backend Server                                       |
|                                                                                                   |
|  +--------------------+  +--------------------+  +--------------------+  +---------------------+  |
|  |    Auth Router     |  |  Projects Router   |  |   Designs Router   |  |   Analysis Router   |  |
|  |  (/api/auth)       |  |  (/api/projects)   |  |   (/api/designs)   |  |   (/api/analyze)    |  |
|  +--------------------+  +--------------------+  +--------------------+  +---------------------+  |
|  |  Compare Router    |  |  Optimize Router   |  |   Reports Router   |  |    Seed Router      |  |
|  |  (/api/compare)    |  |  (/api/optimize)   |  |   (/api/reports)   |  |    (/api/seed)      |  |
|  +--------------------+  +--------------------+  +--------------------+  +---------------------+  |
|                                                                                                   |
|  +---------------------------------------------------------------------------------------------+  |
|  |                               Core Engineering & AI Engines                                 |  |
|  |                                                                                             |  |
|  |  [Scikit-learn ML Energy Model]  --> Annual net kWh, EUI (kWh/m²/yr), Sub-system loads      |  |
|  |  [Embodied & Operational Carbon] --> Cradle-to-gate ICE v3.0, 50-yr lifecycle tCO2e         |  |
|  |  [ASHRAE Water Stewardship Model]--> Rainwater harvesting yield, greywater dual-circuit     |  |
|  |  [CapEx & OpEx Lifecycle Cost]   --> Construction premium, utility OpEx, payback period     |  |
|  |  [Sustainability Scoring Engine] --> Weighted 0-100 composite rating (Carbon 30%, etc.)    |  |
|  |  [AI Recommendation Advisor]     --> Prioritized actionable diagnostics (High/Med/Opp)      |  |
|  |  [Multi-Objective Optimizer]     --> Pareto trade-off solver (Cost, Carbon, Energy, Water)  |  |
|  +---------------------------------------------------------------------------------------------+  |
|                                                  |                                                |
|                                    Resilient Persistence Layer                                    |
|                                                  |                                                |
|                                                  v                                                |
|                     [MongoDB Atlas Cluster]  <=======>  [In-Memory Async Store]                    |
|                      (Production URI in .env)           (Zero-config Instant Local Fallback)      |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Technology Stack

### Frontend
- **Framework**: React 19, Vite
- **Styling**: Tailwind CSS (custom sustainability palette: dark green `#064e3b`, `#047857`, soft green `#ecfdf5`, slate charcoal text)
- **Routing**: React Router v7
- **HTTP Client**: Axios with automated JWT Bearer interceptor
- **Data Visualization**: Recharts (Bar Charts, Pie Charts, Radar Multi-Dimensional Diagrams)
- **Icons**: Lucide React

### Backend
- **Framework**: Python 3.11, FastAPI, Uvicorn
- **Validation**: Pydantic v2
- **Authentication**: JWT (JSON Web Tokens via python-jose) + bcrypt password hashing
- **Database Driver**: Motor / PyMongo (dual-mode architecture supporting live MongoDB Atlas with transparent zero-config in-memory fallback)
- **Reporting**: ReportLab PDF document compilation engine

### AI / ML & Physics
- **Libraries**: Scikit-learn, Pandas, NumPy, Joblib
- **Energy Prediction Model**: `RandomForestRegressor` ensemble pipeline with `StandardScaler` pre-trained on 6,000 thermodynamic building models calibrated against ASHRAE 90.1 benchmarks ($R^2 = 0.988$).
- **Carbon Accounting Engine**: ICE Database v3.0 cradle-to-gate embodied carbon factors for structural materials (reinforced concrete, mass timber CLT, recycled steel, low-carbon SCMs) and regional grid carbon intensity ($kgCO_2e/kWh$).
- **Water Stewardship Engine**: ASHRAE 189.1 baseline domestic demand, low-flow fixture conservation, rooftop precipitation runoff harvesting cistern yield, and dual-plumbing greywater reuse.

---

## 3. Database Collections & Schema

### `users`
```json
{
  "_id": "uuid-string",
  "name": "Jane Doe",
  "email": "jane@studio.com",
  "passwordHash": "$2b$12$...",
  "role": "Architect",
  "createdAt": "2026-09-09T12:00:00Z"
}
```

### `projects`
```json
{
  "_id": "uuid-string",
  "user_id": "user-uuid",
  "project_name": "Cedar Ridge Suburban Home",
  "building_type": "Residential",
  "location": "Chicago, IL",
  "description": "Comparative assessment...",
  "latest_score": 78.4,
  "latest_rating_tier": "Gold / Advanced Sustainable",
  "design_count": 2,
  "createdAt": "2026-09-09T12:00:00Z",
  "updatedAt": "2026-09-09T12:00:00Z"
}
```

### `designs`
```json
{
  "_id": "uuid-string",
  "project_id": "project-uuid",
  "design_name": "Design A (Initial Baseline)",
  "description": "Conventional code envelope specification",
  "parameters": {
    "built_up_area": 240.0,
    "num_floors": 2,
    "occupants": 4,
    "operating_hours": 14.0,
    "building_orientation": "South-Facing",
    "structural_material": "Reinforced Concrete",
    "wall_material": "Standard Brick",
    "flooring_material": "Ceramic Tiles",
    "roof_material": "Asphalt Shingles",
    "insulation_type": "Fiberglass Batt",
    "recycled_material_percentage": 10.0,
    "window_type": "Standard Aluminum",
    "window_to_wall_ratio": 28.0,
    "glazing_type": "Double Glazed Standard",
    "external_shading": false,
    "natural_ventilation": false,
    "electricity_source": "Municipal Grid",
    "solar_installed": true,
    "solar_capacity": 6.5,
    "hvac_system": "High-Efficiency Air-Source Heat Pump",
    "led_lighting": true,
    "water_source": "Municipal Supply",
    "rainwater_harvesting": true,
    "water_efficient_fixtures": true,
    "wastewater_recycling": false,
    "greywater_reuse": false
  },
  "analysis_id": "analysis-uuid",
  "createdAt": "2026-09-09T12:00:00Z"
}
```

### `analyses`
```json
{
  "_id": "uuid-string",
  "design_id": "design-uuid",
  "sustainability_score": 82.4,
  "rating_tier": "Gold / Advanced Sustainable",
  "badge_color": "green",
  "category_scores": {
    "carbon": 85.2,
    "energy": 81.0,
    "water": 88.5,
    "materials": 74.0,
    "waste": 78.0
  },
  "energy_metrics": {
    "annual_energy_kwh": 14200.0,
    "baseline_energy_kwh": 28400.0,
    "energy_use_intensity_eui": 59.2,
    "energy_savings_percentage": 50.0,
    "annual_solar_generation_kwh": 7800.0,
    "breakdown": {
      "cooling_kwh": 3400.0,
      "heating_kwh": 4100.0,
      "lighting_kwh": 2200.0,
      "equipment_kwh": 4500.0,
      "solar_offset_kwh": 7800.0
    }
  },
  "carbon_metrics": {
    "embodied_carbon_tco2e": 28.4,
    "annual_operational_carbon_tco2e": 7.1,
    "lifecycle_50yr_carbon_tco2e": 383.4,
    "carbon_reduction_percentage": 48.5
  },
  "water_metrics": {
    "annual_water_consumption_m3": 118.0,
    "rainwater_harvested_m3": 92.0,
    "freshwater_dependency_percentage": 56.2
  },
  "cost_metrics": {
    "estimated_initial_cost_usd": 385000.0,
    "annual_operating_cost_usd": 2270.0,
    "annual_utility_savings_usd": 2410.0,
    "payback_period_years": 4.8
  },
  "recommendations": [ ... ],
  "assumptions": [ ... ],
  "disclaimer": "The EcoBuild AI sustainability rating is an automated engineering assessment...",
  "createdAt": "2026-09-09T12:00:00Z"
}
```

---

## 4. API Endpoints Reference

| HTTP Method | Endpoint | Description | Protected |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Login and receive JWT access token | No |
| `GET` | `/api/auth/me` | Fetch active user profile | Yes (Bearer) |
| `GET` | `/api/projects` | List all user / demo projects | Optional |
| `POST` | `/api/projects` | Create a new project + initial assessment | Optional |
| `GET` | `/api/projects/{id}` | Retrieve project with design version list | Optional |
| `DELETE` | `/api/projects/{id}` | Cascade delete project, designs, and analyses | Optional |
| `POST` | `/api/designs` | Create a new design version (e.g. Design B) | Optional |
| `GET` | `/api/designs/{id}` | Get design parameters and latest analysis | Optional |
| `POST` | `/api/analyze` | Execute complete AI & physics analysis pipeline | Optional |
| `GET` | `/api/analysis/{design_id}` | Retrieve analysis results for design | Optional |
| `GET` | `/api/recommendations/{design_id}` | Fetch prioritized AI engineering recommendations | Optional |
| `POST` | `/api/compare` | Side-by-side comparison of Design A vs B | Optional |
| `POST` | `/api/optimize` | Multi-objective Pareto optimizer (Cost/Carbon/etc.) | Optional |
| `GET` | `/api/reports/{project_id}` | Compile executive sustainability report data | Optional |
| `GET` | `/api/reports/{project_id}/pdf` | Download compiled PDF executive report | Optional |
| `POST` | `/api/seed` | Reset or refresh pre-seeded demo archetypes | No |
| `GET` | `/api/health` | Service health and ML model status | No |

---

## 5. AI/ML Pipeline & Calculation Methodology

```
User Input Form (Steps 1-6)
       │
       ▼
Feature Extraction (App/ml/feature_extractor.py)
       │  • Converts geometry, materials, glazing U-values & SHGC, degree days into vector
       ▼
1. Energy Model: Scikit-learn RandomForestRegressor Pipeline (models/energy_model.pkl)
       │  • Predicts gross annual energy consumption (kWh)
       │  • Subtracts calculated on-site solar photovoltaic yield (kWp * solar_yield_factor * 0.82)
       ▼
2. Carbon Engine: ICE Database v3.0 & IPCC (App/services/carbon_service.py)
       │  • Embodied Carbon: Structural framing volume * kgCO2e/m³ + exterior envelope area * kgCO2e/m²
       │  • Recycled Content Credit: Up to 35% mitigation deduction on virgin material emissions
       │  • Operational Carbon: Net annual grid kWh * regional grid carbon intensity (kgCO2e/kWh)
       │  • 50-Year Lifecycle Carbon: Embodied + (50 * Annual Operational)
       ▼
3. Water Engine: ASHRAE 189.1 Balance (App/services/water_service.py)
       │  • Domestic Demand: Occupants * per capita daily baseline * fixture reduction factor
       │  • Rainwater Harvesting: Roof area * rainfall (mm) * runoff coeff (0.85) * filter eff (0.90)
       │  • Greywater Reclaim: Recovers 28-35% of domestic discharge for toilet flushing & irrigation
       │  • Freshwater Dependency %: Net municipal draw / baseline domestic demand
       ▼
4. Lifecycle Cost Estimator (App/services/cost_service.py)
       │  • CapEx: Base construction $/m² + material differentials + solar PV capex + water cisterns
       │  • OpEx: (Net electricity kWh * $0.14) + (Net water m³ * $2.40)
       │  • Payback Period: Green premium / annual OpEx utility savings
       ▼
5. Sustainability Scoring Engine (App/services/score_service.py)
       │  • Carbon (30%) + Energy (25%) + Water (20%) + Materials (15%) + Waste (10%)
       │  • Normalized from 0 to 100 points:
       │    - 85 - 100: Platinum / High Performance
       │    - 70 - 84:  Gold / Advanced Sustainable
       │    - 55 - 69:  Silver / Standard Sustainable
       │    - 40 - 54:  Bronze / Compliant Baseline
       │    - < 40:     Sub-optimal / Conventional
       ▼
6. AI Recommendation Engine (App/services/recommendation_service.py)
       │  • Evaluates envelope insulation, glazing SHGC, solar potential, rainwater harvesting
       │  • Formulates High, Medium, and Opportunity diagnostic cards with quantified savings
       ▼
7. Multi-Objective Optimizer (App/services/optimization_service.py)
       │  • Solves parametric variations matching user priority (Lowest Cost, Carbon, Energy, Water, Balanced)
       │  • Generates recommended configuration, delta improvements, and trade-off rationale
       ▼
Frontend Visualization & PDF Export
```

### Scoring Disclaimer
> **Important**: The EcoBuild AI sustainability score is an indicative engineering metric (0–100 scale) calibrated against ASHRAE 90.1, the Inventory of Carbon & Energy (ICE), and life-cycle assessment (LCA) benchmarks. It is designed to empower early-stage design optimization and does not claim to represent an official LEED, GRIHA, BREEAM, DGNB, or statutory local municipal certification.

---

## 6. Pre-Seeded Demonstration Archetypes

The application immediately seeds 3 verified engineering demonstration archetypes:
1. **Cedar Ridge Suburban Home [DEMO]**  
   - Typology: Residential (Single-Family)  
   - Baseline conventional specification: standard brick, concrete framing, single glazed clear windows, split AC and gas furnace, no solar.  
   - Sustainability Score: **~47 / 100** (Bronze / Compliant Baseline).  
   - Includes **Design B (Retrofit Sustainable)** version for instant side-by-side comparison (**Score: ~78 / 100**).
2. **Eco-Haven Mass Timber Residence [DEMO]**  
   - Typology: High-Performance Residential  
   - Specification: Mass Timber CLT structural framing, carbon-negative hempcrete walls, extensive green roof, triple glazed krypton windows, 14 kWp solar PV array, geothermal heat pump, rainwater harvesting, and greywater recycling.  
   - Sustainability Score: **~86 / 100** (Platinum / High Performance).
3. **Apex Tech Park Tower [DEMO]**  
   - Typology: Commercial Office Building  
   - Specification: Low-carbon fly ash concrete, AAC lightweight blocks, 65 kWp solar array, variable refrigerant flow (VRF) HVAC with heat recovery, and dual-plumbing greywater reuse.  
   - Sustainability Score: **~75 / 100** (Gold / Advanced Sustainable).

---

## 7. Setup & Installation Instructions

### Prerequisites
- Python 3.10+
- Node.js v18+ and npm v9+
- (Optional) MongoDB Atlas connection string (or run completely zero-config with the built-in async mock database)

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# (Optional) Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# (Optional) Re-train the AI energy model
python app/ml/train_energy_model.py

# Configure environment variables (optional)
cp .env.example .env

# Run FastAPI backend server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend will start at `http://127.0.0.1:8000`. Interactive OpenAPI documentation is available at `http://127.0.0.1:8000/docs`.

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev -- --host 127.0.0.1 --port 5173
```
The frontend will start at `http://127.0.0.1:5173/`.

### MongoDB Atlas Configuration (Optional)
To connect to live MongoDB Atlas:
1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user and whitelist your IP address.
3. Open `backend/.env` and paste your connection string:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
   MONGODB_DB_NAME=ecobuild_ai
   ```
4. Restart the backend server. The application will log:
   `Successfully connected to MongoDB Atlas database: ecobuild_ai`.
   *If `MONGODB_URI` is left blank, the application automatically uses the transparent in-memory document engine.*

---

## 8. Verification & Test Suite

Run the automated backend test suite:
```bash
python backend/test_backend.py
```

Run the complete 10-step end-to-end user simulation:
```bash
python backend/test_e2e_flow.py
```

Run the frontend production build:
```bash
cd frontend && npm run build
```
