// 8 Mandatory Power-Up Definitions (PDF Part V, Sections 26-28)
export const POWERUPS_DATA = [
  {
    id: 'shield_pulse',
    name: 'Shield Pulse',
    description: 'Temporarily creates an impenetrable energy barrier absorbing all hostile projectile and collision damage.',
    icon: 'Shield',
    effectType: 'invulnerability',
    duration: 6.0,
    cooldown: 25.0,
    maxUsesPerMission: 3,
    currencyCost: 75,
    rewardedAdEligible: true,
    stacking: 'refresh_duration'
  },
  {
    id: 'rapid_fire',
    name: 'Rapid Fire',
    description: 'Supercharges weapon cooling systems, tripling firing rate for high burst firepower.',
    icon: 'Zap',
    effectType: 'fireRateMultiplier',
    duration: 8.0,
    multiplier: 2.5,
    cooldown: 20.0,
    maxUsesPerMission: 3,
    currencyCost: 50,
    rewardedAdEligible: true,
    stacking: 'refresh_duration'
  },
  {
    id: 'spread_shot',
    name: 'Spread Shot',
    description: 'Fires a devastating 5-way spread of hyper-velocity plasma bolts across the battle screen.',
    icon: 'Split',
    effectType: 'multiShot',
    duration: 10.0,
    cooldown: 22.0,
    maxUsesPerMission: 3,
    currencyCost: 60,
    rewardedAdEligible: true,
    stacking: 'refresh_duration'
  },
  {
    id: 'homing_missiles',
    name: 'Homing Missiles',
    description: 'Deploys a salvo of 6 intelligent self-guided micro-missiles that lock onto hostile targets.',
    icon: 'Crosshair',
    effectType: 'guidedProjectiles',
    missileCount: 6,
    damage: 80,
    duration: 0, // instant salvo
    cooldown: 18.0,
    maxUsesPerMission: 4,
    currencyCost: 80,
    rewardedAdEligible: true,
    stacking: 'queue_burst'
  },
  {
    id: 'emp_blast',
    name: 'EMP Blast',
    description: 'Detonates an electromagnetic pulse wiping out all enemy projectiles and stunning all enemies for 3 seconds.',
    icon: 'Radio',
    effectType: 'screenNuke',
    stunDuration: 3.5,
    blastDamage: 120,
    cooldown: 30.0,
    maxUsesPerMission: 2,
    currencyCost: 100,
    rewardedAdEligible: true,
    stacking: 'replace'
  },
  {
    id: 'repair_drone',
    name: 'Repair Drone',
    description: 'Deploys nano-bots that immediately reconstruct ship hull integrity by restoring 50 HP.',
    icon: 'HeartPulse',
    effectType: 'heal',
    healAmount: 50,
    cooldown: 24.0,
    maxUsesPerMission: 3,
    currencyCost: 70,
    rewardedAdEligible: true,
    stacking: 'additive'
  },
  {
    id: 'overdrive',
    name: 'Overdrive',
    description: 'Overclocks propulsion and weapons: +30% movement speed, +50% weapon damage, and slight damage reduction.',
    icon: 'Flame',
    effectType: 'statBoost',
    duration: 7.0,
    speedMultiplier: 1.3,
    damageMultiplier: 1.5,
    cooldown: 25.0,
    maxUsesPerMission: 2,
    currencyCost: 90,
    rewardedAdEligible: false,
    stacking: 'refresh_duration'
  },
  {
    id: 'emergency_warp',
    name: 'Emergency Warp',
    description: 'Phases the ship across spacetime coordinates, instantly escaping enemy crossfire with 2 seconds of invulnerability.',
    icon: 'Compass',
    effectType: 'teleportDefend',
    invulnDuration: 2.0,
    cooldown: 28.0,
    maxUsesPerMission: 2,
    currencyCost: 110,
    rewardedAdEligible: false,
    stacking: 'replace'
  }
];

