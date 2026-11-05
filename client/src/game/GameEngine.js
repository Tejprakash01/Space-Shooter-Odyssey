// Canvas 2D Arcade Space Combat Engine (PDF Part II & V, Sections 5-13, 26-29)
import { sound } from '../audio/audioManager.js';

export class GameEngine {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    this.shipData = options.shipData;
    this.missionData = options.missionData;
    this.bossData = options.bossData || null;
    this.callbacks = options.callbacks || {};

    // Game loop state
    this.isRunning = false;
    this.isPaused = false;
    this.lastTime = 0;
    this.animationFrameId = null;

    // Combat telemetry
    this.startTime = Date.now();
    this.duration = 0;
    this.score = 0;
    this.enemiesDefeated = 0;
    this.bossesDefeated = 0;
    this.damageTaken = 0;
    this.shotsFired = 0;
    this.shotsHit = 0;
    this.powerUpsUsed = [];

    // Entities
    this.player = null;
    this.playerProjectiles = [];
    this.enemyProjectiles = [];
    this.enemies = [];
    this.boss = null;
    this.pickups = [];
    this.particles = [];
    this.stars = [];

    // Waves
    this.currentWaveIdx = 0;
    this.waveSpawnTimer = 0;
    this.waveEnemiesRemaining = [];
    this.isWaveSpawning = false;
    this.bossActive = false;

    // Controls
    this.keys = {};
    this.touchControl = { active: false, targetX: 0, targetY: 0 };
    this.autoFire = true;

    // Power-up Active Timers
    this.activePowerUps = {
      shield: 0,
      rapidFire: 0,
      spreadShot: 0,
      overdrive: 0,
      warpInvuln: 0
    };

