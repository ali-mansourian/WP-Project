
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';
import { useMockState } from '../context/MockStateContext';
import { useNavigate } from 'react-router-dom';

import { 
  Settings, 
  Volume2, 
  Shield, 
  User, 
  ToggleLeft, 
  ToggleRight, 
  Trash2, 
  AlertTriangle, 
  Globe, 
  Bell, 
  Check, 
  VolumeX, 
  X,
  Sparkles,
  Crown
} from 'lucide-react';
import './ProfileSettings.css';

export const SettingsView: React.FC = () => {
  const { currentUser, deleteAccount } = useMockState();
  const navigate = useNavigate();

  // Settings states
  const [streamQuality, setStreamQuality] = useState('hi-fi');
  const [appVolume, setAppVolume] = useState(80);
  const [language, setLanguage] = useState('en-US');
  
  // Notification toggle states
  const [notifReleases, setNotifReleases] = useState(true);
  const [notifPlaylists, setNotifPlaylists] = useState(true);
  const [notifSystemAlerts, setNotifSystemAlerts] = useState(false);

  // Miscellaneous options
  const [hardwareAcceleration, setHardwareAcceleration] = useState(true);
  const [autoLyricsScroll, setAutoLyricsScroll] = useState(true);

  // UI States
  const [saveSettingsSuccess, setSaveSettingsSuccess] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isLoadingPrefs, setIsLoadingPrefs] = useState(true);

    // Load saved preferences from backend on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const prefs = await apiFetch('/api/auth/me/preferences/');
        if (prefs) {
          setStreamQuality(prefs.stream_quality || 'standard');
          setAppVolume(prefs.app_volume ?? 80);
          setLanguage(prefs.language || 'en-US');
          setNotifReleases(prefs.notif_releases ?? true);
          setNotifPlaylists(prefs.notif_playlists ?? true);
          setNotifSystemAlerts(prefs.notif_system ?? false);
          setHardwareAcceleration(prefs.hardware_acceleration ?? true);
          setAutoLyricsScroll(prefs.auto_lyrics_scroll ?? true);
        }
      } catch (err) {
        console.warn('Could not load preferences:', err);
      } finally {
        setIsLoadingPrefs(false);
      }
    };
    loadPreferences();
  }, []);

  if (!currentUser) return null;

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await apiFetch('/api/auth/me/preferences/', {
        method: 'PATCH',
        body: JSON.stringify({
          stream_quality: streamQuality,
          app_volume: appVolume,
          language: language,
          notif_releases: notifReleases,
          notif_playlists: notifPlaylists,
          notif_system: notifSystemAlerts,
          hardware_acceleration: hardwareAcceleration,
          auto_lyrics_scroll: autoLyricsScroll,
        }),
      });
      
      setSaveSettingsSuccess('Your preferences have been saved and synced to your account!');
      setTimeout(() => setSaveSettingsSuccess(''), 3000);
    } catch (err: any) {
      setSaveSettingsSuccess('Failed to save preferences. Please try again.');
      setTimeout(() => setSaveSettingsSuccess(''), 3000);
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmationText.toLowerCase() !== 'delete') {
      setDeleteError("Please type 'DELETE' in uppercase to confirm account closure.");
      return;
    }

    const result = await deleteAccount();
    
    if (result.success) {
      setIsDeleteModalOpen(false);
      navigate('/login');
    } else {
      setDeleteError(result.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Title Header */}
      <div className="border-b border-zinc-900 pb-5">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-emerald-400" />
          <span>App Preferences & Settings</span>
        </h1>
        <p className="text-xs text-zinc-400 font-medium mt-1">Configure audio fidelities, device sliders, languages, and security.</p>
      </div>

      {saveSettingsSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 text-xs font-semibold animate-bounce">
          {saveSettingsSuccess}
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Playback & Volume preferences (7 columns) */}
        <div className="lg:col-span-7 space-y-6 bg-[#121214] border border-zinc-800/80 p-6 rounded-2xl shadow-xl">
          
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-4">
            <Volume2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Audio & Volume</h2>
          </div>

          <div className="space-y-5">
            
            {/* App Volume Input Slider */}
            <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-900 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-zinc-200">Main Playback Volume</p>
                  <p className="text-[9px] text-zinc-500 font-medium">Controls client-side synthesizer master volume gain</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded">
                  {appVolume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{appVolume}%</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <VolumeX className="w-4 h-4 text-zinc-500 shrink-0" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={appVolume}
                  onChange={(e) => setAppVolume(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                />
                <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
            </div>

            {/* Language Selector Dropdown */}
            <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-900 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Globe className="w-4 h-4 text-indigo-400" />
                <p className="text-xs font-bold text-zinc-200">System Language Localization</p>
              </div>
              <p className="text-[9px] text-zinc-500 font-medium">Translates system-wide dashboard views and workspace tabs</p>
              
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="custom-select w-full mt-1.5"
              >
                <option value="en-US">English (United States)</option>
                <option value="es-ES">Español (España)</option>
                <option value="fr-FR">Français (France)</option>
                <option value="de-DE">Deutsch (Deutschland)</option>
                <option value="ja-JP">日本語 (日本)</option>
                <option value="ko-KR">한국어 (대한민국)</option>
              </select>
            </div>

            {/* Audio Stream Quality */}
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-400 font-mono uppercase font-bold tracking-wider block">Streaming Audio Quality</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setStreamQuality('standard')}
                  className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                    streamQuality === 'standard'
                      ? 'bg-zinc-850 border-emerald-500/40 text-emerald-400 font-bold'
                      : 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-800 text-zinc-400 text-xs'
                  }`}
                >
                  <p className="text-xs">Standard</p>
                  <span className="text-[8px] text-zinc-500 font-mono">128kbps (Free)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (currentUser.tier === 'free') {
                      alert('Upgrade to Silver or Gold tier to access high-fidelity streams!');
                      return;
                    }
                    setStreamQuality('hi-fi');
                  }}
                  className={`p-3 rounded-xl border text-center transition cursor-pointer relative ${
                    streamQuality === 'hi-fi'
                      ? 'bg-zinc-850 border-emerald-500/40 text-emerald-400 font-bold'
                      : 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-800 text-zinc-400 text-xs'
                  }`}
                >
                  <p className="text-xs">High Fidelity</p>
                  <span className="text-[8px] text-zinc-500 font-mono">320kbps (Silver+)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (currentUser.tier !== 'gold') {
                      alert('Upgrade to Gold tier to unlock 3D spatial lossless recording feeds!');
                      return;
                    }
                    setStreamQuality('spatial');
                  }}
                  className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                    streamQuality === 'spatial'
                      ? 'bg-[#1c1912] border-amber-500/40 text-amber-400 font-bold'
                      : 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-800 text-zinc-400 text-xs'
                  }`}
                >
                  <p className="text-xs">Lossless Spatial</p>
                  <span className="text-[8px] text-zinc-500 font-mono">96kHz FLAC (Gold)</span>
                </button>
              </div>
            </div>

            {/* Hardware acc */}
            <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-xl border border-zinc-900">
              <div>
                <p className="text-xs font-bold text-zinc-200">Hardware Sound Acceleration</p>
                <p className="text-[9px] text-zinc-500 font-medium">Enable web audio synthesizer native acceleration</p>
              </div>
              <button
                type="button"
                onClick={() => setHardwareAcceleration(!hardwareAcceleration)}
                className="text-zinc-400 hover:text-white transition cursor-pointer"
              >
                {hardwareAcceleration ? (
                  <ToggleRight className="w-10 h-10 text-emerald-400" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-zinc-600" />
                )}
              </button>
            </div>

            {/* Auto scroll lyrics */}
            <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-xl border border-zinc-900">
              <div>
                <p className="text-xs font-bold text-zinc-200">Auto Scroll Live Lyrics</p>
                <p className="text-[9px] text-zinc-500 font-medium">Scroll down lines dynamically in step with track timings</p>
              </div>
              <button
                type="button"
                onClick={() => setAutoLyricsScroll(!autoLyricsScroll)}
                className="text-zinc-400 hover:text-white transition cursor-pointer"
              >
                {autoLyricsScroll ? (
                  <ToggleRight className="w-10 h-10 text-emerald-400" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-zinc-600" />
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Right column: Notification toggles & Security deletion (5 columns) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Notification toggles panel */}
          <div className="bg-[#121214] border border-zinc-800/80 p-6 rounded-2xl shadow-xl space-y-5">
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-4">
              <Bell className="w-5 h-5 text-indigo-400" />
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Alert Configurations</h2>
            </div>

            <div className="space-y-4">
              {/* Option 1: Releases */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-zinc-300">New Song Alerts</p>
                  <p className="text-[9px] text-zinc-500">Alert me when followed artists release tracks</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifReleases(!notifReleases)}
                  className="text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  {notifReleases ? (
                    <ToggleRight className="w-10 h-10 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-zinc-600" />
                  )}
                </button>
              </div>

              {/* Option 2: Playlists */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-zinc-300">Playlist Recommendations</p>
                  <p className="text-[9px] text-zinc-500">Weekly suggestions from matching curators</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifPlaylists(!notifPlaylists)}
                  className="text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  {notifPlaylists ? (
                    <ToggleRight className="w-10 h-10 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-zinc-600" />
                  )}
                </button>
              </div>

              {/* Option 3: System notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-zinc-300">Telemetry Reports</p>
                  <p className="text-[9px] text-zinc-500">Enable system background alerts & stats</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifSystemAlerts(!notifSystemAlerts)}
                  className="text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  {notifSystemAlerts ? (
                    <ToggleRight className="w-10 h-10 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-zinc-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Subscription Tier Info Card */}
          <div className="bg-[#121214] border border-zinc-800/80 p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Subscription Tier</h2>
              </div>
              <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded border ${
                currentUser.tier === 'gold' 
                  ? 'bg-amber-950/40 text-amber-400 border-amber-900/60' 
                  : currentUser.tier === 'silver'
                  ? 'bg-indigo-950/40 text-indigo-400 border-indigo-900/60'
                  : 'bg-zinc-900/40 text-zinc-400 border-zinc-800'
              }`}>
                {currentUser.tier} Plan
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] text-zinc-400 leading-relaxed font-semibold">
                Your current active subscription is the <strong className="text-white capitalize">{currentUser.tier} Tier</strong>.
              </p>
              
              {currentUser.tier !== 'gold' ? (
                <div className="space-y-2 pt-1">
                  <p className="text-[10px] text-zinc-500 leading-normal">
                    You are missing out on Lossless Spatial Audio streams, unlimited custom playlists, and live creator telemetry dashboards!
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black text-xs font-black rounded-xl transition cursor-pointer shadow-lg shadow-amber-500/10 flex items-center justify-center gap-1.5 uppercase font-mono"
                  >
                    <Sparkles className="w-4 h-4 fill-black/25 text-black" />
                    <span>Upgrade to Gold Tier</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-amber-950/10 border border-amber-900/20 rounded-xl text-[10px] text-amber-400/90 leading-relaxed font-semibold flex items-start gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 text-amber-400 animate-pulse mt-0.5" />
                  <span>
                    You have unlocked all Premium privileges including Hi-Res lossless playback, spatial sound systems, and full-scale listener metrics.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Core Submit Button */}
            <div className="space-y-2">
            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold rounded-xl transition cursor-pointer shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Apply preferences</span>
            </button>
            {saveSettingsSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-900/40 text-emerald-400 text-[10px] font-semibold text-center animate-in fade-in">
                {saveSettingsSuccess}
            </div>
            )}
          </div>

          {/* Safety Account Deletion Box */}
          <div className="bg-[#121214] border border-red-950/20 p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <h2 className="text-xs font-bold font-mono uppercase tracking-wider">Danger Zone</h2>
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed font-semibold">
              Deleting your account is permanent. This operation clears all your created playlists and removes your user identity records from browser LocalStorage.
            </p>
            <button
              type="button"
              onClick={() => {
                setDeleteConfirmationText('');
                setDeleteError('');
                setIsDeleteModalOpen(true);
              }}
              className="w-full py-2.5 bg-rose-950/20 hover:bg-rose-900/40 border border-rose-900/40 text-rose-400 hover:text-rose-300 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete account...</span>
            </button>
          </div>

        </div>

      </form>

      {/* ==================== DELETE ACCOUNT CONFIRMATION DIALOG ==================== */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content-card border-rose-900/50 p-6 animate-in zoom-in-95">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-rose-400 mb-4 pb-3 border-b border-zinc-900">
              <AlertTriangle className="w-6 h-6 text-rose-500 shrink-0" />
              <div>
                <h3 className="text-base font-bold text-white">Permanently Close Account</h3>
                <p className="text-[9px] text-zinc-500 font-mono uppercase">This action is irreversible</p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-semibold text-zinc-300 leading-relaxed">
              <p>
                You are about to close and delete the account of <strong className="text-white">{currentUser.name}</strong> ({currentUser.email}).
              </p>
              <p className="text-[11px] text-zinc-500 bg-zinc-950 p-3 rounded border border-zinc-900 leading-normal">
                All customized playlist curations, activity stream analytics, and support history records associated with your ID will be cleared.
              </p>

              <div className="input-field-group">
                <label className="text-[9px] text-rose-400 font-mono uppercase block mb-1.5">
                  Type <span className="font-bold underline text-white">DELETE</span> below to confirm
                </label>
                <input
                  type="text"
                  required
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  className="custom-input border-rose-900/20 focus:border-rose-500"
                  placeholder="Type DELETE"
                />
              </div>

              {deleteError && (
                <div className="p-2 bg-rose-950/20 border border-rose-900/30 text-[10px] text-rose-400 rounded">
                  {deleteError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-900 mt-6">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Keep Account
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold rounded-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Wipe Database Records</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
