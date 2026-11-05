// 5 Authoritative Ship Classes with Base Stats & Multi-level Upgrade Curves (PDF Part IV, Sections 22-24)
export const SHIPS_DATA = [
  {
    id: 'interceptor',
    name: 'Aero Interceptor',
    role: 'Balanced Fighter',
    description: 'Fast movement, balanced firepower, and moderate durability. The frontline all-rounder.',
    unlockType: 'starter',
    unlockCost: { credits: 0, cores: 0 },
    stats: {
      speed: 380,
      maxHealth: 100,
      shieldCapacity: 40,
      weaponDamage: 25,
      fireRate: 0.18, // seconds between shots
      specialCooldown: 12,
      projectileType: 'plasma_dual',
      specialAbility: 'spread_surge'
    },
    visuals: {
      primaryColor: '#00f0ff',
      accentColor: '#38bdf8',
      engineGlow: '#0284c7'
    },
    upgrades: {
      weaponDamage: { level: 1, maxLevel: 5, increment: 6, creditCostBase: 150 },
      fireRate: { level: 1, maxLevel: 5, increment: -0.02, creditCostBase: 180 },
      maxHealth: { level: 1, maxLevel: 5, increment: 25, creditCostBase: 120 },
      movementSpeed: { level: 1, maxLevel: 5, increment: 20, creditCostBase: 100 },
      shieldCapacity: { level: 1, maxLevel: 5, increment: 15, creditCostBase: 140 },
      specialCooldown: { level: 1, maxLevel: 5, increment: -1.2, creditCostBase: 200 }
    }
  },
  {
    id: 'striker',
    name: 'Valkyrie Striker',
    role: 'High Burst DPS',
    description: 'Heavy cannons with destructive firepower, compensated by lighter armor.',
    unlockType: 'credit_purchase',
    unlockCost: { credits: 1200, cores: 1 },
    stats: {
      speed: 360,
      maxHealth: 80,
      shieldCapacity: 30,
      weaponDamage: 45,
      fireRate: 0.25,
      specialCooldown: 10,
      projectileType: 'heavy_laser',
      specialAbility: 'overdrive_burst'
    },
    visuals: {
      primaryColor: '#f43f5e',
      accentColor: '#fb7185',
      engineGlow: '#e11d48'
    },
    upgrades: {
      weaponDamage: { level: 1, maxLevel: 5, increment: 10, creditCostBase: 200 },
      fireRate: { level: 1, maxLevel: 5, increment: -0.025, creditCostBase: 220 },
      maxHealth: { level: 1, maxLevel: 5, increment: 20, creditCostBase: 160 },
      movementSpeed: { level: 1, maxLevel: 5, increment: 18, creditCostBase: 140 },
      shieldCapacity: { level: 1, maxLevel: 5, increment: 12, creditCostBase: 150 },
      specialCooldown: { level: 1, maxLevel: 5, increment: -1.0, creditCostBase: 220 }
    }
  },
  {
    id: 'guardian',
    name: 'Aegis Guardian',
    role: 'Armored Tank',
    description: 'Massive defensive hull, robust shield capacitors, and shockwave pulse ability.',
    unlockType: 'credit_purchase',
    unlockCost: { credits: 2000, cores: 2 },
    stats: {
      speed: 310,
      maxHealth: 180,
      shieldCapacity: 90,
      weaponDamage: 30,
      fireRate: 0.22,
      specialCooldown: 15,
      projectileType: 'ion_blast',
      specialAbility: 'invulnerability_pulse'
    },
    visuals: {
      primaryColor: '#10b981',
      accentColor: '#34d399',
      engineGlow: '#059669'
    },
    upgrades: {
      weaponDamage: { level: 1, maxLevel: 5, increment: 7, creditCostBase: 170 },
      fireRate: { level: 1, maxLevel: 5, increment: -0.02, creditCostBase: 190 },
      maxHealth: { level: 1, maxLevel: 5, increment: 40, creditCostBase: 220 },
      movementSpeed: { level: 1, maxLevel: 5, increment: 15, creditCostBase: 150 },
      shieldCapacity: { level: 1, maxLevel: 5, increment: 25, creditCostBase: 240 },
      specialCooldown: { level: 1, maxLevel: 5, increment: -1.5, creditCostBase: 250 }
    }
  },
  {
    id: 'support',
    name: 'Chronos Support Craft',
    role: 'Tactical Utility',
    description: 'Enhanced magnet radius for resource scavenging, rapid cooldown resets, and repair drones.',
    unlockType: 'credit_purchase',
    unlockCost: { credits: 3000, cores: 3 },
    stats: {
      speed: 370,
      maxHealth: 110,
      shieldCapacity: 50,
      weaponDamage: 22,
      fireRate: 0.16,
      specialCooldown: 8,
      projectileType: 'chrono_beam',
      specialAbility: 'nanite_repair'
    },
    visuals: {
      primaryColor: '#a855f7',
      accentColor: '#c084fc',
      engineGlow: '#9333ea'
    },
    upgrades: {
      weaponDamage: { level: 1, maxLevel: 5, increment: 5, creditCostBase: 160 },
      fireRate: { level: 1, maxLevel: 5, increment: -0.018, creditCostBase: 180 },
      maxHealth: { level: 1, maxLevel: 5, increment: 25, creditCostBase: 180 },
      movementSpeed: { level: 1, maxLevel: 5, increment: 22, creditCostBase: 160 },
      shieldCapacity: { level: 1, maxLevel: 5, increment: 18, creditCostBase: 190 },
      specialCooldown: { level: 1, maxLevel: 5, increment: -1.0, creditCostBase: 240 }
    }
  },
  {
    id: 'experimental',
    name: 'Quantum Phantom X-1',
    role: 'Experimental Stealth Interceptor',
    description: 'Next-generation prototype utilizing dark energy warp fields and antimatter cluster torpedoes.',
    unlockType: 'milestone',
    unlockCost: { credits: 6000, cores: 6 },
    unlockRequirement: 'Complete Sector 4 (Mission 40)',
    stats: {
      speed: 420,
      maxHealth: 140,
      shieldCapacity: 70,
      weaponDamage: 55,
      fireRate: 0.14,
      specialCooldown: 10,
      projectileType: 'antimatter_cluster',
      specialAbility: 'quantum_warp'
    },
    visuals: {
      primaryColor: '#f59e0b',
      accentColor: '#fbbf24',
      engineGlow: '#d97706'
    },
    upgrades: {
      weaponDamage: { level: 1, maxLevel: 5, increment: 12, creditCostBase: 350 },
      fireRate: { level: 1, maxLevel: 5, increment: -0.015, creditCostBase: 380 },
      maxHealth: { level: 1, maxLevel: 5, increment: 30, creditCostBase: 300 },
      movementSpeed: { level: 1, maxLevel: 5, increment: 25, creditCostBase: 280 },
      shieldCapacity: { level: 1, maxLevel: 5, increment: 22, creditCostBase: 320 },
      specialCooldown: { level: 1, maxLevel: 5, increment: -1.2, creditCostBase: 400 }
    }
  }
];

