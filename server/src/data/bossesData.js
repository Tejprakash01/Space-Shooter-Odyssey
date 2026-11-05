// 5 Original Boss Encounters with Multi-Phase Mechanics & Telegraphed Attacks (PDF Part II, Section 11)
export const BOSSES_DATA = [
  {
    id: 'iron_warden',
    name: 'The Iron Warden',
    title: 'Dreadnought Fortress',
    description: 'A heavily armored combat vessel fitted with impenetrable kinetic plating and twin rotary laser cannons.',
    maxHealth: 1500,
    visuals: {
      width: 140,
      height: 90,
      hullColor: '#64748b',
      accentColor: '#ef4444',
      coreGlow: '#f97316'
    },
    phases: [
      {
        phase: 1,
        healthThreshold: 1.0,
        attackInterval: 2.2,
        pattern: 'rotary_spread',
        projectileCount: 5,
        speed: 60,
        telegraphDuration: 0.8
      },
      {
        phase: 2,
        healthThreshold: 0.5,
        attackInterval: 1.5,
        pattern: 'cluster_missile_barrage',
        projectileCount: 8,
        speed: 90,
        telegraphDuration: 0.5
      }
    ],
    rewards: { credits: 400, cores: 1, xp: 200 }
  },
  {
    id: 'nebula_serpent',
    name: 'Nebula Serpent',
    title: 'Biological Plasma Hunter',
    description: 'An aggressive organic craft capable of erratic sine-wave movement and rapid acid plasma bursts.',
    maxHealth: 2400,
    visuals: {
      width: 120,
      height: 100,
      hullColor: '#059669',
      accentColor: '#10b981',
      coreGlow: '#34d399'
    },
    phases: [
      {
        phase: 1,
        healthThreshold: 1.0,
        attackInterval: 1.8,
        pattern: 'sine_plasma_spray',
        projectileCount: 7,
        speed: 130,
        telegraphDuration: 0.7
      },
      {
        phase: 2,
        healthThreshold: 0.45,
        attackInterval: 1.2,
        pattern: 'dual_spiral_blast',
        projectileCount: 12,
        speed: 170,
        telegraphDuration: 0.4
      }
    ],
    rewards: { credits: 650, cores: 1, xp: 350 }
  },
  {
    id: 'solar_devourer',
    name: 'Solar Devourer',
    title: 'Energy Singularity Engine',
    description: 'A massive energy siphon drawing coronal power to unleash devastating beam sweeps and solar flares.',
    maxHealth: 3800,
    visuals: {
      width: 160,
      height: 120,
      hullColor: '#d97706',
      accentColor: '#f59e0b',
      coreGlow: '#fef08a'
    },
    phases: [
      {
        phase: 1,
        healthThreshold: 1.0,
        attackInterval: 2.0,
        pattern: 'solar_beam_sweep',
        projectileCount: 9,
        speed: 70,
        telegraphDuration: 1.0
      },
      {
        phase: 2,
        healthThreshold: 0.5,
        attackInterval: 1.4,
        pattern: 'coronal_mass_ejection',
        projectileCount: 14,
        speed: 100,
        telegraphDuration: 0.6
      }
    ],
    rewards: { credits: 900, cores: 2, xp: 550 }
  },
  {
    id: 'rift_carrier',
    name: 'The Rift Carrier',
    title: 'Hyperspace Spawner',
    description: 'A colossal mobile hangar that warps swarms of kamikaze interceptors and fires gravitational pulses.',
    maxHealth: 5500,
    visuals: {
      width: 180,
      height: 130,
      hullColor: '#7e22ce',
      accentColor: '#a855f7',
      coreGlow: '#e9d5ff'
    },
    phases: [
      {
        phase: 1,
        healthThreshold: 1.0,
        attackInterval: 2.5,
        pattern: 'spawn_interceptor_escort',
        spawnMinionsCount: 3,
        projectileCount: 6,
        speed: 50,
        telegraphDuration: 0.9
      },
      {
        phase: 2,
        healthThreshold: 0.4,
        attackInterval: 1.6,
        pattern: 'rift_singularity_salvo',
        spawnMinionsCount: 5,
        projectileCount: 16,
        speed: 80,
        telegraphDuration: 0.5
      }
    ],
    rewards: { credits: 1300, cores: 2, xp: 800 }
  },
  {
    id: 'void_emperor',
    name: 'Void Emperor',
    title: 'Apocalypse Flagship',
    description: 'The supreme alien flagship wielding dark matter annihilator cannons and multi-stage shield regenerators.',
    maxHealth: 8500,
    visuals: {
      width: 220,
      height: 150,
      hullColor: '#0f172a',
      accentColor: '#38bdf8',
      coreGlow: '#f43f5e'
    },
    phases: [
      {
        phase: 1,
        healthThreshold: 1.0,
        attackInterval: 2.0,
        pattern: 'annihilator_ring',
        projectileCount: 16,
        speed: 90,
        telegraphDuration: 0.8
      },
      {
        phase: 2,
        healthThreshold: 0.66,
        attackInterval: 1.5,
        pattern: 'void_laser_grid',
        projectileCount: 22,
        speed: 120,
        telegraphDuration: 0.6
      },
      {
        phase: 3,
        healthThreshold: 0.33,
        attackInterval: 1.0,
        pattern: 'cataclysm_barrage',
        projectileCount: 30,
        speed: 150,
        telegraphDuration: 0.4
      }
    ],
    rewards: { credits: 2500, cores: 5, xp: 1500 }
  }
];

