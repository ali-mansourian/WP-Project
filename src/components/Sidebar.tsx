import React, { useState } from 'react';
import { useMockState } from '../context/MockStateContext';
import { 
  Home, 
  Search, 
  Library, 
  Plus, 
  Music, 
  Headset, 
  Sparkles, 
  ShieldAlert, 
  HelpCircle,
  X,
  PlusCircle,
  Heart
} from 'lucide-react';
import { Playlist } from '../types';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
  setSelectedPlaylistId: (id: string | number | null) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, setSelectedPlaylistId }) => {
  const { currentUser, playlists, createPlaylist } = useMockState();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!currentUser) return null;

  // Filter playlists created by the current user
  const userPlaylists = playlists.filter(p => p.userId === currentUser.id);

  const handleCreatePlaylistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newPlaylistName.trim()) {
      setErrorMsg('Playlist name is required.');
      return;
    }

    const result = await createPlaylist(newPlaylistName, newPlaylistDesc);
    if (result && result.success) {
      setSuccessMsg(result.message);
      setNewPlaylistName('');
      setNewPlaylistDesc('');
      setTimeout(() => {
        setShowCreateModal(false);
        setSuccessMsg('');
      }, 1000);
    } else {
      setErrorMsg(result ? result.message : 'Failed to create playlist.');
    }
  };

  const selectPlaylist = (playlistId: string | number) => {
    setSelectedPlaylistId(playlistId);
    setView('playlist-detail');
  };

  return (
    <div className="w-64 bg-black flex flex-col h-full text-zinc-300 font-sans select-none border-r border-zinc-900">
      {/* Brand Logo */}
      <div className="p-6 flex items-center gap-2.5">
        <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          <Music className="w-5 h-5 text-black stroke-[2.5]" />
        </div>
        <div className="flex flex-col">
          <span className="text-white text-lg font-bold tracking-tight leading-none mb-0.5">Spotify</span>
          <span className="text-[10px] text-emerald-400 font-mono font-bold tracking-widest uppercase">MOCK CONTEXT</span>
        </div>
      </div>

      {/* Primary Navigation */}
      <div className="px-3 py-2 space-y-1">
        <button
          onClick={() => setView('home')}
          className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
            currentView === 'home' ? 'bg-zinc-900 text-white' : 'hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>
        <button
          onClick={() => setView('search')}
          className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
            currentView === 'search' ? 'bg-zinc-900 text-white' : 'hover:text-white'
          }`}
        >
          <Search className="w-5 h-5" />
          <span>Search</span>
        </button>
      </div>

      {/* Role-Specific Workspaces */}
      <div className="px-3 mt-4">
        <span className="px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
          Workspace Hub
        </span>
        <div className="mt-2 space-y-1">
          {/* Support Ticket center for Listeners */}
          {currentUser.role === 'listener' && (
            <button
              onClick={() => setView('support-center')}
              className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                currentView === 'support-center' ? 'bg-zinc-900 text-white' : 'hover:text-white'
              }`}
            >
              <HelpCircle className="w-5 h-5 text-indigo-400" />
              <div className="flex flex-col text-left">
                <span>Support & Artist Apply</span>
                <span className="text-[9px] text-zinc-500 font-normal leading-none font-mono">Submit tickets & applications</span>
              </div>
            </button>
          )}

          {/* Artist dashboard for Artists */}
          {currentUser.role === 'artist' && (
            <button
              onClick={() => setView('artist-dashboard')}
              className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                currentView === 'artist-dashboard' ? 'bg-zinc-900 text-white border border-amber-900/30' : 'hover:text-white'
              }`}
            >
              <Sparkles className="w-5 h-5 text-amber-400" />
              <div className="flex flex-col text-left">
                <span className="text-amber-300">Artist Studio</span>
                <span className="text-[9px] text-amber-500/80 font-normal leading-none font-mono">Publish & analytics</span>
              </div>
            </button>
          )}

          {/* Support Agent Dashboard */}
          {currentUser.role === 'support' && (
            <button
              onClick={() => setView('support-agent-dashboard')}
              className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                currentView === 'support-agent-dashboard' ? 'bg-zinc-900 text-white border border-sky-900/30' : 'hover:text-white'
              }`}
            >
              <Headset className="w-5 h-5 text-sky-400" />
              <div className="flex flex-col text-left">
                <span className="text-sky-300">Support Queue</span>
                <span className="text-[9px] text-sky-500/80 font-normal leading-none font-mono">Manage open help tickets</span>
              </div>
            </button>
          )}

          {/* Admin Dashboard */}
          {currentUser.role === 'admin' && (
            <button
              onClick={() => setView('admin-dashboard')}
              className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                currentView === 'admin-dashboard' ? 'bg-zinc-900 text-white border border-rose-900/30' : 'hover:text-white'
              }`}
            >
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <div className="flex flex-col text-left">
                <span className="text-rose-300">Admin Control</span>
                <span className="text-[9px] text-rose-500/80 font-normal leading-none font-mono">Finances & artist approval</span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Library and Playlists */}
      <div className="flex-1 flex flex-col mt-4 min-h-0">
        <div className="px-6 py-2 flex items-center justify-between text-zinc-400">
          <div className="flex items-center gap-2.5">
            <Library className="w-5 h-5" />
            <span className="text-sm font-bold">Your Playlists</span>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-zinc-400 hover:text-white hover:bg-zinc-900 p-1 rounded-full transition cursor-pointer"
            title="Create Playlist"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Playlists Scroller */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1.5 scrollbar-thin">
          {userPlaylists.length === 0 ? (
            <div className="px-3 py-6 rounded-lg bg-zinc-900/30 border border-dashed border-zinc-800 text-center">
              <p className="text-xs text-zinc-500 leading-normal">No playlists created.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-2 text-[11px] text-emerald-400 hover:underline font-semibold cursor-pointer"
              >
                Create one now
              </button>
            </div>
          ) : (
            userPlaylists.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => selectPlaylist(playlist.id)}
                className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition cursor-pointer ${
                  currentView === 'playlist-detail' && playlist.id === playlistIdMatching ? 'bg-zinc-900 text-white font-medium' : 'hover:bg-zinc-900/50'
                }`}
              >
                <img
                  src={playlist.coverUrl}
                  alt={playlist.name}
                  className="w-8 h-8 rounded object-cover border border-zinc-800"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{playlist.name}</p>
                  <p className="text-[10px] text-zinc-500 font-mono">
                    {playlist.songIds.length} {playlist.songIds.length === 1 ? 'song' : 'songs'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Footer Branding or Info */}
      <div className="p-4 bg-zinc-950 border-t border-zinc-900 flex flex-col gap-1 text-[10px] text-zinc-600 font-mono">
        <div>Current Session:</div>
        <div className="text-zinc-500 font-semibold uppercase">{currentUser.role} tier: {currentUser.tier}</div>
        <div className="text-emerald-500/80">● State Synchronized</div>
      </div>

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => {
                setShowCreateModal(false);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <PlusCircle className="w-6 h-6 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Create New Playlist</h3>
            </div>

            <form onSubmit={handleCreatePlaylistSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 font-mono uppercase mb-1.5">
                  Playlist Name
                </label>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="e.g. Chill Summer Lo-fi"
                  className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-emerald-500 focus:outline-none rounded-lg p-2.5 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 font-mono uppercase mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  placeholder="Tell us what this mood is about..."
                  className="w-full h-20 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-emerald-500 focus:outline-none rounded-lg p-2.5 text-sm text-white resize-none"
                />
              </div>

              {/* Tier warning placeholder inside form */}
              {currentUser.tier === 'free' && (
                <div className="p-3 rounded-lg bg-yellow-950/20 border border-yellow-900/50 text-[11px] text-yellow-300 leading-normal">
                  <strong>Free Tier Notice:</strong> You can create a max of <strong>2 playlists</strong>, and store a max of <strong>4 songs</strong> in each. Upgrade to Silver or Gold to lift all limitations!
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-900/50 text-xs text-rose-300">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-900/50 text-xs text-emerald-300">
                  {successMsg}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold text-white rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-sm font-bold text-black rounded-lg transition shadow-lg cursor-pointer"
                >
                  Create Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple helper to match the playlist details view
let playlistIdMatching = "";
export function setPlaylistIdMatching(id: string) {
  playlistIdMatching = id;
}
