import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMockState } from '../context/MockStateContext';
import { 
  Sparkles, 
  Crown, 
  User, 
  Calendar, 
  Mail, 
  Check, 
  Star, 
  Edit3, 
  LineChart, 
  Lock, 
  Sliders, 
  Info, 
  TrendingUp, 
  Disc, 
  BarChart2, 
  Users 
} from 'lucide-react';
import { ListenerTier } from '../types';
import './ProfileSettings.css';

export const ProfileView: React.FC = () => {
    const { 
    currentUser, 
    initiateSubscriptionPurchase, 
    updateProfile, 
    playlists, 
    songs, 
    albums,
    toggleFollowArtist
  } = useMockState();

  const [searchParams] = useSearchParams();
  const queryTab = searchParams.get('tab');
  const queryArtistId = searchParams.get('artistId');

  // Component state
  const [activeTab, setActiveTab] = useState<'profile' | 'artists'>(
    (queryTab === 'artists' || queryTab === 'profile') ? queryTab : 'profile'
  );
  const [selectedArtistId, setSelectedArtistId] = useState<string>(
    queryArtistId || 'usr-luna'
  );

  // Sync tab and artistId from URL parameters
  useEffect(() => {
    const tab = searchParams.get('tab');
    const artistId = searchParams.get('artistId');
    if (tab === 'artists' || tab === 'profile') {
      setActiveTab(tab);
    }
    if (artistId) {
      setSelectedArtistId(artistId);
    }
  }, [searchParams]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form states for profile editing
  const [editName, setEditName] = useState('');
  const [editDob, setEditDob] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);

  if (!currentUser) return null;

  const handleUpgrade = async (tier: ListenerTier) => {
    if (tier === 'free') {
      setSuccessMessage('To downgrade to Free, please wait for your current subscription to expire.');
      setTimeout(() => setSuccessMessage(''), 3000);
      return;
    }
    await initiateSubscriptionPurchase(tier as 'silver' | 'gold');
  };

  // Open Edit Modal with current values
  const handleOpenEdit = () => {
    setEditName(currentUser.name);
    setEditDob(currentUser.dob || '1998-05-12');
    setEditGender(currentUser.gender || 'male');
    setEditAvatarUrl(currentUser.avatarUrl);
    setIsEditModalOpen(true);
  };

  // Save profile edits
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(editName, editDob, editGender, editAvatarUrl);
    setIsEditModalOpen(false);
    setSuccessMessage('Profile details updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Presets of avatars for premium users
  const AVATAR_PRESETS = [
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
    "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&q=80",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80",
    "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&q=80"
  ];

  // Simulated week listen metrics for graph
  const weeklyStreams = [
    { day: 'Mon', count: 12, height: '40%' },
    { day: 'Tue', count: 28, height: '85%' },
    { day: 'Wed', count: 19, height: '58%' },
    { day: 'Thu', count: 32, height: '98%' },
    { day: 'Fri', count: 24, height: '72%' },
    { day: 'Sat', count: 15, height: '48%' },
    { day: 'Sun', count: 21, height: '65%' },
  ];

  // Curate metrics
  const userPlaylists = playlists.filter(p => p.userId === currentUser.id);
  const followedCount = currentUser.followedArtists?.length || 0;
  const mockTotalStreams = userPlaylists.reduce((acc, p) => acc + p.songIds.length * 42, 128);

  // Artist static profiles data
  const ARTIST_INFOS = {
    'usr-luna': {
      id: 'usr-luna',
      name: 'Luna Wave',
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
      bio: "Luna Wave is a synthwave producer crafting celestial dreamscapes and nostalgic cyber beats since 2021. Drawing inspiration from 80s arcade culture and retro sci-fi films, she creates high-speed highway soundstages.",
      verified: true
    },
    'usr-synth': {
      id: 'usr-synth',
      name: 'The Synth Project',
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80",
      bio: "The Synth Project is an electronic music collective exploring granular synthesis, modular soundscapes, and digital neo-classical audio environments. They release complex atmospheric frequencies.",
      verified: true
    }
  };

  const getTierBadge = (tier: string) => {
    if (tier === 'gold') {
      return (
        <span className="flex items-center gap-1 bg-amber-950/40 text-amber-400 border border-amber-800/30 text-[9px] font-mono font-bold tracking-widest uppercase px-2.5 py-0.5 rounded shadow-sm shadow-amber-500/10">
          <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span>Gold VIP</span>
        </span>
      );
    }
    if (tier === 'silver') {
      return (
        <span className="flex items-center gap-1 bg-zinc-950/40 text-zinc-300 border border-zinc-800/40 text-[9px] font-mono font-bold tracking-widest uppercase px-2.5 py-0.5 rounded shadow-sm">
          <Sparkles className="w-3 h-3 text-zinc-300" />
          <span>Silver Member</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 bg-zinc-950/60 text-zinc-500 border border-zinc-900 text-[9px] font-mono font-bold tracking-widest uppercase px-2.5 py-0.5 rounded">
        <User className="w-3 h-3" />
        <span>Free Plan</span>
      </span>
    );
  };

  return (
    <div className="space-y-8 profile-settings-container">
      
      {/* Page Title Panel */}
      <div className="border-b border-zinc-900 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <User className="w-6 h-6 text-emerald-400" />
            <span>Profile & Audio Settings</span>
          </h1>
          <p className="text-xs text-zinc-400 font-medium mt-1">Review demographics, simulate tiers, and track listening activity.</p>
        </div>

        {/* Custom Tab Switcher */}
        <div className="tabs-navigation self-start md:self-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          >
            <User className="w-4 h-4" />
            <span>My Listener Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('artists')}
            className={`tab-btn ${activeTab === 'artists' ? 'active' : ''}`}
          >
            <Disc className="w-4 h-4" />
            <span>Artist Profiles Spotlight</span>
          </button>
        </div>
      </div>

      {/* Success banner */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-900/40 text-emerald-400 text-xs font-semibold animate-in fade-in slide-in-from-top-1">
          {successMessage}
        </div>
      )}

      {activeTab === 'profile' ? (
        /* ==================== 1. MY LISTENER PROFILE TAB ==================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Block: Demographics & Avatar (5 columns) */}
          <div className="lg:col-span-5 bg-[#121214] border border-zinc-800/80 p-6 rounded-2xl shadow-xl space-y-6">
            <div className="flex flex-col items-center text-center pb-5 border-b border-zinc-900">
              
              {/* Profile Avatar with Disabled Hover Tooltip for Free Users */}
              <div className="avatar-upload-wrapper mb-4">
                {currentUser.tier === 'free' ? (
                  <div className="avatar-wrapper-free w-20 h-20 rounded-full overflow-hidden relative border border-zinc-800 shadow">
                    <img
                      src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80"}
                      alt={currentUser.name}
                      className="w-full h-full object-cover opacity-60"
                      referrerPolicy="no-referrer"
                    />
                    <div className="avatar-disabled-overlay">
                      <Lock className="w-5 h-5 text-amber-500 fill-amber-500/20" />
                    </div>
                    {/* Hover tooltip */}
                    <div className="tooltip-box">
                      <p className="font-bold text-amber-400 mb-1">Avatar Locked</p>
                      Upgrade to Silver or Gold to unlock custom profile picture uploads!
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={handleOpenEdit}
                    className="w-20 h-20 rounded-full overflow-hidden relative border-2 border-emerald-500/50 hover:border-emerald-400 shadow cursor-pointer group"
                    title="Change Avatar Profile Picture"
                  >
                    <img
                      src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80"}
                      alt={currentUser.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <Edit3 className="w-4 h-4 text-white" />
                    </div>
                  </button>
                )}
              </div>

              <div className="space-y-2 w-full">
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-xl font-extrabold text-white tracking-tight">{currentUser.name}</h2>
                  {currentUser.tier === 'gold' && <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />}
                </div>
                
                {/* Assigned Username */}
                <p className="text-xs text-zinc-400 font-mono text-center">
                  <span className="text-zinc-600">Username:</span> @{currentUser.email.split('@')[0]}
                </p>

                <div className="flex justify-center mt-1">
                  {getTierBadge(currentUser.tier)}
                </div>
                <p className="text-xs text-zinc-500 font-mono mt-1 text-center">{currentUser.email}</p>

                {/* Follower/Following counts */}
                <div className="flex items-center justify-center gap-4 text-xs font-mono text-zinc-400 mt-2.5 bg-zinc-950/40 py-1.5 px-3 rounded-lg border border-zinc-900/60 w-fit mx-auto">
                  <div>
                    <span className="text-white font-bold">{((currentUser.name || '').charCodeAt(0) % 20) + 12}</span> <span className="text-zinc-500">Followers</span>
                  </div>
                  <div className="w-px h-3 bg-zinc-800" />
                  <div>
                    <span className="text-white font-bold">{followedCount}</span> <span className="text-zinc-500">Following</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Demographics Metadata */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-400 font-mono uppercase tracking-wider">Demographic Metadata</h3>
                <button
                  onClick={handleOpenEdit}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Profile</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900">
                  <span className="text-[9px] text-zinc-500 font-mono block mb-1">Date of Birth</span>
                  <p className="text-xs font-bold text-zinc-200">{currentUser.dob || '1998-05-12'}</p>
                </div>

                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900">
                  <span className="text-[9px] text-zinc-500 font-mono block mb-1">Gender Identity</span>
                  <p className="text-xs font-bold text-zinc-200 capitalize">{currentUser.gender || 'Not specified'}</p>
                </div>

                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900">
                  <span className="text-[9px] text-zinc-500 font-mono block mb-1">Member Since</span>
                  <p className="text-xs font-bold text-zinc-200">{currentUser.joinedDate || '2025-06-01'}</p>
                </div>

                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900">
                  <span className="text-[9px] text-zinc-500 font-mono block mb-1">User Identifier</span>
                  <p className="text-xs font-mono font-bold text-zinc-500 truncate" title={String(currentUser.id)}>{currentUser.id}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-900 text-[10px] text-zinc-600 leading-relaxed font-mono">
              <strong>Interactive Notice:</strong> You can edit Display Name, Date of Birth, and Gender by clicking "Edit Profile" to test local storage synchronization.
            </div>
          </div>

          {/* Right Block: Simulated Metrics & Stream Graph (7 columns) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Personal Metrics Grid */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-500 font-mono uppercase tracking-wider">Your Platform Metrics</h3>
              <div className="metrics-grid">
                <div className="metric-card">
                  <span className="metric-label">Playlists Curated</span>
                  <p className="metric-value">{userPlaylists.length}</p>
                </div>
                <div className="metric-card">
                  <span className="metric-label">Artists Followed</span>
                  <p className="metric-value">{followedCount}</p>
                </div>
                <div className="metric-card">
                  <span className="metric-label">Est. Song Streams</span>
                  <p className="metric-value">{mockTotalStreams}</p>
                </div>
              </div>
            </div>

            {/* Weekly Listen Bar Chart (Simulated Stream Graph) */}
            <div className="stream-graph-container">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LineChart className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-zinc-200">Weekly Listening Analytics</span>
                </div>
                <span className="text-[9px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded font-mono font-bold">
                  +14% VS LAST WEEK
                </span>
              </div>
              
              {/* Graphic Bar Heights */}
              <div className="graph-bars-wrapper">
                {weeklyStreams.map((bar) => (
                  <div key={bar.day} className="graph-bar-col">
                    <span className="text-[8px] text-zinc-500 font-mono">{bar.count}s</span>
                    <div className="graph-bar-track">
                      <div 
                        className="graph-bar-fill" 
                        style={{ height: bar.height }}
                      />
                    </div>
                    <span className="graph-label">{bar.day}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-zinc-500 leading-normal font-medium">
                Simulated streams monitor your audio loops. Listening peak occurred on <strong>Thursday</strong> with 32 streamed tracks.
              </p>
            </div>

            {/* Subscription Tiers Simulation */}
            <div className="space-y-3">
              <div className="border-t border-zinc-900 pt-5">
                <h3 className="text-xs font-bold text-zinc-500 font-mono uppercase tracking-wider mb-2">Simulate Listener Upgrade</h3>
                <p className="text-xs text-zinc-400 mb-4">Toggle between plans to check limits on playlists (Free: 2, Silver: 5, Gold: Unlimited) and lock overlays.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Free plan */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                  currentUser.tier === 'free' ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-950/20 border-zinc-900/60'
                }`}>
                  <div>
                    <span className="text-[10px] text-zinc-500 font-mono uppercase block">Free Tier</span>
                    <span className="text-lg font-black text-white">$0.00</span>
                  </div>
                  <button
                    disabled={currentUser.tier === 'free'}
                    onClick={() => handleUpgrade('free')}
                    className="mt-4 w-full py-1.5 rounded bg-zinc-800 hover:bg-zinc-750 text-[10px] font-bold uppercase transition disabled:text-zinc-600 disabled:bg-zinc-900 cursor-pointer"
                  >
                    {currentUser.tier === 'free' ? 'Plan Active' : 'Select Free'}
                  </button>
                </div>

                {/* Silver plan */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                  currentUser.tier === 'silver' ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-950/20 border-zinc-900/60'
                }`}>
                  <div>
                    <span className="text-[10px] text-zinc-500 font-mono uppercase block">Silver Plan</span>
                    <span className="text-lg font-black text-white">$4.99</span>
                  </div>
                  <button
                    disabled={currentUser.tier === 'silver'}
                    onClick={() => handleUpgrade('silver')}
                    className="mt-4 w-full py-1.5 rounded bg-zinc-800 hover:bg-zinc-750 text-[10px] font-bold uppercase transition disabled:text-zinc-600 disabled:bg-zinc-900 cursor-pointer"
                  >
                    {currentUser.tier === 'silver' ? 'Plan Active' : 'Select Silver'}
                  </button>
                </div>

                {/* Gold plan */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                  currentUser.tier === 'gold' ? 'bg-amber-950/20 border-amber-900/40' : 'bg-zinc-950/20 border-zinc-900/60'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-amber-500 font-mono uppercase block">Gold Plan</span>
                      <span className="text-lg font-black text-amber-400">$9.99</span>
                    </div>
                    <Crown className="w-4 h-4 text-amber-500 fill-amber-500/15" />
                  </div>
                  <button
                    disabled={currentUser.tier === 'gold'}
                    onClick={() => handleUpgrade('gold')}
                    className="mt-4 w-full py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-extrabold uppercase transition disabled:text-zinc-600 disabled:bg-zinc-900 cursor-pointer"
                  >
                    {currentUser.tier === 'gold' ? 'Plan Active' : 'Select Gold'}
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      ) : (
        /* ==================== 2. ARTIST PROFILE LIGHTBOX TAB ==================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Block: Artist Switcher & Biography (5 columns) */}
          <div className="lg:col-span-5 bg-[#121214] border border-zinc-800/80 p-6 rounded-2xl shadow-xl space-y-6">
            <div className="space-y-3">
              <label className="custom-label">Select Artist to View</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(ARTIST_INFOS).map((art) => (
                  <button
                    key={art.id}
                    onClick={() => setSelectedArtistId(art.id)}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition text-left cursor-pointer ${
                      selectedArtistId === art.id 
                        ? 'bg-zinc-900 border-zinc-700' 
                        : 'bg-zinc-950/20 border-zinc-900/40 hover:bg-zinc-900/40'
                    }`}
                  >
                    <img 
                      src={art.avatarUrl} 
                      alt={art.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-xs font-bold text-white truncate">{art.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Artist Bio Profile */}
            {(() => {
              const artistObj = ARTIST_INFOS[selectedArtistId as keyof typeof ARTIST_INFOS];
              if (!artistObj) return null;
              const isFollowing = currentUser.followedArtists?.includes(artistObj.name);
              return (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center gap-3 pb-4 border-b border-zinc-900">
                    <img
                      src={artistObj.avatarUrl}
                      alt={artistObj.name}
                      className="w-14 h-14 rounded-full object-cover border border-zinc-800"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-white">{artistObj.name}</h3>
                        {artistObj.verified && (
                          <span className="verified-badge bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded-full font-bold flex items-center justify-center select-none" title="Verified Creator Account">✓</span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5 mb-2.5">Verified Artist ID: {artistObj.id}</p>
                      
                      {/* Follow Mechanics Button */}
                      <button
                        onClick={() => toggleFollowArtist(artistObj.name)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer border flex items-center gap-1.5 ${
                          isFollowing
                            ? 'bg-zinc-800/80 border-zinc-700/60 text-zinc-300 hover:bg-zinc-750 hover:text-white'
                            : 'bg-emerald-500 border-emerald-400 text-black font-extrabold hover:bg-emerald-400 hover:scale-[1.02]'
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Following</span>
                          </>
                        ) : (
                          <>
                            <Users className="w-3.5 h-3.5" />
                            <span>Follow</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="custom-label">Artist Biography</span>
                    <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                      {artistObj.bio}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Right Block: Released Tracks & Gold Exclusive Panel (7 columns) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Released singles and albums in system */}
            <div className="space-y-4">
              <div className="border-b border-zinc-900 pb-2">
                <h3 className="text-xs font-bold text-zinc-500 font-mono uppercase tracking-wider">
                  Released Singles & Tracks
                </h3>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                {songs.filter(s => s.artistId === selectedArtistId).length === 0 ? (
                  <div className="p-4 text-center border border-dashed border-zinc-800 rounded-xl text-zinc-500 font-mono text-xs">
                    No released singles found.
                  </div>
                ) : (
                  songs
                    .filter(s => s.artistId === selectedArtistId)
                    .map((s) => (
                      <div 
                        key={s.id}
                        className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={s.coverUrl}
                            alt={s.title}
                            className="w-10 h-10 rounded object-cover"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{s.title}</p>
                            <p className="text-[9px] text-zinc-500 font-mono mt-0.5">
                              {s.albumName}
                              {currentUser.tier === 'gold' && ` • ${s.streams.toLocaleString()} loops`}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {Math.floor(s.duration / 60)}:{(s.duration % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    ))
                )}
              </div>

              {/* Released Albums Section */}
              <div className="border-b border-zinc-900 pb-2 pt-2">
                <h3 className="text-xs font-bold text-zinc-500 font-mono uppercase tracking-wider">
                  Released Albums
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
                {albums.filter(a => a.artistId === selectedArtistId).length === 0 ? (
                  <div className="col-span-2 p-4 text-center border border-dashed border-zinc-800 rounded-xl text-zinc-500 font-mono text-xs">
                    No albums released.
                  </div>
                ) : (
                  albums
                    .filter(a => a.artistId === selectedArtistId)
                    .map((a) => (
                      <div 
                        key={a.id}
                        className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 flex items-center gap-3 min-w-0"
                      >
                        <img
                          src={a.coverUrl}
                          alt={a.title}
                          className="w-10 h-10 rounded object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{a.title}</p>
                          <p className="text-[9px] text-zinc-500 font-mono mt-0.5 truncate">
                            Released: {a.releaseDate}
                          </p>
                          <p className="text-[9px] text-emerald-400 font-mono font-bold">
                            {a.songIds.length} Tracks
                          </p>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* GOLD EXCLUSIVE: Artist listener statistics */}
            {currentUser.tier === 'gold' ? (
              <div className="gold-stats-panel space-y-4 animate-in zoom-in-98 duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-300">Gold Studio Demographics</span>
                  </div>
                  <span className="gold-badge">Unlocked stats</span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-3 bg-black/40 border border-amber-900/10 rounded-xl">
                    <span className="text-[9px] text-zinc-500 font-mono block mb-1">Peak Streaming hours</span>
                    <p className="text-xs font-bold text-white">10 PM — 2 AM EST</p>
                  </div>

                  <div className="p-3 bg-black/40 border border-amber-900/10 rounded-xl">
                    <span className="text-[9px] text-zinc-500 font-mono block mb-1">Demographics Breakdown</span>
                    <p className="text-xs font-bold text-white">58% F • 35% M • 7% O</p>
                  </div>

                  <div className="p-3 bg-black/40 border border-amber-900/10 rounded-xl">
                    <span className="text-[9px] text-zinc-500 font-mono block mb-1">Retention Index</span>
                    <p className="text-xs font-bold text-white">92% Replay Factor</p>
                  </div>

                  <div className="p-3 bg-black/40 border border-amber-900/10 rounded-xl">
                    <span className="text-[9px] text-zinc-500 font-mono block mb-1">Hi-Fi stream Share</span>
                    <p className="text-xs font-bold text-white">88% FLAC Playback</p>
                  </div>
                </div>

                <p className="text-[10px] text-amber-400/80 font-mono leading-relaxed bg-amber-950/20 p-2 rounded border border-amber-900/20">
                  <strong>Gold Advantage:</strong> Live stream telemetry tracks user fidelity layers and listening peaks dynamically across global node endpoints.
                </p>
              </div>
            ) : (
              /* Teaser overlay for Non-Gold Users */
              <div className="p-6 rounded-2xl bg-[#1c1912]/20 border border-amber-900/10 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden">
                <div className="w-10 h-10 rounded-full bg-amber-950/30 border border-amber-900/30 flex items-center justify-center text-amber-400">
                  <Lock className="w-5 h-5 fill-amber-500/10" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h4 className="text-xs font-bold text-white">Listener Analytics Restricted</h4>
                  <p className="text-[10px] text-zinc-500 leading-normal">
                    Detailed age splits, heatmaps, peak engagement indices, and network streaming fidelities are available exclusively to our **Gold Level Patrons**.
                  </p>
                </div>
                <button
                  onClick={() => initiateSubscriptionPurchase('gold')}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-extrabold rounded-lg uppercase shadow-lg shadow-amber-500/10 transition cursor-pointer"
                >
                  Upgrade to Gold to Unlock
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ==================== EDIT PROFILE MODAL DIALOG ==================== */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content-card relative">
            <div className="flex items-center gap-2 mb-4 border-b border-zinc-900 pb-3">
              <Sliders className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-base font-bold text-white">Edit Profile Details</h3>
                <p className="text-[9px] text-zinc-500 font-mono uppercase">Update active demographic flags</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              <div className="input-field-group">
                <label className="custom-label">Display Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="custom-input"
                  placeholder="e.g. Alex Carter"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="input-field-group">
                  <label className="custom-label">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={editDob}
                    onChange={(e) => setEditDob(e.target.value)}
                    className="custom-input"
                  />
                </div>

                <div className="input-field-group">
                  <label className="custom-label">Gender Identity</label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
                    className="custom-select"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Avatar picture chooser - only active for Premium users */}
              {currentUser.tier !== 'free' && (
                <div className="space-y-2 pt-2 border-t border-zinc-900">
                  <label className="custom-label">Select Avatar Preset Picture</label>
                  <div className="grid grid-cols-6 gap-2">
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setEditAvatarUrl(preset)}
                        className={`w-10 h-10 rounded-full overflow-hidden border transition cursor-pointer shrink-0 ${
                          editAvatarUrl === preset ? 'border-emerald-400 scale-105' : 'border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <img src={preset} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                  <div className="input-field-group mt-2">
                    <span className="text-[9px] text-zinc-500 font-mono block">Or enter custom Image URL</span>
                    <input
                      type="url"
                      value={editAvatarUrl}
                      onChange={(e) => setEditAvatarUrl(e.target.value)}
                      className="custom-input py-1.5 text-xs"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-900 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold rounded-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
