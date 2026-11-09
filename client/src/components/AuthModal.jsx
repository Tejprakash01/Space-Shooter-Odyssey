// Authentication Modal (PDF Part IX, Section 60)
import React, { useState } from 'react';
import { api } from '../services/api.js';
import { sound } from '../audio/audioManager.js';
import { User, Lock, Mail, Rocket, AlertCircle, Sparkles, X } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    sound.playClick();

    try {
      let res;
      if (isRegister) {
        res = await api.register(username, email, password);
      } else {
        res = await api.login(email, password);
      }
      sound.playPowerUp();
      onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border-2 border-cyan-500/40 rounded-2xl p-6 shadow-2xl shadow-cyan-950 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-cyan-950 border border-cyan-400 flex items-center justify-center mx-auto mb-3 text-cyan-400 shadow-neon-cyan">
            <Rocket className="w-7 h-7 transform -rotate-45" />
          </div>
          <h3 className="font-orbitron font-extrabold text-xl text-white">
            {isRegister ? 'Enlist New Pilot' : 'Pilot Authorization'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-rajdhani">
            Access authoritative flight records & token economy ledger
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <div>
              <label className="block text-[11px] font-orbitron text-slate-300 mb-1">Callsign / Username</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. StarLord99"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 font-rajdhani"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-orbitron text-slate-300 mb-1">Federation Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pilot@odyssey.space"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 font-rajdhani"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-orbitron text-slate-300 mb-1">Security Passcode</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 font-rajdhani"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-xl font-orbitron text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-neon-cyan transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : isRegister ? 'Confirm Enlistment' : 'Authorize Flight'}</span>
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError(null); }}
            className="text-xs text-slate-400 hover:text-cyan-300 font-rajdhani"
          >
            {isRegister ? 'Already have an authorized pilot account? Sign In' : 'Need pilot credentials? Register New Account'}
          </button>
        </div>
      </div>
    </div>
  );
};

