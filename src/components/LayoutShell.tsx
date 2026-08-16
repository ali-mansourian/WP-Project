import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useMockState } from '../context/MockStateContext';
import { MusicPlayer } from './MusicPlayer';
import { RoleSwitcher } from './RoleSwitcher';
import { 
  Menu, 
  X, 
  Home, 
  Search, 
  Compass, 
  User, 
  Settings, 
  ListMusic, 
  Bell, 
  Info, 
  Sparkles, 
  Headset, 
  ShieldAlert, 
  Music,
  LogOut,
  Calendar,
  Layers
} from 'lucide-react';
import { Song, Notification } from '../types';
import './Layout.css';

interface LayoutShellProps {
  currentTrack: Song | null;
  setCurrentTrack: (song: Song | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  playNextTrack: () => void;
  playPrevTrack: () => void;
  onLyricsClick: () => void;
  onAddToPlaylistClick: (songId: string | number) => void;
  unreadNotifCount: number;
  relevantNotifs: Notification[];
  markNotificationRead: (id: string | number) => void;
  clearAllNotifications: () => void;
}

export const LayoutShell: React.FC<LayoutShellProps> = ({
  currentTrack,
  setCurrentTrack,
  isPlaying,
  setIsPlaying,
  playNextTrack,
  playPrevTrack,
  onLyricsClick,
  onAddToPlaylistClick,
  unreadNotifCount,
  relevantNotifs,
  markNotificationRead,
  clearAllNotifications
}) => {
  const { currentUser, logout } = useMockState();
  const navigate = useNavigate();

  // Mobile drawer state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  // Notification dropdown state
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  if (!currentUser) return null;

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  const getNotifStyle = (type: string) => {
    if (type === 'warning') return 'bg-yellow-950/20 text-yellow-400 border-yellow-900/40';
    if (type === 'success') return 'bg-emerald-950/20 text-emerald-400 border-emerald-900/40';
    if (type === 'ticket') return 'bg-sky-950/20 text-sky-400 border-sky-900/40';
    return 'bg-zinc-900 text-zinc-300 border-zinc-800';
  };

  return (
    <div className="layout-shell-container">
      
      {/* Mobile Drawer Backdrop */}
      <div 
        className={`mobile-sidebar-overlay ${mobileSidebarOpen ? 'open' : ''}`}
        onClick={() => setMobileSidebarOpen(false)}
      />

      {/* 1. Left Sidebar Navigation Panel */}
      <aside className={`layout-sidebar ${mobileSidebarOpen ? 'open' : ''}`}>
        
        {/* Brand Header */}
        <div className="sidebar-logo-section">
          <div className="sidebar-logo-icon">
            <Music className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <div>
            <span className="sidebar-logo-text">Spotify</span>
            <span className="sidebar-brand-sub">RESPONSIVE STAGE</span>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <div className="sidebar-nav-container">
          
          {/* Main Explorations */}
          <div className="sidebar-nav-section">
            <span className="sidebar-section-title">Menu</span>
            <NavLink 
              to="/dashboard" 
              onClick={() => setMobileSidebarOpen(false)}
              className={({ isActive }) => `sidebar-menu-item ${isActive ? 'active' : ''}`}
            >
              <Home className="w-4 h-4" />
              <span>Home Dashboard</span>
            </NavLink>
            <NavLink 
              to="/search" 
              onClick={() => setMobileSidebarOpen(false)}
              className={({ isActive }) => `sidebar-menu-item ${isActive ? 'active' : ''}`}
            >
              <Search className="w-4 h-4" />
              <span>Discovery Engine</span>
            </NavLink>
            <NavLink 
              to="/albums" 
              onClick={() => setMobileSidebarOpen(false)}
              className={({ isActive }) => `sidebar-menu-item ${isActive ? 'active' : ''}`}
            >
              <Compass className="w-4 h-4" />
              <span>Albums & Singles</span>
            </NavLink>
            <NavLink 
              to="/playlists" 
              onClick={() => setMobileSidebarOpen(false)}
              className={({ isActive }) => `sidebar-menu-item ${isActive ? 'active' : ''}`}
            >
              <ListMusic className="w-4 h-4" />
              <span>Playlists</span>
            </NavLink>
          </div>

          {/* User Workspace & Account */}
          <div className="sidebar-nav-section">
            <span className="sidebar-section-title">Profile Hub</span>
            <NavLink 
              to="/profile" 
              onClick={() => setMobileSidebarOpen(false)}
              className={({ isActive }) => `sidebar-menu-item ${isActive ? 'active' : ''}`}
            >
              <User className="w-4 h-4" />
              <span>User Profile</span>
            </NavLink>
            <NavLink 
              to="/settings" 
              onClick={() => setMobileSidebarOpen(false)}
              className={({ isActive }) => `sidebar-menu-item ${isActive ? 'active' : ''}`}
            >
              <Settings className="w-4 h-4" />
              <span>App Settings</span>
            </NavLink>
            <NavLink 
              to="/notifications" 
              onClick={() => setMobileSidebarOpen(false)}
              className={({ isActive }) => `sidebar-menu-item ${isActive ? 'active' : ''}`}
            >
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </NavLink>
          </div>

          {/* Role switcher workspaces */}
          <div className="sidebar-nav-section">
            <span className="sidebar-section-title">Workspace Hub</span>
            
            {currentUser.role === 'listener' && (
              <NavLink 
                to="/support-center" 
                onClick={() => setMobileSidebarOpen(false)}
                className={({ isActive }) => `sidebar-menu-item ${isActive ? 'active' : ''}`}
              >
                <Headset className="w-4 h-4 text-indigo-400" />
                <span className="text-zinc-200">Support & Apply</span>
              </NavLink>
            )}

            {currentUser.role === 'artist' && (
              <NavLink 
                to="/artist-dashboard" 
                onClick={() => setMobileSidebarOpen(false)}
                className={({ isActive }) => `sidebar-menu-item ${isActive ? 'active' : ''}`}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-amber-300">Artist Studio</span>
              </NavLink>
            )}

            {currentUser.role === 'support' && (
              <NavLink 
                to="/support-agent-dashboard" 
                onClick={() => setMobileSidebarOpen(false)}
                className={({ isActive }) => `sidebar-menu-item ${isActive ? 'active' : ''}`}
              >
                <Headset className="w-4 h-4 text-sky-400" />
                <span className="text-sky-300">Support Queue</span>
              </NavLink>
            )}

            {currentUser.role === 'admin' && (
              <NavLink 
                to="/admin-dashboard" 
                onClick={() => setMobileSidebarOpen(false)}
                className={({ isActive }) => `sidebar-menu-item ${isActive ? 'active' : ''}`}
              >
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span className="text-rose-300">Admin Control</span>
              </NavLink>
            )}
          </div>

          {/* Logout Trigger */}
          <div className="sidebar-nav-section mt-auto pt-4 border-t border-zinc-900">
            <button 
              onClick={handleLogoutClick}
              className="sidebar-menu-item text-rose-400 hover:bg-rose-950/20 w-full"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Log Out</span>
            </button>
          </div>

        </div>
      </aside>

      {/* 2. Top Header Panel */}
      <header className="layout-header">
        
        <div className="header-left-group">
          {/* Mobile Hamburguer Toggle */}
          <button 
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="mobile-nav-toggle-btn"
            title="Toggle Sidebar Menu"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Sandbox Info Badge */}
          <div className="hidden md:flex items-center gap-2 bg-zinc-900/60 border border-zinc-800 rounded-full px-3 py-1 text-[10px] font-mono text-zinc-500">
            <Info className="w-3.5 h-3.5 text-emerald-500" />
            <span>Responsive Grid Active • CSS Media Queries Validated</span>
          </div>
        </div>

        <div className="header-right-group">
          
          {/* Notifications Bell Tray */}
          <div className="relative">
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white flex items-center justify-center transition relative cursor-pointer"
              title="Notifications Feed"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-[9px] text-black font-bold flex items-center justify-center">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Card */}
            {notifDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifDropdownOpen(false)} />
                <div className="absolute right-0 mt-2.5 w-80 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-1.5 border-b border-zinc-900 flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
                      Notifications Center
                    </span>
                    {unreadNotifCount > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-[9px] text-emerald-400 hover:underline font-mono cursor-pointer"
                      >
                        Clear unread
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                    {relevantNotifs.length === 0 ? (
                      <div className="p-8 text-center text-zinc-500 font-mono text-[10px]">
                        No notifications.
                      </div>
                    ) : (
                      relevantNotifs.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationRead(n.id);
                          }}
                          className={`p-2.5 rounded-lg border text-left transition flex flex-col gap-1 cursor-pointer relative ${
                            n.read 
                              ? 'bg-zinc-900/10 border-zinc-900/40 text-zinc-500' 
                              : `bg-zinc-900/80 hover:bg-zinc-900 text-zinc-200 cursor-pointer ${getNotifStyle(n.type)}`
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold truncate pr-2">{n.title}</span>
                            {!n.read && <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0" />}
                          </div>
                          <p className="text-[10px] leading-relaxed text-zinc-400">{n.message}</p>
                          <span className="text-[8px] text-zinc-600 font-mono mt-0.5 self-end">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="border-t border-zinc-900 pt-2 mt-2 text-center">
                    <button
                      onClick={() => {
                        setNotifDropdownOpen(false);
                        navigate('/notifications');
                      }}
                      className="w-full text-center py-1.5 text-[10px] text-zinc-400 hover:text-white hover:bg-zinc-900 rounded font-bold uppercase tracking-wider transition cursor-pointer"
                    >
                      View Detailed Center
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Display Badge & Avatar Placeholder */}
          <div className="header-user-badge">
            <img 
              src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80"} 
              alt={currentUser.name} 
              className="header-profile-avatar"
              referrerPolicy="no-referrer"
            />
            <span className="header-profile-name">{currentUser.name}</span>
          </div>

          {/* Identity switcher dropdown */}
          <RoleSwitcher />

        </div>
      </header>

      {/* 3. Main Content Area */}
      <main className="layout-main-content">
        <div className="view-content-wrapper">
          {/* Main content via standard react-router-dom Outlet */}
          <Outlet context={{ currentTrack, setCurrentTrack, isPlaying, setIsPlaying, onLyricsClick, onAddToPlaylistClick }} />
        </div>
      </main>

      {/* 4. Sticky Bottom Player Panel */}
      <footer className="layout-sticky-player">
        <MusicPlayer
          currentTrack={currentTrack}
          setCurrentTrack={setCurrentTrack}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          playNextTrack={playNextTrack}
          playPrevTrack={playPrevTrack}
          onLyricsClick={onLyricsClick}
          onAddToPlaylistClick={onAddToPlaylistClick}
        />
      </footer>

    </div>
  );
};
