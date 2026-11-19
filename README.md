# SPACE SHOOTER ODYSSEY
### 2D Arcade Space Combat Game + Authoritative Economy Backend

[![Development Status](https://img.shields.io/badge/status-active_development-yellow)](#)
[![Stack](https://img.shields.io/badge/stack-React_18_+_Node.js_Express_+_Canvas_2D-blue)](#)
[![License](https://img.shields.io/badge/license-MIT-green)](#)

A browser-based space combat arcade game built with a 60 FPS HTML5 Canvas engine, React UI, and an authoritative Node.js backend managing player progression, wallet ledgers, and a rewarded token economy.

---

## 📌 Development Status

> **Current Phase:** Active Development / Sprint Phase 2  
> The project architecture and core gameplay loops are established. Next phases focus on cloud deployment, end-to-end testing, and third-party provider integrations.

---

## 🛠️ What's Built So Far

### 1. Gameplay & Combat Engine
- **Canvas 2D 60 FPS Loop:** Delta-time loop with starfield parallax, custom hitboxes, and particle thruster effects.
- **Player Controls:** Desktop (`WASD` / Arrow keys + `Spacebar`/Auto-fire) and Mobile (touch drag & virtual target steering).
- **Combat Pickups & Power-Ups:** 8 tactical power-ups (Shield Pulse, Rapid Fire, Spread Shot, Homing Missiles, EMP Blast, Repair Drone, Overdrive, Emergency Warp) with cooldown and duration timers.
- **Enemy & Boss Archetypes:** 5 enemy roles (Scout, Interceptor, Armored Cruiser, Gunship, Elite) and multi-phase boss encounter mechanics.
- **Campaign Framework:** Structured, data-driven mission definitions across 5 cosmic sectors with 1–3 star rating conditions.

### 2. Fleet & Player Progression
- **5 Ship Classes:** Aero Interceptor, Valkyrie Striker, Aegis Guardian, Chronos Support Craft, and Quantum Phantom X-1.
- **Hangar Upgrades:** Multi-tier attribute calibrations (Damage, Fire Rate, Hull Armor, Speed, Shields, Cooldowns) with server-controlled pricing.
- **Player Retention:** 7-Day Login Streak calendar, 3 daily tactical directives, and 10 tracked achievements.

### 3. Backend & Economy Architecture
- **RESTful API:** Modular Node.js / Express server for auth, sessions, fleet upgrades, and economy auditing.
- **Dual Persistence:** Connects to MongoDB with an automatic transactional in-memory store fallback.
- **Double-Entry Wallet Ledger:** Server-authoritative credit balances with immutable transaction history (`balanceBefore` / `balanceAfter`) and overdraft prevention.
- **Rewarded Ad State Machine:** Explicit lifecycle (`OFFERED` &rarr; `REQUESTED` &rarr; `AD_STARTED` &rarr; `AD_COMPLETED` &rarr; `VERIFYING` &rarr; `VERIFIED` &rarr; `GRANTED`) preventing duplicate or replayed claims.
- **Anti-Cheat Validation:** Server checks run durations, score boundaries, and prevents session reuse.

### 4. Audio Engine
- **Procedural Web Audio:** Zero external audio dependencies—all sound effects (lasers, explosions, shields, chimes) and ambient background music are synthesized in real time.

### 5. Deployment & Ads Management Architecture
- **Render Blueprint (`render.yaml`):** Production Infrastructure-as-Code blueprint orchestrating the Node.js API Web Service and the React/Vite Static Site with zero-configuration build hooks and automatic routing.
- **Pluggable Ad Network Adapters:** Standardized `adProviderAdapter.js` supporting `simulated_provider`, Google AdMob S2S, Unity Ads, and custom webhook verification.
- **Comprehensive Ads Environment Control:** Dynamic runtime configuration for killswitches, placement toggles (revive, double score, double credits, extra shield), daily/hourly caps, and cooldown intervals.

---

## 📋 What to Do Next

### 1. Cloud Deployment
- [x] **Render Blueprint (`render.yaml`):** Infrastructure-as-Code blueprint created for one-click deployment.
- [ ] **Database Connection:** Provision a free MongoDB Atlas M0 cluster and populate `MONGODB_URI` in the Render dashboard (in-memory persistence operates seamlessly if omitted).
- [ ] **Custom Domain & SSL:** Link custom production domain names in Render settings.

### 2. Testing & Quality Assurance
- [ ] **Mobile & Cross-Browser Verification:** Test touch drag controls and layout responsiveness across Safari, Chrome, iOS, and Android devices.
- [ ] **Concurrency & Race Conditions:** Stress-test concurrent balance deduction requests to verify atomic ledger locking.
- [ ] **Anti-Cheat Boundary Tests:** Expand automated test coverage for speed-hack and score injection scenarios.

### 3. Production Integrations & Polish
- [ ] **Live Ad Network Credentials:** Configure production AdMob or Unity Ads keys in Render environment variables.
- [ ] **PWA Support:** Add a web app manifest and service worker for mobile home-screen installability and static asset caching.
- [ ] **Visual & Animation Polish:** Add hit-spark visual feedback, screen shake options, and custom particle styles for elite ships.

---

## 🌐 Deployment via Render Blueprint

The repository includes a ready-to-use Render Blueprint (`render.yaml`) defining both services:

| Service | Type | Directory | Build Command | Start / Publish |
| :--- | :--- | :--- | :--- | :--- |
| **`space-shooter-api`** | Web Service (Node.js) | `server` | `npm install` | `npm start` |
| **`space-shooter-client`** | Static Site (React/Vite) | `client` | `npm install && npm run build` | `dist` |

### One-Click Deploy Steps
1. Push your repository to GitHub.
2. Log in to [Render](https://render.com) and click **New +** &rarr; **Blueprint**.
3. Select your repository. Render will automatically parse `render.yaml` and provision both services.
4. (Optional) In the Render dashboard for `space-shooter-api`, set your `MONGODB_URI` connection string if connecting to MongoDB Atlas.

### Ads Management Environment Variables

Configure these variables in your Render Dashboard or `.env` to manage ad behavior:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `AD_PROVIDER` | `simulated_provider` | Active ad network adapter: `simulated_provider`, `admob`, `unity`, or `custom` |
| `ADS_ENABLED` | `true` | Master toggle to enable or disable all rewarded ads |
| `AD_REVIVE_ENABLED` | `true` | Enable rewarded ad offering upon ship destruction |
| `AD_DOUBLE_SCORE_ENABLED` | `true` | Enable 2x score multiplier ad on mission victory |
| `AD_DOUBLE_CREDITS_ENABLED` | `true` | Enable 2x credits multiplier ad on mission victory |
| `AD_EXTRA_SHIELD_ENABLED` | `true` | Enable pre-mission +50 shield booster ad |
| `MAX_REWARDED_ADS_PER_DAY` | `10` | Daily cap on rewarded ads per pilot |
| `MAX_REWARDED_ADS_PER_SESSION` | `5` | Maximum rewarded ads allowed in a single game session |
| `MAX_REWARDED_PER_HOUR` | `8` | Hourly rate limit |
| `MIN_SECONDS_BETWEEN_REWARDED_ADS` | `30` | Minimum cooldown between consecutive ads |
| `MAX_REVIVES_PER_MISSION` | `1` | Maximum revives permitted per mission |
| `ADMOB_APP_ID` / `ADMOB_SECRET_KEY` | _Optional_ | Google AdMob Server-to-Server verification keys |
| `UNITY_GAME_ID` / `UNITY_API_KEY` | _Optional_ | Unity Ads server authentication keys |
| `CUSTOM_AD_WEBHOOK_URL` | _Optional_ | Webhook URL for external custom ad verification services |

---

## 📁 Repository Structure

```
space-shooter-odyssey/
├── client/                 # Frontend React 18 + Vite Application
│   ├── src/
│   │   ├── audio/          # Procedural Web Audio synthesizer
│   │   ├── components/     # UI Modals, Navbar, and HUD widgets
│   │   ├── config/         # Centralized gameConfig.js
│   │   ├── game/           # Canvas 2D GameEngine.js
│   │   ├── pages/          # Home, Campaign, Hangar, Armory, Dashboard, Admin
│   │   └── services/       # Client REST API client
├── server/                 # Backend Node.js + Express API
│   ├── src/
│   │   ├── config/         # Database and economy configurations
│   │   ├── controllers/    # API endpoint controllers
│   │   ├── data/           # Missions, ships, power-ups, and bosses data
│   │   ├── middleware/     # JWT Auth and Admin middleware
│   │   ├── models/         # Authoritative store and transaction ledgers
│   │   ├── routes/         # REST API routes
│   │   └── services/       # Game sessions, wallet, and rewarded ad services
│   └── tests/              # Jest automated integration tests
├── .env.example            # Environment template
├── .gitignore              # Ignored files (node_modules, .env, dist, PDFs)
└── package.json            # Root monorepo scripts
```

---

## 🚀 Local Setup & Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- npm (v9+)

### Installation
```bash
# 1. Clone repository
git clone https://github.com/<YOUR_USERNAME>/<YOUR_REPO>.git
cd <YOUR_REPO>

# 2. Install all dependencies across client and server
npm run install:all
```

### Running Locally
```bash
# Terminal 1: Start Backend (Port 5000)
cd server
npm start

# Terminal 2: Start Frontend (Port 3000)
cd client
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 🧪 Automated Tests

Run backend tests:
```bash
cd server
npm test
```

Tests cover:
- Dynamic Game Name health check
- User registration, password hashing, and JWT issuance
- Authoritative wallet balance and anti-overdraft checks
- Rewarded ad state transitions and idempotency protection
- Anti-cheat mission duration validation

---

## 📄 License
MIT License. Open source for development and learning.
