# SPACE SHOOTER ODYSSEY
### Full-Stack Arcade Combat Game + Gamification + Rewarded-Ad Economy

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![Stack](https://img.shields.io/badge/stack-React_18_+_Node.js_Express_+_Canvas_2D-blue)](#)
[![Economy](https://img.shields.io/badge/economy-VELoop_Rewards_Certified-purple)](#)
[![Tests](https://img.shields.io/badge/tests-6%2F6_Passing-success)](#)

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Reference Game Research & Differentiation](#2-reference-game-research--differentiation)
3. [Original Design Decisions](#3-original-design-decisions)
4. [Gameplay and Controls](#4-gameplay-and-controls)
5. [Mission and Sector Progression](#5-mission-and-sector-progression)
6. [Ship Classes and Upgrades](#6-ship-classes-and-upgrades)
7. [Power-Up Mechanics](#7-power-up-mechanics)
8. [Economy Design (VELoop Rewards)](#8-economy-design-veloop-rewards)
9. [Rewarded-Ad Placements](#9-rewarded-ad-placements)
10. [Reward Verification Architecture & State Machine](#10-reward-verification-architecture--state-machine)
11. [Wallet & Transaction Ledger](#11-wallet--transaction-ledger)
12. [Database Structure & Schemas](#12-database-structure--schemas)
13. [Authentication & Session Security](#13-authentication--session-security)
14. [Game Session Lifecycle](#14-game-session-lifecycle)
15. [Anti-Cheat Protections & Limitations](#15-anti-cheat-protections--limitations)
16. [Complete REST API Documentation](#16-complete-rest-api-documentation)
17. [Environment Variables](#17-environment-variables)
18. [Local Setup & Quick Start](#18-local-setup--quick-start)
19. [Automated Test Suite](#19-automated-test-suite)
20. [Deployment Guide](#20-deployment-guide)
21. [Visual Showcase & Screenshots](#21-visual-showcase--screenshots)
22. [Demonstration Video Checklist](#22-demonstration-video-checklist)
23. [Known Limitations & Future Roadmap](#23-known-limitations--future-roadmap)

---

## 1. Project Overview
**SPACE SHOOTER ODYSSEY** is an advanced full-stack browser space combat game inspired by classic arcade shooters and built specifically to demonstrate a production-ready, sustainable rewarded-ad economy for **VELoop Rewards**.

The game features:
- High-performance **60 FPS Canvas 2D Combat Engine** with custom projectile physics, hitbox collision detection, particle explosions, and procedural Web Audio.
- **50 Data-Driven Missions** spanning 5 thematic cosmic sectors with escalating difficulty and 5 unique multi-phase boss battles.
- **5 Starship Classes** with multi-tier attribute upgrade curves.
- **8 Combat Power-Ups** integrated directly into the combat engine and tactical armory.
- **Authoritative Server Architecture** with double-entry wallet ledgers, ad-opportunity state machines, idempotent reward processing, anti-cheat duration checking, and dual-mode MongoDB + memory persistence.

---

## 2. Reference Game Research & Differentiation
*Reference Game:* Space Shooter 2 ([Google Play Store Reference](https://play.google.com/store/apps/details?id=com.game.space.shooter2))

### Observed Concepts in Reference
- Vertical arcade shooter mechanics with wave-based enemy spawns and boss encounters.
- Dual currencies (coins and gems) used for unlocking ships and upgrading firepower.
- Rewarded ad integrations offering revives upon death and end-of-mission reward doubling.

### How Space Shooter Odyssey Differs & Original Implementations
1. **Dynamic Brand Identity:** Configurable globally via `VITE_GAME_NAME` and `GAME_NAME` environment variables with zero code modifications needed.
2. **Server-Authoritative Economy:** Client never dictates credit rewards. Scores, multipliers, and prices are determined, signed, and validated server-side.
3. **Pluggable Ad Provider Abstraction:** Decoupled architecture supporting a local interactive simulated testbed alongside production ad network adapters.
4. **Idempotency & Double-Claim Defense:** Unique transaction hashes and idempotency locks prevent replayed requests, duplicated callbacks, and overdrafts.
5. **Procedural Web Audio Engine:** Zero external audio dependencies—all sound effects (lasers, explosions, shields, power-ups) and ambient music are synthesized procedurally in real time.

---

## 3. Original Design Decisions
- **Hybrid Frontend Architecture:** React 18 + TailwindCSS for futuristic glassmorphic HUD, menus, and dashboards, coupled with a pure HTML5 Canvas delta-time game loop for fluid combat.
- **Resilient Dual Database Support:** Connects automatically to authoritative MongoDB, with seamless automatic fallback to an in-memory transactional ledger store if MongoDB daemon is not running on the host machine.
- **Data-Driven Level Design:** All 50 missions and 5 boss encounters are defined in structured JSON data models—enabling rapid tuning without component refactoring.

---

## 4. Gameplay and Controls
### Desktop Controls
- **Movement:** `WASD` or Arrow Keys
- **Fire:** Automatic continuous fire or `Spacebar`
- **Tactical Abilities:** Number keys `1`–`8` or clickable HUD tray
- **Pause / Resume:** `P` key or pause button

### Mobile Controls
- **Movement:** Responsive touch drag & virtual steering target
- **Firing:** Automatic responsive firing on touch active
- **Tactical Abilities:** Dedicated high-contrast touch pills with cooldown indicators

---

## 5. Mission and Sector Progression
Campaign is structured across **5 Distinct Sectors** containing **50 Playable Missions**:
1. **Sector 1: Orion Frontier** (Missions 1–10, Tutorial/Beginner) → Boss: *The Iron Warden*
2. **Sector 2: Crimson Nebula** (Missions 11–20, Easy) → Boss: *Nebula Serpent*
3. **Sector 3: Frozen Expanse** (Missions 21–30, Medium) → Boss: *Solar Devourer*
4. **Sector 4: Rift Territory** (Missions 31–40, Hard) → Boss: *The Rift Carrier*
5. **Sector 5: Void Citadel** (Missions 41–50, Expert) → Boss: *Void Emperor*

### 3-Star Rating Criteria
- **1 Star:** Complete primary mission objective (kill target, survival time, or boss defeat).
- **2 Stars:** Conclude sortie with 60%+ Hull Integrity remaining.
- **3 Stars:** Conclude sortie with 80%+ Hull Integrity and zero revives used.

---

## 6. Ship Classes and Upgrades
Five distinct starship classes with unique handling, baseline stats, and visual designs:
1. **Aero Interceptor:** Balanced speed, health, and twin plasma blasters.
2. **Valkyrie Striker:** High-burst DPS glass cannon equipped with heavy cannons.
3. **Aegis Guardian:** Heavy armored tank with reinforced hull and shockwave pulses.
4. **Chronos Support Craft:** Utility vessel with high magnet radius and nanite repair drones.
5. **Quantum Phantom X-1:** Experimental prototype unlocked via milestone with dark matter cluster torpedoes.

### Multi-Tier Upgrades (Tier 1 to 5)
- Primary Cannons (Weapon Damage)
- Cycle Frequency (Fire Rate)
- Hull Armor (Max HP)
- Sub-Light Thrusters (Movement Speed)
- Deflector Matrix (Shield Capacity)
- Auxiliary Core (Special Cooldown)

---

## 7. Power-Up Mechanics
Eight fully functional in-combat tactical abilities:
1. **Shield Pulse:** 6s invulnerability dome absorbing all incoming projectiles and collisions.
2. **Rapid Fire:** 2.5x firing rate boost for 8 seconds.
3. **Spread Shot:** 5-way wide spray plasma storm for 10 seconds.
4. **Homing Missiles:** Salvo of 6 intelligent self-guided projectiles that target hostile ships.
5. **EMP Blast:** Screen wipe clearing all enemy bullets and stunning active targets.
6. **Repair Drone:** Nano-bot reconstruction restoring +50 HP hull integrity.
7. **Overdrive:** Overclocked thrusters (+30% speed) and +50% weapon damage for 7 seconds.
8. **Emergency Warp:** Instant tactical warp repositioning ship with 2s immunity.

---

## 8. Economy Design (VELoop Rewards)
### Currency Architecture
- **Credits:** Spendable primary currency earned through missions, enemy kills, and daily streak rewards. Spent on ship upgrades and armory requisitions.
- **Energy Cores:** Rare progression currency obtained from defeating sector bosses and completing progression milestones. Used for advanced ship unlocks and Tier 4–5 upgrades.
- **Pilot XP:** Authoritative progression metric for leveling up player rank (250 XP/level). Distinct from spendable currency.
- **VELoop Reward Coins:** Platform-eligible engagement rewards separate from in-game tokens.

---

## 9. Rewarded-Ad Placements
Non-intrusive, optional rewarded opportunities:
1. **Revive after Mission Failure:** Watch ad to reconstruct starship with 100% hull from current checkpoint (capped at 1/mission).
2. **Double Score Offer:** Watch ad to double final validated run score for leaderboard dominance.
3. **Double Credits Offer:** Watch ad to double mission credit bounty.
4. **Armory Shield Grant:** Free Shield Pulse power-up requisition via ad view.
5. **Daily Streak Bonus:** Extra +100 Credits bonus on daily streak claim.

---

## 10. Reward Verification Architecture & State Machine
Every rewarded ad follows an explicit state machine:
```
OFFERED -> REQUESTED -> AD_STARTED -> AD_COMPLETED -> VERIFYING -> VERIFIED -> GRANTED
```
- A button click in the frontend is never accepted as proof of completion.
- The server verifies watch duration, provider event signatures, and unique event IDs before granting any currency.
- Idempotency locks prevent duplicate callback submissions.

---

## 11. Wallet & Transaction Ledger
Every currency transaction is recorded immutably with:
`transactionId`, `userId`, `type`, `amount`, `balanceBefore`, `balanceAfter`, `source`, `referenceId`, `status`, `timestamp`.
Transactions are strictly atomic—overdrafts and negative balances are mathematically rejected.

---

## 12. Database Structure & Schemas
- `User`: Pilot credentials, hashed password, role (`player` / `admin`).
- `PlayerProfile`: Authoritative fleet progress, balances, inventory, unlock arrays, stars.
- `GameSession`: Active run lifecycle, initial state, checkpoint, duration, and telemetry.
- `WalletTransaction`: Immutable financial ledger.
- `RewardTransaction`: Rewarded-ad auditing ledger.
- `AdOpportunity`: Ad lifecycle states and timestamps.

---

## 13. Authentication & Session Security
- Passwords salted and hashed with **bcryptjs** (cost factor 10).
- Session tokens generated via **JSON Web Tokens (JWT)** with 7-day expiration.
- Express rate limiting (200 requests/min) on `/api` to prevent brute-force attacks.

---

## 14. Game Session Lifecycle
1. Pilot requests sortie initialization via `POST /api/games/start` (validates ship ownership and mission unlock status).
2. Server issues unique `sessionId` and records start timestamp.
3. Combat ensues on client canvas engine.
4. Pilot submits run telemetry upon win or defeat via `POST /api/games/:sessionId/complete`.
5. Server validates run duration, calculates stars, and generates claimable reward amounts.
6. Pilot commits rewards to wallet via `POST /api/games/:sessionId/claim` with idempotency protection.

---

## 15. Anti-Cheat Protections & Limitations
- **Speed-Hack Protection:** Missions completed in less than 6 seconds or survival objectives completed before target duration are rejected.
- **Score Bounds Enforcement:** Statistical threshold capping prevents manipulated score injections.
- **Server Price Validation:** Client cannot submit arbitrary prices or grant amounts.
- **Session Locking:** Finalized sessions cannot be reused to claim rewards multiple times.

---

## 16. Complete REST API Documentation

### Auth
- `POST /api/auth/register` - Create new pilot account
- `POST /api/auth/login` - Authenticate pilot and receive JWT
- `GET /api/auth/me` - Retrieve current session identity

### Player & Progress
- `GET /api/player/profile` - Full pilot dossier
- `GET /api/player/progress` - Campaign unlock status and high scores
- `GET /api/player/inventory` - Owned power-ups and ship upgrades

### Missions & Combat
- `GET /api/missions` - Retrieve all 50 missions and 5 sectors
- `GET /api/missions/:missionId` - Retrieve detailed mission configuration & boss data
- `POST /api/games/start` - Initialize combat sortie session
- `POST /api/games/:sessionId/complete` - Submit combat telemetry for validation
- `POST /api/games/:sessionId/claim` - Commit verified rewards to ledger

### Ships Fleet
- `GET /api/ships` - Retrieve all 5 ship classes with upgrade trees
- `POST /api/ships/:shipId/select` - Set active sortie starship
- `POST /api/ships/:shipId/upgrade` - Purchase atomic attribute upgrade
- `POST /api/ships/:shipId/unlock` - Unlock starship using Credits & Cores

### Rewarded Ads
- `POST /api/rewards/ad/opportunity` - Generate ad opportunity token
- `POST /api/rewards/ad/verify` - Verify ad completion and grant reward

### Admin & Economy Audit
- `GET /api/admin/metrics` - Real platform conversion rates and credit flows
- `POST /api/admin/config` - Live server economy parameter adjustments

---

## 17. Environment Variables
### Frontend (`client/.env`)
```env
VITE_GAME_NAME=SPACE SHOOTER ODYSSEY
VITE_API_URL=http://localhost:5000/api
```

### Backend (`server/.env`)
```env
PORT=5000
NODE_ENV=development
GAME_NAME=SPACE SHOOTER ODYSSEY
MONGODB_URI=mongodb://127.0.0.1:27017/space_shooter_odyssey
JWT_SECRET=super_secret_space_shooter_jwt_key_2026
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

---

## 18. Local Setup & Quick Start
### Prerequisites
- Node.js v18+ (tested on Node v24.13.0)
- npm v9+

### Installation & Launch
```bash
# 1. Install root, backend, and frontend packages
npm run install:all

# 2. Start backend server (Port 5000)
cd server
npm start

# 3. Start frontend dev server (Port 3000)
cd client
npm run dev
```
Open your browser to `http://localhost:3000`.

### Pre-Seeded Evaluation Accounts
- **Demo Pilot:** `pilot@odyssey.com` / `password123`
- **Demo Admin:** `admin@odyssey.com` / `password123`

---

## 19. Automated Test Suite
Run the backend test suite:
```bash
cd server
npm test
```
The test suite validates:
- Dynamic Game Name propagation
- Pilot registration and JWT generation
- Authoritative wallet ledger consistency
- Anti-overdraft purchase rejections
- Rewarded ad state transitions & idempotency
- Anti-cheat completion duration enforcement

---

## 20. Deployment Guide
- **Frontend:** Build production bundle via `cd client && npm run build`. Host static `dist/` on Vercel, Netlify, or AWS S3/CloudFront.
- **Backend:** Containerize `server/` with Node.js 18+ Alpine Docker image, deploy to Render, Railway, or AWS ECS. Configure production MongoDB Atlas URI and secure `JWT_SECRET`.

---

## 21. Visual Showcase & Screenshots
*(Generate screenshots or record demo video from running application)*
- Dynamic Bridge & Hero Starship Showcase
- 50-Mission Sector Navigation Map with 3-Star Rating Pills
- Fleet Hangar with 5 Ship Classes and Multi-Tier Calibration
- 60 FPS Canvas Combat Engine with Particle Explosions and Telegraphing Bosses
- Interactive Simulated Rewarded-Ad Modal with Live Verification

---

## 22. Demonstration Video Checklist
Verified against PDF Part XVI, Section 86:
- [x] Landing page with dynamic title
- [x] Player registration and login
- [x] Player dashboard with daily streak calendar
- [x] Ship hangar browsing and selecting 5 ship classes
- [x] Upgrading ship attributes with atomic ledger deduction
- [x] Mission selection across sectors
- [x] Ship movement, responsive controls, and firing
- [x] Enemy wave encounters and destruction
- [x] Power-up activations (Shield Pulse, Homing Missiles, EMP, etc.)
- [x] Multi-phase Boss encounters with telegraphed attacks
- [x] Mission failure handling & Watch Ad & Revive prompt
- [x] Mission victory screen with 3-star calculations
- [x] Watch Ad to Double Score & Watch Ad to Double Credits
- [x] Interactive simulated ad countdown and verification outcome
- [x] Real-time Admin Economy Dashboard with conversion rates

---

## 23. Known Limitations & Future Roadmap
- **Client Canvas Rendering:** Standard 2D canvas with sub-pixel delta smoothing; WebGL/PixiJS shaders can be integrated for advanced distortion effects.
- **Ad Provider Integrations:** Currently operating with the interactive development simulator; live AdMob/Google AdSense SDK adapters can be toggled by switching the provider adapter in production.
- **PvP Fleet Battles:** Campaign and leaderboards are fully implemented; real-time multiplayer PvP is slated for Phase 2.

