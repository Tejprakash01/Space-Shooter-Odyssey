# SPACE SHOOTER ODYSSEY
### Full-Stack 2D Arcade Space Combat Game + Authoritative Rewarded Economy Engine

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![Stack](https://img.shields.io/badge/stack-React_18_+_Node.js_Express_+_Canvas_2D-blue)](#)
[![Economy](https://img.shields.io/badge/economy-Authoritative_Double--Entry_Ledger-purple)](#)
[![Tests](https://img.shields.io/badge/tests-6%2F6_Passing-success)](#)

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Genre Research & Original Architecture](#2-genre-research--original-architecture)
3. [Original Design Decisions](#3-original-design-decisions)
4. [Gameplay and Controls](#4-gameplay-and-controls)
5. [Mission and Sector Progression](#5-mission-and-sector-progression)
6. [Ship Classes and Upgrades](#6-ship-classes-and-upgrades)
7. [Power-Up Mechanics](#7-power-up-mechanics)
8. [Economy Design & Multi-Currency Engine](#8-economy-design--multi-currency-engine)
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
21. [Visual Showcase](#21-visual-showcase)
22. [Feature Verification Checklist](#22-feature-verification-checklist)
23. [Architecture Roadmap](#23-architecture-roadmap)

---

## 1. Project Overview
**SPACE SHOOTER ODYSSEY** is an advanced full-stack browser space combat game inspired by classic vertical shoot-'em-ups and engineered with a production-grade, sustainable rewarded-ad token economy.

Key Highlights:
- High-performance **60 FPS Canvas 2D Combat Engine** with custom projectile physics, hitbox collision detection, particle explosions, and procedural Web Audio synthesis.
- **50 Data-Driven Missions** spanning 5 cosmic sectors with escalating difficulty curves and 5 unique multi-phase boss encounters.
- **5 Starship Classes** with multi-tier attribute upgrade curves (Damage, Fire Rate, Hull Armor, Thrusters, Shields, Cooldowns).
- **8 Combat Power-Ups** integrated directly into the combat loop and tactical armory.
- **Authoritative Server Architecture** featuring atomic double-entry wallet ledgers, ad-opportunity state machines, idempotent reward processing, anti-cheat duration checking, and dual-mode MongoDB + memory persistence.

---

## 2. Genre Research & Original Architecture
*Reference Genre:* Classic arcade space combat games (e.g. Space Shooter series).

### Core Concepts Studied
- Vertical arcade shooter mechanics with wave-based enemy spawns and boss encounters.
- Multi-tier currencies used for unlocking ships and upgrading firepower.
- Rewarded ad integrations offering revives upon death and end-of-mission reward multipliers.

### Original Implementations in Space Shooter Odyssey
1. **Dynamic Brand Identity:** Configurable globally via `VITE_GAME_NAME` and `GAME_NAME` environment variables with zero code modifications needed.
2. **Server-Authoritative Economy:** The client never dictates currency rewards. Scores, multipliers, and prices are determined, signed, and validated server-side.
3. **Pluggable Ad Provider Abstraction:** Decoupled architecture supporting an interactive transmission testbed alongside production ad network adapters.
4. **Idempotency & Replay Defense:** Unique transaction hashes and idempotency locks prevent replayed requests, duplicated callbacks, and overdrafts.
5. **Procedural Web Audio Engine:** Zero external audio dependencies—all sound effects (lasers, explosions, shields, power-ups) and ambient music are synthesized procedurally in real time using the Web Audio API.

---

## 3. Original Design Decisions
- **Hybrid Frontend Architecture:** React 18 + TailwindCSS for futuristic glassmorphic HUD, menus, and dashboards, coupled with a pure HTML5 Canvas delta-time game loop for fluid 60 FPS combat.
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
The campaign is structured across **5 Distinct Sectors** containing **50 Playable Missions**:
1. **Sector 1: Orion Frontier** (Missions 1–10, Tutorial/Beginner) &rarr; Boss: *The Iron Warden*
2. **Sector 2: Crimson Nebula** (Missions 11–20, Easy) &rarr; Boss: *Nebula Serpent*
3. **Sector 3: Frozen Expanse** (Missions 21–30, Medium) &rarr; Boss: *Solar Devourer*
4. **Sector 4: Rift Territory** (Missions 31–40, Hard) &rarr; Boss: *The Rift Carrier*
5. **Sector 5: Void Citadel** (Missions 41–50, Expert) &rarr; Boss: *Void Emperor*

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

## 8. Economy Design & Multi-Currency Engine
### Currency Architecture
- **Credits:** Spendable primary currency earned through missions, enemy kills, and daily streak rewards. Spent on ship upgrades and armory requisitions.
- **Energy Cores:** Rare progression currency obtained from defeating sector bosses and completing progression milestones. Used for advanced ship unlocks and Tier 4–5 upgrades.
- **Pilot XP:** Authoritative progression metric for leveling up player rank (250 XP/level). Distinct from spendable currency.
- **Platform Reward Coins:** Separate platform-eligible engagement rewards distinct from in-game utility tokens.

---

## 9. Rewarded-Ad Placements
Non-intrusive, optional rewarded opportunities:
1. **Revive after Mission Failure:** Watch sponsored transmission to reconstruct starship with 100% hull from current checkpoint (capped at 1/mission).
2. **Double Score Offer:** Watch broadcast to double final validated run score for leaderboard dominance.
3. **Double Credits Offer:** Watch broadcast to double mission credit bounty.
4. **Armory Shield Grant:** Free Shield Pulse power-up requisition via sponsored view.
5. **Daily Streak Bonus:** Extra +100 Credits bonus on daily streak claim.

---

## 10. Reward Verification Architecture & State Machine
Every rewarded opportunity follows an explicit state machine:
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
Transactions are strictly atomic—overdrafts and negative balances are rejected.

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
- Node.js v18+ (tested on Node v24)
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

---

## 19. Automated Test Suite
Run the backend test suite:
```bash
cd server
npm test
```
The test suite validates:
- Dynamic Game Name health endpoint
- Pilot registration, password hashing, and JWT issuance
- Authoritative wallet balance checks
- Anti-overdraft & negative balance purchase rejections
- Rewarded-ad state transitions & idempotency
- Anti-cheat completion duration enforcement

---

## 20. Deployment Guide
- **Frontend:** Build production bundle via `cd client && npm run build`. Host static `dist/` on Vercel, Netlify, or AWS S3/CloudFront.
- **Backend:** Containerize `server/` with Node.js Alpine Docker image, deploy to Render, Railway, or AWS ECS. Configure production MongoDB Atlas URI and secure `JWT_SECRET`.

---

## 21. Visual Showcase
- **Command Bridge:** Dynamic title, vessel status, quick metrics, and mission launching.
- **50-Mission Sector Map:** Multi-sector navigation with 3-star rating indicators.
- **Fleet Hangar:** 5 Ship classes with multi-tier attribute calibration and atomic purchases.
- **Combat Arena:** 60 FPS Canvas engine with projectile physics, particle bursts, and telegraphed boss attacks.
- **Sponsored Transmission Player:** 5-second countdown with verified token granting.

---

## 22. Feature Verification Checklist
- [x] Original sci-fi game identity & dynamic environment variable title
- [x] Responsive player controls (Desktop keyboard + Mobile touch drag)
- [x] Wave-based encounter system & 5 enemy categories
- [x] 5 Original multi-phase boss encounters with telegraphed attacks
- [x] 5 Sectors with 50 data-driven playable missions
- [x] 3-Star mission performance rating system
- [x] Dedicated Ship Hangar with 5 ship classes and multi-level upgrades
- [x] 8 In-combat tactical power-up modules
- [x] Double-entry authoritative wallet ledger & transaction history
- [x] Rewarded-ad state machine (`OFFERED` &rarr; `GRANTED`)
- [x] Revive system with checkpoint recovery
- [x] End-of-mission Double Score and Double Credits bonuses
- [x] Anti-cheat completion duration & score boundaries
- [x] Procedural Web Audio SFX and ambient space synthesizer
- [x] 7-Day Login Streak calendar & 3 daily missions
- [x] 10 Achievements and Global Leaderboard
- [x] Real-time Admin Economy Telemetry Dashboard

---

## 23. Architecture Roadmap
- **Shaders:** WebGL post-processing shaders for screen distortion during warp and EMP detonations.
- **Ad Adapters:** Expandable adapter pattern ready for Google AdMob, Unity Ads, and AppLovin SDK integration.
- **Fleet Multiplayer:** Asynchronous ghost runs and real-time co-op raid encounters.
