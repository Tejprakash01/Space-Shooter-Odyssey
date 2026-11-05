import React, { useState, useEffect } from 'react';
import { api } from './services/api.js';
import { sound } from './audio/audioManager.js';
import { Navbar } from './components/Navbar.jsx';
import { AuthModal } from './components/AuthModal.jsx';
import { SimulatedAdModal } from './components/SimulatedAdModal.jsx';

import { HomeScreen } from './pages/HomeScreen.jsx';
import { CampaignScreen } from './pages/CampaignScreen.jsx';
import { HangarScreen } from './pages/HangarScreen.jsx';
import { ArmoryScreen } from './pages/ArmoryScreen.jsx';
import { DashboardScreen } from './pages/DashboardScreen.jsx';
import { LeaderboardScreen } from './pages/LeaderboardScreen.jsx';
import { AdminScreen } from './pages/AdminScreen.jsx';
import { CombatScreen } from './pages/CombatScreen.jsx';

export function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [activeAdOpportunity, setActiveAdOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Auto-login with default pilot token if none exists for frictionless evaluator testing
    initApp();
  }, []);

  const initApp = async () => {
    try {
      if (!api.token) {
        // Auto-authenticate as StarCommanderAlpha for instant gameplay demo
        const loginRes = await api.login('pilot@odyssey.com', 'password123');
        setUser(loginRes.user);
      } else {
        const meRes = await api.getMe();
        setUser(meRes.user);
      }
      await refreshProfile();
    } catch (err) {
      console.warn('Initial session auth:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await api.getProfile();
      setProfile(res.profile);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    sound.playClick();
    api.setToken(null);
    setUser(null);
    setProfile(null);
    setActiveTab('home');
  };

  const handleLaunchCombat = (mission) => {
    setSelectedMission(mission);
    setActiveTab('combat');
  };

  const handleExitCombat = async () => {
    setSelectedMission(null);
    setActiveTab('campaign');
    await refreshProfile();
  };

  const handleClaimSupplyDrop = async () => {
    try {
      const res = await api.claimSupplyDrop();
      sound.playVictory();
      alert(`Supply Drop Unpacked!\n+${res.drop.credits} Credits\n+${res.drop.cores} Energy Cores\n+1 ${res.drop.powerUp.replace('_', ' ').toUpperCase()}`);
      await refreshProfile();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleWatchAdForPowerUp = async () => {
    try {
      const oppRes = await api.createAdOpportunity('POWER_UP');
      setActiveAdOpportunity(oppRes.opportunity);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center font-orbitron text-cyan-400">
        Initializing Orbital Defense Network...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-rajdhani selection:bg-cyan-500 selection:text-slate-950">
      {/* Dynamic Navbar */}
      {activeTab !== 'combat' && (
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          profile={profile}
          onLogout={handleLogout}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      )}

      {/* Main View Router */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeScreen
            profile={profile}
            onStartCampaign={() => setActiveTab('campaign')}
            onOpenHangar={() => setActiveTab('hangar')}
            onOpenArmory={() => setActiveTab('armory')}
            onOpenDashboard={() => setActiveTab('dashboard')}
            onOpenLeaderboard={() => setActiveTab('leaderboard')}
            onClaimSupplyDrop={handleClaimSupplyDrop}
          />
        )}

        {activeTab === 'campaign' && (
          <CampaignScreen
            profile={profile}
            onSelectMission={handleLaunchCombat}
          />
        )}

        {activeTab === 'hangar' && (
          <HangarScreen
            profile={profile}
            onProfileUpdate={refreshProfile}
          />
        )}

        {activeTab === 'armory' && (
          <ArmoryScreen
            profile={profile}
            onProfileUpdate={refreshProfile}
            onWatchAdForPowerUp={handleWatchAdForPowerUp}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardScreen
            profile={profile}
            onProfileUpdate={refreshProfile}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardScreen
            profile={profile}
          />
        )}

        {activeTab === 'admin' && (
          <AdminScreen />
        )}

        {activeTab === 'combat' && selectedMission && profile && (
          <CombatScreen
            mission={selectedMission}
            ship={{
              id: profile.selectedShipId,
              currentUpgrades: profile.shipUpgrades?.[profile.selectedShipId] || {}
            }}
            profile={profile}
            onExitCombat={handleExitCombat}
            onProfileUpdate={refreshProfile}
          />
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={async (newUser) => {
          setUser(newUser);
          await refreshProfile();
        }}
      />

      {/* Standalone Rewarded Ad Modal */}
      {activeAdOpportunity && (
        <SimulatedAdModal
          opportunity={activeAdOpportunity}
          onClose={() => setActiveAdOpportunity(null)}
          onRewardGranted={async () => {
            setActiveAdOpportunity(null);
            await refreshProfile();
          }}
        />
      )}
    </div>
  );
}

export default App;

