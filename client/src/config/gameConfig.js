// Centralized Frontend Configuration Module (PDF Part I, Section 4)
export const GAME_NAME = import.meta.env.VITE_GAME_NAME || "SPACE SHOOTER ODYSSEY";
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Sync document title dynamically with GAME_NAME on load
if (typeof document !== 'undefined') {
  document.title = GAME_NAME;
}

export const GAME_VERSION = "1.0.0";
export const AUTHOR = "Full-Stack Development Team";
export const REWARD_PLATFORM = "VELoop Rewards";

