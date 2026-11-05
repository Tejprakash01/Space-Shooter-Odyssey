// 5 Sectors and 50 Playable Data-Driven Missions (PDF Part III, Sections 14-17)

export const SECTORS_DATA = [
  {
    id: 'orion-frontier',
    name: 'Sector 1: Orion Frontier',
    description: 'The outermost perimeter of allied space. Dense with rogue asteroid fields and lone scout raiders.',
    theme: {
      primaryColor: '#00f0ff',
      nebulaColor: 'rgba(0, 180, 255, 0.15)',
      starDensity: 120,
      spaceDustColor: '#38bdf8'
    },
    missionRange: [1, 10],
    bossId: 'iron_warden'
  },
  {
    id: 'crimson-nebula',
    name: 'Sector 2: Crimson Nebula',
    description: 'Volatile red gas clouds harbouring aggressive interceptor wolfpacks and pirate cruisers.',
    theme: {
      primaryColor: '#ef4444',
      nebulaColor: 'rgba(239, 68, 68, 0.18)',
      starDensity: 140,
      spaceDustColor: '#f87171'
    },
    missionRange: [11, 20],
    bossId: 'nebula_serpent'
  },
  {
    id: 'frozen-expanse',
    name: 'Sector 3: Frozen Expanse',
    description: 'A sub-zero dead zone littered with shattered comet fragments and heavy long-range gunships.',
    theme: {
      primaryColor: '#38bdf8',
      nebulaColor: 'rgba(56, 189, 248, 0.15)',
      starDensity: 160,
      spaceDustColor: '#bae6fd'
    },
    missionRange: [21, 30],
    bossId: 'solar_devourer'
  },
  {
    id: 'rift-territory',
    name: 'Sector 4: Rift Territory',
    description: 'Gravitational anomalies and warp fractures where elite carriers warp in continuous reinforcements.',
    theme: {
      primaryColor: '#a855f7',
      nebulaColor: 'rgba(168, 85, 247, 0.20)',
      starDensity: 180,
      spaceDustColor: '#c084fc'
    },
    missionRange: [31, 40],
    bossId: 'rift_carrier'
  },
  {
    id: 'void-citadel',
    name: 'Sector 5: Void Citadel',
    description: 'The fortified heart of the hostile flagship armada commanded by the ancient Void Emperor.',
    theme: {
      primaryColor: '#f59e0b',
      nebulaColor: 'rgba(245, 158, 11, 0.22)',
      starDensity: 200,
      spaceDustColor: '#fbbf24'
    },
    missionRange: [41, 50],
    bossId: 'void_emperor'
  }
];

// Helper to generate the 50 structured, playable missions
function build50Missions() {
  const missions = [];
  const enemyTypes = ['scout', 'interceptor', 'armored_cruiser', 'gunship', 'elite'];

  for (let i = 1; i <= 50; i++) {
    let sectorId = 'orion-frontier';
    let difficulty = 'beginner';
    let baseCredits = 80 + i * 15;
    let baseXP = 40 + i * 12;
    let bossId = null;

    if (i <= 10) {
      sectorId = 'orion-frontier';
      difficulty = i <= 5 ? 'tutorial' : 'beginner';
    } else if (i <= 20) {
      sectorId = 'crimson-nebula';
      difficulty = 'easy';
    } else if (i <= 30) {
      sectorId = 'frozen-expanse';
      difficulty = 'medium';
    } else if (i <= 40) {
      sectorId = 'rift-territory';
      difficulty = 'hard';
    } else {
      sectorId = 'void-citadel';
      difficulty = 'expert';
    }

    // Set Bosses for 10, 20, 30, 40, 50
    if (i === 10) bossId = 'iron_warden';
    if (i === 20) bossId = 'nebula_serpent';
    if (i === 30) bossId = 'solar_devourer';
    if (i === 40) bossId = 'rift_carrier';
    if (i === 50) bossId = 'void_emperor';

    // Varied objective types across the campaign
    let objective;
    if (bossId) {
      objective = {
        type: 'defeat_boss',
        bossId,
        description: `Defeat the sector flagship boss encounter.`
      };
      baseCredits *= 2.5;
      baseXP *= 2.0;
    } else if (i % 7 === 0) {
      objective = {
        type: 'survive_time',
        durationSeconds: 45 + Math.floor(i / 2),
        description: `Survive the relentless bombardment for ${45 + Math.floor(i / 2)} seconds.`
      };
    } else if (i % 5 === 0) {
      objective = {
        type: 'destroy_target_type',
        targetType: i > 25 ? 'elite' : 'armored_cruiser',
        requiredCount: 3 + Math.floor(i / 10),
        description: `Eliminate high-threat heavy targets.`
      };
    } else if (i % 4 === 0) {
      objective = {
        type: 'collect_items',
        requiredCount: 5 + Math.floor(i / 8),
        description: `Collect fallen energy cores and power supplies from wrecks.`
      };
    } else {
      const killTarget = 10 + i * 2;
      objective = {
        type: 'destroy_enemies',
        requiredCount: killTarget,
        description: `Clear hostile patrol: Destroy ${killTarget} enemy vessels.`
      };
    }

    // Dynamic wave composition
    const waveCount = bossId ? 3 : Math.min(6, 2 + Math.floor(i / 10));
    const waves = [];
    for (let w = 1; w <= waveCount; w++) {
      const enemiesInWave = [];
      const primaryEnemy = enemyTypes[Math.min(enemyTypes.length - 1, Math.floor(i / 11))];
      enemiesInWave.push({
        type: primaryEnemy,
        count: 4 + Math.floor(i / 8) + w,
        spawnInterval: Math.max(0.6, 2.2 - (i * 0.03))
      });

      if (i > 8 && w > 1) {
        enemiesInWave.push({
          type: 'interceptor',
          count: 2 + Math.floor(i / 15),
          spawnInterval: 1.5
        });
      }
      if (i > 22 && w >= 2) {
        enemiesInWave.push({
          type: 'gunship',
          count: 1 + Math.floor(i / 25),
          spawnInterval: 3.0
        });
      }
      if (i > 35 && w === waveCount && !bossId) {
        enemiesInWave.push({
          type: 'elite',
          count: 1 + Math.floor(i / 40),
          spawnInterval: 4.0
        });
      }

      waves.push({
        id: w,
        name: `Wave ${w}`,
        enemies: enemiesInWave
      });
    }

    missions.push({
      id: `mission-${i < 10 ? '0' + i : i}`,
      sectorId,
      sequence: i,
      title: bossId
        ? `Sector Finale: ${bossId.replace('_', ' ').toUpperCase()}`
        : `Operation Starfall ${i}`,
      difficulty,
      objective,
      waves,
      bossId,
      rewards: {
        credits: Math.round(baseCredits),
        xp: Math.round(baseXP),
        cores: bossId ? (i === 50 ? 5 : 2) : (i % 10 === 5 ? 1 : 0)
      },
      starConditions: {
        oneStar: 'Complete Mission Objective',
        twoStar: 'Finish with 60%+ Hull Integrity remaining',
        threeStar: 'Finish in under 90s with no deaths'
      },
      unlockRequirements: i === 1 ? [] : [`mission-${i - 1 < 10 ? '0' + (i - 1) : i - 1}`]
    });
  }
  return missions;
}

export const MISSIONS_DATA = build50Missions();

