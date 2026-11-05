import { SHIPS_DATA } from '../data/shipsData.js';
import { store } from '../models/store.js';
import { WalletService } from '../services/economy/walletService.js';

export const getAllShips = (req, res) => {
  const profile = req.user ? store.getProfile(req.user.id) : null;
  const unlocked = profile ? profile.unlockedShips : ['interceptor'];
  const selected = profile ? profile.selectedShipId : 'interceptor';
  const upgradesMap = profile ? profile.shipUpgrades : {};

  const ships = SHIPS_DATA.map(s => ({
    ...s,
    isUnlocked: unlocked.includes(s.id),
    isSelected: selected === s.id,
    currentUpgrades: upgradesMap[s.id] || {
      weaponDamage: 1, fireRate: 1, maxHealth: 1, movementSpeed: 1, shieldCapacity: 1, specialCooldown: 1
    }
  }));

  return res.json({ success: true, ships });
};

export const getOwnedShips = (req, res) => {
  const profile = store.getProfile(req.user.id);
  if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

  const owned = SHIPS_DATA.filter(s => profile.unlockedShips.includes(s.id)).map(s => ({
    ...s,
    isSelected: profile.selectedShipId === s.id,
    currentUpgrades: profile.shipUpgrades[s.id] || {
      weaponDamage: 1, fireRate: 1, maxHealth: 1, movementSpeed: 1, shieldCapacity: 1, specialCooldown: 1
    }
  }));

  return res.json({ success: true, owned, selectedShipId: profile.selectedShipId });
};

export const selectShip = (req, res) => {
  const { shipId } = req.params;
  const profile = store.getProfile(req.user.id);
  if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

  if (!profile.unlockedShips.includes(shipId)) {
    return res.status(400).json({ success: false, message: 'Cannot select a locked ship' });
  }

  profile.selectedShipId = shipId;
  store.updateProfile(req.user.id, profile);
  store.recordEvent('ship_selected', { userId: req.user.id, shipId });

  return res.json({ success: true, selectedShipId: shipId });
};

export const upgradeShip = (req, res) => {
  try {
    const { shipId } = req.params;
    const { attributeName } = req.body;
    if (!attributeName) return res.status(400).json({ success: false, message: 'attributeName is required' });

    const result = WalletService.upgradeShipAttribute(req.user.id, shipId, attributeName);
    return res.json({ success: true, ...result });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const unlockShip = (req, res) => {
  try {
    const { shipId } = req.params;
    const result = WalletService.unlockShip(req.user.id, shipId);
    return res.json({ success: true, ...result });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

