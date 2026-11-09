// Authoritative Wallet & Upgrade Service (PDF Part IV & VI, Sections 24-25, 36, 38)
import { store } from '../../models/store.js';
import { SHIPS_DATA } from '../../data/shipsData.js';
import { POWERUPS_DATA } from '../../data/powerupsData.js';
import { ECONOMY_CONFIG } from '../../config/economyConfig.js';

export class WalletService {
  // Inspect player balances
  static getBalances(userId) {
    const profile = store.getProfile(userId);
    if (!profile) throw new Error('Player profile not found');
    return {
      credits: profile.credits,
      energyCores: profile.energyCores,
      platformRewardCoins: profile.platformRewardCoins || 0,
      xp: profile.xp,
      level: profile.level
    };
  }

  // Ship Attribute Upgrade (PDF Section 24 & 25)
  // Step 1: Authenticate player
  // Step 2: Retrieve authoritative ship state
  // Step 3: Validate upgrade & max level
  // Step 4: Determine server-controlled price
  // Step 5: Verify sufficient currency
  // Step 6: Deduct atomically
  // Step 7: Apply upgrade
  // Step 8: Record transaction
  // Step 9: Return updated state
  static upgradeShipAttribute(userId, shipId, attributeName) {
    const profile = store.getProfile(userId);
    if (!profile) throw new Error('Player profile not found');

    const shipDef = SHIPS_DATA.find(s => s.id === shipId);
    if (!shipDef) throw new Error('Invalid ship ID');

    if (!profile.unlockedShips.includes(shipId)) {
      throw new Error('Ship is not yet unlocked');
    }

    const upgradeDef = shipDef.upgrades[attributeName];
    if (!upgradeDef) throw new Error(`Invalid upgrade attribute: ${attributeName}`);

    // Ensure shipUpgrades object exists
    if (!profile.shipUpgrades[shipId]) {
      profile.shipUpgrades[shipId] = {
        weaponDamage: 1, fireRate: 1, maxHealth: 1, movementSpeed: 1, shieldCapacity: 1, specialCooldown: 1
      };
    }

    const currentLevel = profile.shipUpgrades[shipId][attributeName] || 1;
    if (currentLevel >= upgradeDef.maxLevel) {
      throw new Error(`Attribute ${attributeName} is already at max level (${upgradeDef.maxLevel})`);
    }

    // Determine authoritative server price
    const nextLevel = currentLevel + 1;
    const creditCost = Math.round(upgradeDef.creditCostBase * Math.pow(ECONOMY_CONFIG.upgradeConfig.costMultiplier, currentLevel - 1));
    const requiresCore = nextLevel >= ECONOMY_CONFIG.upgradeConfig.coreCostLevelThreshold;
    const coreCost = requiresCore ? 1 : 0;

    // Check balances
    if (profile.credits < creditCost) {
      throw new Error(`Insufficient Credits. Cost: ${creditCost}, Current: ${profile.credits}`);
    }
    if (requiresCore && profile.energyCores < coreCost) {
      throw new Error(`Insufficient Energy Cores. Cost: ${coreCost}, Current: ${profile.energyCores}`);
    }

    // Atomic deductions
    store.modifyCurrencyAtomically(userId, 'credits', -creditCost, {
      source: 'SHIP_UPGRADE',
      referenceId: `${shipId}_${attributeName}_lvl${nextLevel}`,
      transactionType: 'UPGRADE_PURCHASE'
    });

    if (coreCost > 0) {
      store.modifyCurrencyAtomically(userId, 'energyCores', -coreCost, {
        source: 'SHIP_UPGRADE',
        referenceId: `${shipId}_${attributeName}_lvl${nextLevel}`,
        transactionType: 'UPGRADE_PURCHASE'
      });
    }

    // Apply upgrade to player profile
    profile.shipUpgrades[shipId][attributeName] = nextLevel;
    store.updateProfile(userId, profile);

    store.recordEvent('ship_upgraded', {
      userId,
      shipId,
      attribute: attributeName,
      newLevel: nextLevel
    });

    return {
      success: true,
      shipId,
      attributeName,
      newLevel,
      creditsRemaining: profile.credits,
      energyCoresRemaining: profile.energyCores,
      shipUpgrades: profile.shipUpgrades[shipId]
    };
  }

  // Unlock Ship (PDF Section 22)
  static unlockShip(userId, shipId) {
    const profile = store.getProfile(userId);
    if (!profile) throw new Error('Player profile not found');

    const shipDef = SHIPS_DATA.find(s => s.id === shipId);
    if (!shipDef) throw new Error('Invalid ship ID');

    if (profile.unlockedShips.includes(shipId)) {
      throw new Error('Ship is already unlocked');
    }

    const { credits: creditCost, cores: coreCost } = shipDef.unlockCost;

    if (profile.credits < creditCost) {
      throw new Error(`Insufficient credits. Required: ${creditCost}, Available: ${profile.credits}`);
    }
    if (profile.energyCores < coreCost) {
      throw new Error(`Insufficient energy cores. Required: ${coreCost}, Available: ${profile.energyCores}`);
    }

    if (creditCost > 0) {
      store.modifyCurrencyAtomically(userId, 'credits', -creditCost, {
        source: 'SHIP_UNLOCK',
        referenceId: shipId,
        transactionType: 'UPGRADE_PURCHASE'
      });
    }

    if (coreCost > 0) {
      store.modifyCurrencyAtomically(userId, 'energyCores', -coreCost, {
        source: 'SHIP_UNLOCK',
        referenceId: shipId,
        transactionType: 'UPGRADE_PURCHASE'
      });
    }

    profile.unlockedShips.push(shipId);
    profile.shipUpgrades[shipId] = {
      weaponDamage: 1, fireRate: 1, maxHealth: 1, movementSpeed: 1, shieldCapacity: 1, specialCooldown: 1
    };
    store.updateProfile(userId, profile);

    return {
      success: true,
      unlockedShipId: shipId,
      unlockedShips: profile.unlockedShips,
      creditsRemaining: profile.credits,
      energyCoresRemaining: profile.energyCores
    };
  }

  // Acquire Power-Up using Credits
  static acquirePowerUp(userId, powerUpId, quantity = 1) {
    const profile = store.getProfile(userId);
    if (!profile) throw new Error('Player profile not found');

    const pDef = POWERUPS_DATA.find(p => p.id === powerUpId);
    if (!pDef) throw new Error('Invalid power-up ID');

    const totalCost = pDef.currencyCost * quantity;
    if (profile.credits < totalCost) {
      throw new Error(`Insufficient credits for power-up purchase. Cost: ${totalCost}, Current: ${profile.credits}`);
    }

    store.modifyCurrencyAtomically(userId, 'credits', -totalCost, {
      source: 'POWERUP_ACQUIRE',
      referenceId: `${powerUpId}_x${quantity}`,
      transactionType: 'BOOSTER_PURCHASE'
    });

    profile.powerUpInventory[powerUpId] = (profile.powerUpInventory[powerUpId] || 0) + quantity;
    store.updateProfile(userId, profile);

    return {
      success: true,
      powerUpId,
      newCount: profile.powerUpInventory[powerUpId],
      creditsRemaining: profile.credits
    };
  }
}

