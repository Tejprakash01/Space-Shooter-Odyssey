// Centralized Frontend Configuration Module
export const GAME_NAME = import.meta.env.VITE_GAME_NAME || "SPACE SHOOTER ODYSSEY";

// Normalize API URL to handle various deployment formats seamlessly
function normalizeApiUrl(rawUrl) {
  if (!rawUrl) return "http://localhost:5000/api";
  let url = rawUrl.trim();
  // Strip trailing slashes
  while (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  // Ensure /api suffix
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
}

export const API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL);

// Sync document title dynamically with GAME_NAME on load
if (typeof document !== 'undefined') {
  document.title = GAME_NAME;
}

export const GAME_VERSION = "1.0.0";
export const AUTHOR = "Development Team";
export const REWARD_PLATFORM = "Stellar Rewards";