    this.initStars();
    this.initPlayer();
    this.setupListeners();
  }

  initStars() {
    this.stars = [];
    const count = 120;
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.7 + 0.3
      });
    }
  }

  initPlayer() {
    const stats = this.shipData?.stats || {
      speed: 350,
      maxHealth: 100,
      shieldCapacity: 50,
      weaponDamage: 25,
      fireRate: 0.18
    };

    const upgrades = this.shipData?.currentUpgrades || {};
    const dmgBonus = (upgrades.weaponDamage || 1) * 5;
    const hpBonus = (upgrades.maxHealth || 1) * 20;
    const speedBonus = (upgrades.movementSpeed || 1) * 15;
    const shieldBonus = (upgrades.shieldCapacity || 1) * 10;
    const fireRateReduction = (upgrades.fireRate || 1) * 0.015;

    this.player = {
      x: this.width / 2,
      y: this.height - 100,
      width: 44,
      height: 48,
      speed: stats.speed + speedBonus,
      maxHealth: stats.maxHealth + hpBonus,
      health: stats.maxHealth + hpBonus,
      maxShield: stats.shieldCapacity + shieldBonus,
      shield: stats.shieldCapacity + shieldBonus,
      weaponDamage: stats.weaponDamage + dmgBonus,
      baseFireRate: Math.max(0.08, stats.fireRate - fireRateReduction),
      fireCooldown: 0,
      invulnerableTimer: 1.5, // Spawn invulnerability
      color: this.shipData?.visuals?.primaryColor || '#00f0ff',
      engineColor: this.shipData?.visuals?.engineGlow || '#0284c7'
    };
  }

  setupListeners() {
    this.handleKeyDown = (e) => {
      this.keys[e.key] = true;
      if (e.key === 'p' || e.key === 'P') {
        this.togglePause();
      }
    };
    this.handleKeyUp = (e) => {
      this.keys[e.key] = false;
    };

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    // Touch controls for mobile
    this.handleTouchStart = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      this.touchControl.active = true;
      this.touchControl.targetX = (touch.clientX - rect.left) * (this.width / rect.width);
      this.touchControl.targetY = (touch.clientY - rect.top) * (this.height / rect.height);
    };

    this.handleTouchMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      this.touchControl.targetX = (touch.clientX - rect.left) * (this.width / rect.width);
      this.touchControl.targetY = (touch.clientY - rect.top) * (this.height / rect.height);
    };

    this.handleTouchEnd = () => {
      this.touchControl.active = false;
    };

    this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: true });
    this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: true });
    this.canvas.addEventListener('touchend', this.handleTouchEnd, { passive: true });
  }

  start() {
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.loadWave(0);
    this.loop(this.lastTime);
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  destroy() {
    this.stop();
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    if (this.callbacks.onPauseState) {
      this.callbacks.onPauseState(this.isPaused);
    }
  }

  loadWave(idx) {
    if (!this.missionData?.waves || idx >= this.missionData.waves.length) {
      if (this.bossData && !this.bossActive && !this.bossDefeatedFlag) {
        this.spawnBoss();
      } else if (this.enemies.length === 0 && !this.boss) {
        this.triggerVictory();
      }
      return;
    }

    this.currentWaveIdx = idx;
    const wave = this.missionData.waves[idx];
    this.waveEnemiesRemaining = [];

    wave.enemies.forEach(group => {
      for (let i = 0; i < group.count; i++) {
        this.waveEnemiesRemaining.push({
          type: group.type,
          delay: i * (group.spawnInterval || 1.2)
        });
      }
    });

    this.waveSpawnTimer = 0;
    this.isWaveSpawning = true;

    if (this.callbacks.onWaveUpdate) {
      this.callbacks.onWaveUpdate({
        currentWave: idx + 1,
        totalWaves: this.missionData.waves.length
      });
    }
  }

  spawnEnemy(type) {
    const types = {
      scout: {
        width: 32, height: 32, hp: 45, speed: 140, color: '#38bdf8',
        fireRate: 2.2, score: 50, shootPattern: 'straight'
      },
      interceptor: {
        width: 34, height: 36, hp: 75, speed: 200, color: '#f43f5e',
        fireRate: 1.6, score: 90, shootPattern: 'aimed'
      },
      armored_cruiser: {
        width: 52, height: 50, hp: 220, speed: 90, color: '#eab308',
        fireRate: 2.5, score: 180, shootPattern: 'heavy_dual'
      },
      gunship: {
        width: 44, height: 48, hp: 140, speed: 110, color: '#a855f7',
        fireRate: 2.0, score: 150, shootPattern: 'burst'
      },
      elite: {
        width: 58, height: 56, hp: 350, speed: 130, color: '#ec4899',
        fireRate: 1.4, score: 320, shootPattern: 'spiral_elite'
      }
    };

    const cfg = types[type] || types.scout;
    const enemy = {
      type,
      x: Math.random() * (this.width - 80) + 40,
      y: -60,
      width: cfg.width,
      height: cfg.height,
      maxHp: cfg.hp,
      hp: cfg.hp,
      speed: cfg.speed,
      color: cfg.color,
      fireRate: cfg.fireRate,
      fireCooldown: Math.random() * 1.5,
      shootPattern: cfg.shootPattern,
      score: cfg.score,
      age: 0,
      initialX: Math.random() * (this.width - 80) + 40
    };

    this.enemies.push(enemy);
  }

  spawnBoss() {
    this.bossActive = true;
    const b = this.bossData;
    this.boss = {
      id: b.id,
      name: b.name,
      x: this.width / 2,
      y: -120,
      targetY: 130,
      width: b.visuals?.width || 140,
      height: b.visuals?.height || 90,
      maxHp: b.maxHealth,
      hp: b.maxHealth,
      color: b.visuals?.hullColor || '#64748b',
      accentColor: b.visuals?.accentColor || '#ef4444',
      coreGlow: b.visuals?.coreGlow || '#f97316',
      phases: b.phases || [],
      currentPhaseIdx: 0,
      attackCooldown: 2.0,
      telegraphTimer: 0,
      isTelegraphing: false,
      age: 0
    };

    sound.playExplosion(true);
  }

  // --- POWER-UP EXECUTION (PDF Part V, Section 26) ---
  activatePowerUp(powerUpId) {
    this.powerUpsUsed.push({ id: powerUpId, timestamp: Date.now() });

    switch (powerUpId) {
      case 'shield_pulse':
        this.activePowerUps.shield = 6.0;
        sound.playShield();
        break;

      case 'rapid_fire':
        this.activePowerUps.rapidFire = 8.0;
        sound.playPowerUp();
        break;

      case 'spread_shot':
        this.activePowerUps.spreadShot = 10.0;
        sound.playPowerUp();
        break;

      case 'homing_missiles':
        sound.playPowerUp();
        this.fireHomingSalvo();
        break;

      case 'emp_blast':
        sound.playExplosion(true);
        // Wipe all enemy bullets
        this.enemyProjectiles = [];
        // Damage all active enemies
        this.enemies.forEach(e => {
          e.hp -= 120;
          this.createExplosion(e.x, e.y, 10, '#a855f7');
        });
        if (this.boss) this.boss.hp -= 150;
        break;

      case 'repair_drone':
        sound.playPickup();
        if (this.player) {
          this.player.health = Math.min(this.player.maxHealth, this.player.health + 50);
          this.createExplosion(this.player.x, this.player.y, 12, '#10b981');
        }
        break;

      case 'overdrive':
        this.activePowerUps.overdrive = 7.0;
        sound.playPowerUp();
        break;

      case 'emergency_warp':
        sound.playShield();
        if (this.player) {
          this.player.x = this.width / 2;
          this.player.y = this.height - 120;
          this.activePowerUps.warpInvuln = 2.5;
          this.createExplosion(this.player.x, this.player.y, 25, '#f59e0b');
        }
        break;
    }
  }

  fireHomingSalvo() {
    const missileCount = 6;
    for (let i = 0; i < missileCount; i++) {
      const angle = (-Math.PI / 2) + ((i - (missileCount - 1) / 2) * 0.35);
      this.playerProjectiles.push({
        x: this.player.x,
        y: this.player.y - 20,
        vx: Math.cos(angle) * 300,
        vy: Math.sin(angle) * 300,
        damage: 85,
        isHoming: true,
        target: this.findHomingTarget(),
        lifetime: 3.5,
        color: '#f97316'
      });
    }
  }

  findHomingTarget() {
    if (this.boss) return this.boss;
    if (this.enemies.length > 0) {
      return this.enemies[Math.floor(Math.random() * this.enemies.length)];
    }
    return null;
  }

  // Revive Player from checkpoint (PDF Part VII, Section 41)
  revivePlayer() {
    if (!this.player) return;
    this.player.health = this.player.maxHealth;
    this.player.shield = this.player.maxShield;
    this.player.invulnerableTimer = 3.0;
    this.enemyProjectiles = []; // Clear danger
    this.createExplosion(this.player.x, this.player.y, 30, '#00f0ff');
    sound.playShield();
  }

  // --- GAME UPDATE & LOOP ---
  loop(currentTime) {
    if (!this.isRunning) return;

    const dt = Math.min(0.1, (currentTime - this.lastTime) / 1000);
    this.lastTime = currentTime;

    if (!this.isPaused) {
      this.update(dt);
    }
    this.render();

    this.animationFrameId = requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    this.duration += dt;

    // Update active powerup timers
    for (const key in this.activePowerUps) {
      if (this.activePowerUps[key] > 0) {
        this.activePowerUps[key] = Math.max(0, this.activePowerUps[key] - dt);
      }
    }

    this.updateStars(dt);
    this.updatePlayer(dt);
    this.updateWaves(dt);
    this.updateBoss(dt);
    this.updateEnemies(dt);
    this.updateProjectiles(dt);
    this.updatePickups(dt);
    this.updateParticles(dt);
    this.checkCollisions();
  }

  updateStars(dt) {
    this.stars.forEach(star => {
      star.y += star.speed * (this.activePowerUps.overdrive > 0 ? 120 : 60) * dt;
      if (star.y > this.height) {
        star.y = 0;
        star.x = Math.random() * this.width;
      }
    });
  }

  updatePlayer(dt) {
    if (!this.player) return;

    if (this.player.invulnerableTimer > 0) {
      this.player.invulnerableTimer -= dt;
    }

    // Shield passive regeneration
    if (this.player.shield < this.player.maxShield && this.player.invulnerableTimer <= 0) {
      this.player.shield = Math.min(this.player.maxShield, this.player.shield + dt * 4);
    }

    // Movement
    let dx = 0;
    let dy = 0;
    const speed = this.player.speed * (this.activePowerUps.overdrive > 0 ? 1.3 : 1.0);

    if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) dx -= 1;
    if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) dx += 1;
    if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) dy -= 1;
    if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) dy += 1;

    // Mobile touch target steering
    if (this.touchControl.active) {
      const diffX = this.touchControl.targetX - this.player.x;
      const diffY = this.touchControl.targetY - this.player.y;
      const dist = Math.hypot(diffX, diffY);
      if (dist > 5) {
        dx = diffX / dist;
        dy = diffY / dist;
      }
    }

    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    this.player.x = Math.max(30, Math.min(this.width - 30, this.player.x + dx * speed * dt));
    this.player.y = Math.max(50, Math.min(this.height - 40, this.player.y + dy * speed * dt));

    // Engine thruster particles
    if (Math.random() < 0.6) {
      this.particles.push({
        x: this.player.x + (Math.random() * 8 - 4),
        y: this.player.y + 24,
        vx: (Math.random() * 30 - 15),
        vy: Math.random() * 80 + 100,
        radius: Math.random() * 3 + 1,
        color: this.player.engineColor,
        alpha: 0.8,
        decay: 3.5
      });
    }

    // Auto-fire or key-fire
    this.player.fireCooldown -= dt;
    const shouldFire = this.autoFire || this.keys[' '] || this.keys['Spacebar'];
    const currentRate = this.activePowerUps.rapidFire > 0
      ? this.player.baseFireRate * 0.4
      : this.player.baseFireRate;

    if (shouldFire && this.player.fireCooldown <= 0) {
      this.firePlayerWeapons();
      this.player.fireCooldown = currentRate;
    }
  }

  firePlayerWeapons() {
    this.shotsFired++;
    const dmg = this.player.weaponDamage * (this.activePowerUps.overdrive > 0 ? 1.5 : 1.0);

    if (this.activePowerUps.spreadShot > 0) {
      // 5-way Spread Shot
      sound.playShoot('laser');
      [-0.35, -0.18, 0, 0.18, 0.35].forEach(ang => {
        this.playerProjectiles.push({
          x: this.player.x,
          y: this.player.y - 20,
          vx: Math.sin(ang) * 600,
          vy: -Math.cos(ang) * 600,
          damage: dmg * 0.85,
          color: '#00f0ff',
          radius: 4
        });
      });
    } else {
      // Dual Standard Blasters
      sound.playShoot('default');
      [-12, 12].forEach(offsetX => {
        this.playerProjectiles.push({
          x: this.player.x + offsetX,
          y: this.player.y - 18,
          vx: 0,
          vy: -680,
          damage: dmg,
          color: this.player.color,
          radius: 3.5
        });
      });
    }
  }

  updateWaves(dt) {
    if (!this.isWaveSpawning) return;

    this.waveSpawnTimer += dt;
    const remaining = [];

    this.waveEnemiesRemaining.forEach(item => {
      if (this.waveSpawnTimer >= item.delay) {
        this.spawnEnemy(item.type);
      } else {
        remaining.push(item);
      }
    });

    this.waveEnemiesRemaining = remaining;
    if (this.waveEnemiesRemaining.length === 0) {
      this.isWaveSpawning = false;
    }
  }

  updateEnemies(dt) {
    const surviving = [];

    this.enemies.forEach(e => {
      e.age += dt;

      // Trajectory patterns
      if (e.type === 'interceptor') {
        e.y += e.speed * dt;
        e.x = e.initialX + Math.sin(e.age * 3.5) * 60;
      } else if (e.type === 'gunship') {
        if (e.y < 160) {
          e.y += e.speed * dt;
        } else {
          e.x += Math.sin(e.age * 2) * 80 * dt;
        }
      } else if (e.type === 'elite') {
        if (e.y < 140) {
          e.y += e.speed * dt;
        } else {
          e.x = (this.width / 2) + Math.cos(e.age * 1.5) * 140;
        }
      } else {
        e.y += e.speed * dt;
      }

      // Hostile Firing logic
      e.fireCooldown -= dt;
      if (e.fireCooldown <= 0 && e.y > 0 && e.y < this.height - 100) {
        this.fireEnemyWeapon(e);
        e.fireCooldown = e.fireRate;
      }

      // Check off-screen
      if (e.y < this.height + 60 && e.hp > 0) {
        surviving.push(e);
      }
    });

    this.enemies = surviving;

    // Check if wave is cleared
    if (this.enemies.length === 0 && !this.isWaveSpawning && !this.bossActive) {
      this.loadWave(this.currentWaveIdx + 1);
    }
  }

  fireEnemyWeapon(e) {
    if (e.shootPattern === 'aimed') {
      const angle = Math.atan2(this.player.y - e.y, this.player.x - e.x);
      this.enemyProjectiles.push({
        x: e.x,
        y: e.y + 16,
        vx: Math.cos(angle) * 260,
        vy: Math.sin(angle) * 260,
        damage: 18,
        color: '#f43f5e',
        radius: 4
      });
    } else if (e.shootPattern === 'heavy_dual') {
      [-10, 10].forEach(ox => {
        this.enemyProjectiles.push({
          x: e.x + ox,
          y: e.y + 20,
          vx: 0,
          vy: 240,
          damage: 25,
          color: '#eab308',
          radius: 5
        });
      });
    } else if (e.shootPattern === 'spiral_elite') {
      [-0.3, 0, 0.3].forEach(ang => {
        this.enemyProjectiles.push({
          x: e.x,
          y: e.y + 20,
          vx: Math.sin(ang) * 220,
          vy: Math.cos(ang) * 220,
          damage: 22,
          color: '#ec4899',
          radius: 4.5
        });
      });
    } else {
      this.enemyProjectiles.push({
        x: e.x,
        y: e.y + 16,
        vx: 0,
        vy: 220,
        damage: 12,
        color: '#38bdf8',
        radius: 3.5
      });
    }
  }

  updateBoss(dt) {
    if (!this.boss) return;

    this.boss.age += dt;

    // Fly down to battle position
    if (this.boss.y < this.boss.targetY) {
      this.boss.y += 60 * dt;
      return;
    }

    // Boss Phase tracking
    const hpRatio = this.boss.hp / this.boss.maxHp;
    const currentPhase = this.boss.phases.find(p => hpRatio <= p.healthThreshold) || this.boss.phases[0];

    // Lateral swaying
    this.boss.x = (this.width / 2) + Math.sin(this.boss.age * 0.9) * 120;

    // Telegraphing & Attacks
    this.boss.attackCooldown -= dt;
    if (this.boss.attackCooldown <= 0.8 && !this.boss.isTelegraphing) {
      this.boss.isTelegraphing = true;
    }

    if (this.boss.attackCooldown <= 0) {
      this.fireBossAttack(currentPhase);
      this.boss.attackCooldown = currentPhase.attackInterval || 2.0;
      this.boss.isTelegraphing = false;
    }
  }

  fireBossAttack(phase) {
    sound.playExplosion(false);
    const count = phase.projectileCount || 8;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI / count) * i + Math.sin(this.boss.age);
      this.enemyProjectiles.push({
        x: this.boss.x,
        y: this.boss.y + 35,
        vx: Math.cos(angle) * 240,
        vy: Math.sin(angle) * 240,
        damage: 28,
        color: this.boss.accentColor,
        radius: 6
      });
    }
  }

  updateProjectiles(dt) {
    // Player bullets
    const nextPlayerProjectiles = [];
    this.playerProjectiles.forEach(p => {
      if (p.isHoming && p.target && p.target.hp > 0) {
        const dx = p.target.x - p.x;
        const dy = p.target.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 10) {
          p.vx += (dx / dist) * 800 * dt;
          p.vy += (dy / dist) * 800 * dt;
        }
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.y > -20 && p.y < this.height + 20 && p.x > -20 && p.x < this.width + 20) {
        nextPlayerProjectiles.push(p);
      }
    });
    this.playerProjectiles = nextPlayerProjectiles;

    // Enemy bullets
    const nextEnemyProjectiles = [];
    this.enemyProjectiles.forEach(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.y > -20 && p.y < this.height + 20 && p.x > -20 && p.x < this.width + 20) {
        nextEnemyProjectiles.push(p);
      }
    });
    this.enemyProjectiles = nextEnemyProjectiles;
  }

  updatePickups(dt) {
    const nextPickups = [];
    this.pickups.forEach(pk => {
      // Magnetic attraction to player
      if (this.player) {
        const dx = this.player.x - pk.x;
        const dy = this.player.y - pk.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 150) {
          pk.x += (dx / dist) * 280 * dt;
          pk.y += (dy / dist) * 280 * dt;
        } else {
          pk.y += 90 * dt;
        }

        // Collection collision
        if (dist < 30) {
          this.collectPickup(pk);
          return;
        }
      }

      if (pk.y < this.height + 30) {
        nextPickups.push(pk);
      }
    });
    this.pickups = nextPickups;
  }

  collectPickup(pk) {
    sound.playPickup();
    this.createExplosion(pk.x, pk.y, 8, pk.color);

    if (pk.type === 'credits') {
      this.score += 150;
    } else if (pk.type === 'repair') {
      this.player.health = Math.min(this.player.maxHealth, this.player.health + 30);
    } else if (pk.type === 'shield') {
      this.player.shield = Math.min(this.player.maxShield, this.player.shield + 25);
    }
  }

  updateParticles(dt) {
    const next = [];
    this.particles.forEach(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha -= p.decay * dt;
      if (p.alpha > 0) next.push(p);
    });
    this.particles = next;
  }

  createExplosion(x, y, count = 15, color = '#f97316') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 160 + 40;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 3 + 1.5,
        color,
        alpha: 1.0,
        decay: Math.random() * 2 + 1.5
      });
    }
  }

  // --- COLLISION ENGINE ---
  checkCollisions() {
    if (!this.player) return;

    // 1. Player Projectiles vs Enemies
    this.enemies.forEach(e => {
      this.playerProjectiles.forEach(p => {
        if (p.dead) return;
        if (Math.hypot(p.x - e.x, p.y - e.y) < (e.width / 2 + p.radius)) {
          p.dead = true;
          this.shotsHit++;
          e.hp -= p.damage;
          sound.playHit();
          this.createExplosion(p.x, p.y, 4, '#00f0ff');

          if (e.hp <= 0) {
            this.handleEnemyDestruction(e);
          }
        }
      });
    });
    this.playerProjectiles = this.playerProjectiles.filter(p => !p.dead);

    // 2. Player Projectiles vs Boss
    if (this.boss) {
      this.playerProjectiles.forEach(p => {
        if (p.dead) return;
        if (Math.hypot(p.x - this.boss.x, p.y - this.boss.y) < (this.boss.width / 2)) {
          p.dead = true;
          this.shotsHit++;
          this.boss.hp -= p.damage;
          sound.playHit();
          this.createExplosion(p.x, p.y, 5, this.boss.accentColor);

          if (this.boss.hp <= 0) {
            this.handleBossDestruction();
          }
        }
      });
      this.playerProjectiles = this.playerProjectiles.filter(p => !p.dead);
    }

    // 3. Enemy Projectiles vs Player
    const isInvulnerable = this.player.invulnerableTimer > 0 ||
      this.activePowerUps.shield > 0 ||
      this.activePowerUps.warpInvuln > 0;

    if (!isInvulnerable) {
      this.enemyProjectiles.forEach(p => {
        if (p.dead) return;
        if (Math.hypot(p.x - this.player.x, p.y - this.player.y) < 22) {
          p.dead = true;
          this.applyPlayerDamage(p.damage);
        }
      });
      this.enemyProjectiles = this.enemyProjectiles.filter(p => !p.dead);

      // Player Collision with Hostile Ships
      this.enemies.forEach(e => {
        if (Math.hypot(e.x - this.player.x, e.y - this.player.y) < 32) {
          this.applyPlayerDamage(35);
          e.hp -= 80;
          if (e.hp <= 0) this.handleEnemyDestruction(e);
        }
      });
    }
  }

  applyPlayerDamage(amount) {
    this.damageTaken += amount;
    sound.playHit();
    this.createExplosion(this.player.x, this.player.y, 8, '#ef4444');

    if (this.player.shield > 0) {
      if (this.player.shield >= amount) {
        this.player.shield -= amount;
        amount = 0;
      } else {
        amount -= this.player.shield;
        this.player.shield = 0;
      }
    }

    if (amount > 0) {
      this.player.health -= amount;
      if (this.player.health <= 0) {
        this.handlePlayerDefeat();
      }
    }
  }

  handleEnemyDestruction(e) {
    this.enemiesDefeated++;
    this.score += e.score;
    sound.playExplosion(false);
    this.createExplosion(e.x, e.y, 16, e.color);

    // Drop eligibility (PDF Part II, Section 13)
    if (Math.random() < 0.35) {
      this.pickups.push({
        x: e.x,
        y: e.y,
        type: Math.random() < 0.5 ? 'credits' : (Math.random() < 0.5 ? 'shield' : 'repair'),
        color: '#f59e0b'
      });
    }
  }

  handleBossDestruction() {
    this.bossesDefeated++;
    this.score += 2500;
    this.bossDefeatedFlag = true;
    sound.playExplosion(true);
    this.createExplosion(this.boss.x, this.boss.y, 60, '#f59e0b');
    this.boss = null;
    this.bossActive = false;

    setTimeout(() => {
      this.triggerVictory();
    }, 1500);
  }

  handlePlayerDefeat() {
    this.stop();
    sound.playDefeat();
    this.createExplosion(this.player.x, this.player.y, 40, '#ef4444');

    if (this.callbacks.onDefeat) {
      this.callbacks.onDefeat(this.getTelemetry(false));
    }
  }

  triggerVictory() {
    this.stop();
    sound.playVictory();

    if (this.callbacks.onVictory) {
      this.callbacks.onVictory(this.getTelemetry(true));
    }
  }

  getTelemetry(won) {
    const accuracy = this.shotsFired > 0 ? Math.round((this.shotsHit / this.shotsFired) * 100) : 0;
    const healthRemainingPct = this.player ? Math.round((this.player.health / this.player.maxHealth) * 100) : 0;

    return {
      won,
      score: this.score,
      duration: Math.round(this.duration),
      enemiesDefeated: this.enemiesDefeated,
      bossesDefeated: this.bossesDefeated,
      damageTaken: Math.round(this.damageTaken),
      shotsFired: this.shotsFired,
      shotsHit: this.shotsHit,
      accuracy,
      healthRemainingPct,
      powerUpsUsed: this.powerUpsUsed
    };
  }

  // --- RENDERER ---
  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Deep Space Cosmic Background
    this.ctx.fillStyle = '#070913';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // 2. Stars
    this.stars.forEach(s => {
      this.ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
      this.ctx.fillRect(s.x, s.y, s.size, s.size);
    });

    // 3. Pickups
    this.pickups.forEach(pk => {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(pk.x, pk.y, 7, 0, Math.PI * 2);
      this.ctx.fillStyle = pk.color;
      this.ctx.shadowColor = pk.color;
      this.ctx.shadowBlur = 10;
      this.ctx.fill();
      this.ctx.restore();
    });

    // 4. Projectiles
    this.playerProjectiles.forEach(p => {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius || 3.5, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = 8;
      this.ctx.fill();
      this.ctx.restore();
    });

    this.enemyProjectiles.forEach(p => {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius || 4, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = 8;
      this.ctx.fill();
      this.ctx.restore();
    });

    // 5. Enemies
    this.enemies.forEach(e => {
      this.renderEnemy(e);
    });

    // 6. Boss
    if (this.boss) {
      this.renderBoss(this.boss);
    }

    // 7. Player Ship
    if (this.player && this.player.health > 0) {
      this.renderPlayer(this.player);
    }

    // 8. Particles
    this.particles.forEach(p => {
      this.ctx.save();
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }

  renderPlayer(p) {
    this.ctx.save();
    this.ctx.translate(p.x, p.y);

    // Invulnerability flashing
    if (p.invulnerableTimer > 0 && Math.floor(p.invulnerableTimer * 10) % 2 === 0) {
      this.ctx.globalAlpha = 0.5;
    }

    // Active Shield Aura
    if (this.activePowerUps.shield > 0 || p.shield > 0) {
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 34, 0, Math.PI * 2);
      this.ctx.strokeStyle = this.activePowerUps.shield > 0 ? '#38bdf8' : 'rgba(56, 189, 248, 0.4)';
      this.ctx.lineWidth = 2.5;
      this.ctx.stroke();
    }

    // Spaceship Hull polygon
    this.ctx.beginPath();
    this.ctx.moveTo(0, -24); // Nose
    this.ctx.lineTo(18, 18); // Right Wing
    this.ctx.lineTo(8, 12);  // Right Inset
    this.ctx.lineTo(0, 16);  // Center Engine
    this.ctx.lineTo(-8, 12); // Left Inset
    this.ctx.lineTo(-18, 18); // Left Wing
    this.ctx.closePath();

    this.ctx.fillStyle = p.color;
    this.ctx.shadowColor = p.color;
    this.ctx.shadowBlur = 12;
    this.ctx.fill();

    // Cockpit canopy
    this.ctx.beginPath();
    this.ctx.ellipse(0, -4, 4, 8, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fill();

    this.ctx.restore();
  }

  renderEnemy(e) {
    this.ctx.save();
    this.ctx.translate(e.x, e.y);

    this.ctx.beginPath();
    this.ctx.moveTo(0, 18); // Downward Nose
    this.ctx.lineTo(16, -14); // Wing
    this.ctx.lineTo(0, -8);
    this.ctx.lineTo(-16, -14);
    this.ctx.closePath();

    this.ctx.fillStyle = e.color;
    this.ctx.shadowColor = e.color;
    this.ctx.shadowBlur = 8;
    this.ctx.fill();

    // Small HP Bar
    if (e.hp < e.maxHp) {
      const pct = Math.max(0, e.hp / e.maxHp);
      this.ctx.fillStyle = 'rgba(255,255,255,0.2)';
      this.ctx.fillRect(-16, -22, 32, 3);
      this.ctx.fillStyle = '#ef4444';
      this.ctx.fillRect(-16, -22, 32 * pct, 3);
    }

    this.ctx.restore();
  }

  renderBoss(b) {
    this.ctx.save();
    this.ctx.translate(b.x, b.y);

    // Telegraphing alert glow
    if (b.isTelegraphing) {
      this.ctx.beginPath();
      this.ctx.arc(0, 0, b.width * 0.75, 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 + Math.sin(b.age * 15) * 0.4})`;
      this.ctx.lineWidth = 3;
      this.ctx.stroke();
    }

    // Heavy Boss Hull
    this.ctx.beginPath();
    this.ctx.moveTo(0, b.height / 2);
    this.ctx.lineTo(b.width / 2, -b.height / 4);
    this.ctx.lineTo(b.width / 3, -b.height / 2);
    this.ctx.lineTo(-b.width / 3, -b.height / 2);
    this.ctx.lineTo(-b.width / 2, -b.height / 4);
    this.ctx.closePath();

    this.ctx.fillStyle = b.color;
    this.ctx.shadowColor = b.accentColor;
    this.ctx.shadowBlur = 18;
    this.ctx.fill();

    // Glowing Power Core
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 16, 0, Math.PI * 2);
    this.ctx.fillStyle = b.coreGlow;
    this.ctx.shadowColor = b.coreGlow;
    this.ctx.shadowBlur = 15;
    this.ctx.fill();

    this.ctx.restore();
  }
}

