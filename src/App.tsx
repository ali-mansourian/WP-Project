import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { MockStateProvider, useMockState } from './context/MockStateContext';
import { Sidebar, setPlaylistIdMatching } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { MusicPlayer } from './components/MusicPlayer';
import { LyricsModal } from './components/LyricsModal';
import { RoleSwitcher } from './components/RoleSwitcher';
import { LoginPage } from './components/LoginPage';
import { ListenerSignupPage } from './components/ListenerSignupPage';
import { ArtistSignupPage } from './components/ArtistSignupPage';
import { LayoutShell } from './components/LayoutShell';
import { HomePageDashboard } from './components/HomePageDashboard';
import { PlaylistsView } from './components/PlaylistsView';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';
import { AlbumsView } from './components/AlbumsView';
import { WorkspacesViewWrapper } from './components/WorkspacesViewWrapper';
import { NotificationsView } from './components/NotificationsView';
import { SearchView } from './components/SearchView';
import { 
  Bell, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  FolderPlus, 
  X, 
  Music, 
  Info,
  ExternalLink,
  Github,
  Sparkles
} from 'lucide-react';
import { Song, Notification } from './types';
import { PaymentVerify } from './components/PaymentVerify';

function PendingArtistScreen() {
  const { currentUser, logout, resetRejectedArtistToListener } = useMockState();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const isRejected = currentUser.status === 'rejected';

  return (
    <div className="flex flex-col h-screen bg-[#09090b] text-zinc-200 font-sans">
      <header className="h-16 bg-[#121214] border-b border-zinc-900 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 ${isRejected ? 'bg-rose-500' : 'bg-amber-500'} rounded-full flex items-center justify-center shadow-lg`}>
            <Music className="text-black w-4.5 h-4.5" />
          </div>
          <div>
            <span className={`text-xs font-bold font-mono ${isRejected ? 'text-rose-500' : 'text-amber-500'} uppercase tracking-widest leading-none block`}>Creator Portal</span>
            <span className="text-sm font-semibold text-white">Application Status</span>
          </div>
        </div>
        <RoleSwitcher />
      </header>

      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="max-w-md w-full bg-[#121214] border border-zinc-800 rounded-2xl p-8 shadow-2xl space-y-6 text-center">
          {isRejected ? (
            <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <X className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Sparkles className="w-8 h-8" />
            </div>
          )}

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">
              {isRejected ? 'Creator Application Declined' : 'Your Creator Profile is Pending Audit'}
            </h2>
            <p className="text-sm text-zinc-400">
              Welcome, <strong className="text-zinc-200">{currentUser.name}</strong> ({currentUser.email}).
              {isRejected 
                ? ' Our administrative team has reviewed and declined your artist profile application.'
                : ' Your audio portfolio and stage identity are currently in the administrator\'s review queue.'
              }
            </p>
          </div>

          {isRejected ? (
            <div className="p-5 rounded-xl bg-rose-950/20 border border-rose-900/50 text-left space-y-3">
              <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider font-mono">Feedback & Reasons:</h3>
              <p className="text-sm text-zinc-300 italic">
                "{(currentUser as any).rejectionReason || 'Portfolio requirements not met or incomplete details.'}"
              </p>
              <p className="text-[11px] text-zinc-500 leading-normal">
                To try again, you can reset your profile back to a standard listener account, then re-submit a fresh application with updated portfolio details from the Support Hub.
              </p>
            </div>
          ) : (
            /* Timeline */
            <div className="space-y-4 text-left bg-zinc-950 p-5 rounded-xl border border-zinc-900">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">✓</div>
                <div>
                  <p className="text-xs font-semibold text-zinc-200">Creator Account Setup</p>
                  <p className="text-[10px] text-zinc-500">Secure credential creation and stage registration completed.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</div>
                <div>
                  <p className="text-xs font-semibold text-zinc-200">Portfolio & Security Audit</p>
                  <p className="text-[10px] text-zinc-400 font-medium">Administrator reviewing your audio uploads for certification status.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</div>
                <div>
                  <p className="text-xs font-semibold text-zinc-600">Verification & Launch</p>
                  <p className="text-[10px] text-zinc-600">Artist catalog listing and full studio analytics release.</p>
                </div>
              </div>
            </div>
          )}

          {!isRejected && (
            <div className="p-4 bg-amber-950/20 border border-amber-900/40 rounded-xl text-xs text-amber-300 leading-relaxed text-left flex gap-3">
              <Info className="w-5 h-5 shrink-0 text-amber-400" />
              <span>
                <strong>Developer Walkthrough Note:</strong> You can quickly simulate approving this application! Switch identity to the <strong className="text-white">Admin (Operations)</strong> via the top-right profile selector to review and approve your application.
              </span>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2">
            {isRejected && (
              <button
                onClick={resetRejectedArtistToListener}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg transition shadow-lg cursor-pointer"
              >
                Reset & Return to Listener Profile
              </button>
            )}
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-lg transition cursor-pointer"
            >
              Log Out Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useMockState();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role === 'artist' && (currentUser.status === 'pending' || currentUser.status === 'rejected')) {
    return <PendingArtistScreen />;
  }
  
  return <>{children}</>;
}

function MainAppContent() {
  const { 
    currentUser, 
    songs, 
    playlists, 
    notifications, 
    markNotificationRead, 
    clearAllNotifications,
    addTrackToPlaylist
  } = useMockState();

  const navigate = useNavigate();

  // Audio Player states
  const [currentTrack, setCurrentTrack] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Modals / Panels visibility
  const [lyricsOpen, setLyricsOpen] = useState<boolean>(false);
  
  // Playlist addition dialog state
  const [playlistModalOpen, setPlaylistModalOpen] = useState<boolean>(false);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [playlistAddSuccess, setPlaylistAddSuccess] = useState<string>('');
  const [playlistAddError, setPlaylistAddError] = useState<string>('');

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
            <Music className="text-black w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-zinc-400 font-mono">Initializing Local Database...</p>
        </div>
      </div>
    );
  }

  // Filter notifications relevant to current user identity or current role or 'all'
  const relevantNotifs = notifications.filter(n => {
    if (n.userId === currentUser.id) return true;
    if (n.role === currentUser.role) return true;
    if (n.role === 'all') return true;
    return false;
  });

  const unreadNotifCount = relevantNotifs.filter(n => !n.read).length;

  // Track skipping logic
  const playNextTrack = () => {
    if (!currentTrack) return;
    const currentIndex = songs.findIndex(s => s.id === currentTrack.id);
    if (currentIndex !== -1 && currentIndex < songs.length - 1) {
      setCurrentTrack(songs[currentIndex + 1]);
      setIsPlaying(true);
    } else {
      // Loop back to first song
      setCurrentTrack(songs[0]);
      setIsPlaying(true);
    }
  };

  const playPrevTrack = () => {
    if (!currentTrack) return;
    const currentIndex = songs.findIndex(s => s.id === currentTrack.id);
    if (currentIndex > 0) {
      setCurrentTrack(songs[currentIndex - 1]);
      setIsPlaying(true);
    } else {
      // Loop to last song
      setCurrentTrack(songs[songs.length - 1]);
      setIsPlaying(true);
    }
  };

  // Trigger add track to playlist overlay
  const handleOpenAddToPlaylist = (songId: string) => {
    setSelectedSongId(songId);
    setPlaylistModalOpen(true);
    setPlaylistAddSuccess('');
    setPlaylistAddError('');
  };

  const handleSelectPlaylistForAdd = (playlistId: string) => {
    if (!selectedSongId) return;
    const result = addTrackToPlaylist(playlistId, selectedSongId);
    if (result.success) {
      setPlaylistAddSuccess(result.message);
      setTimeout(() => {
        setPlaylistModalOpen(false);
        setPlaylistAddSuccess('');
      }, 1200);
    } else {
      setPlaylistAddError(result.message);
    }
  };

  return (
    <div className="w-full h-full text-zinc-300 font-sans relative">
      <Routes>
        <Route element={
          <LayoutShell
            currentTrack={currentTrack}
            setCurrentTrack={setCurrentTrack}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            playNextTrack={playNextTrack}
            playPrevTrack={playPrevTrack}
            onLyricsClick={() => setLyricsOpen(!lyricsOpen)}
            onAddToPlaylistClick={handleOpenAddToPlaylist}
            unreadNotifCount={unreadNotifCount}
            relevantNotifs={relevantNotifs}
            markNotificationRead={markNotificationRead}
            clearAllNotifications={clearAllNotifications}
          />
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<HomePageDashboard />} />
          <Route path="playlists" element={<PlaylistsView />} />
          <Route path="profile" element={<ProfileView />} />
          <Route path="settings" element={<SettingsView />} />
          <Route path="albums" element={<AlbumsView />} />
          <Route path="notifications" element={<NotificationsView />} />
          <Route path="search" element={<SearchView />} />
          <Route path="/payment/verify" element={<PaymentVerify />} />
          
          {/* Workspaces */}
          <Route path="support-center" element={<WorkspacesViewWrapper viewName="support-center" />} />
          <Route path="artist-dashboard" element={<WorkspacesViewWrapper viewName="artist-dashboard" />} />
          <Route path="support-agent-dashboard" element={<WorkspacesViewWrapper viewName="support-agent-dashboard" />} />
          <Route path="admin-dashboard" element={<WorkspacesViewWrapper viewName="admin-dashboard" />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>

      {/* Sliding Overlay: Studio lyrics Drawer */}
      <LyricsModal
        currentTrack={currentTrack}
        isOpen={lyricsOpen}
        onClose={() => setLyricsOpen(false)}
        onUpgradeTrigger={() => setLyricsOpen(false)}
      />

      {/* Overlay Modal: Add Track to Playlist selector dialog */}
      {playlistModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#181818] border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setPlaylistModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-4 border-b border-zinc-900 pb-3">
              <FolderPlus className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="text-base font-bold text-white">Add Track to Playlist</h3>
                <p className="text-[10px] text-zinc-500 font-mono">Select target destination below</p>
              </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
              {playlists.filter(p => p.userId === currentUser.id).length === 0 ? (
                <div className="p-8 text-center border border-dashed border-zinc-800 rounded-xl">
                  <p className="text-xs text-zinc-500">You don't have any playlists yet.</p>
                  <button
                    onClick={() => {
                      setPlaylistModalOpen(false);
                      navigate('/playlists');
                    }}
                    className="mt-2 text-xs text-emerald-400 hover:underline font-semibold cursor-pointer"
                  >
                    Create playlist inside playlists page
                  </button>
                </div>
              ) : (
                playlists
                  .filter(p => p.userId === currentUser.id)
                  .map((pl) => {
                    const hasThisSong = selectedSongId ? pl.songIds.includes(selectedSongId) : false;
                    return (
                      <button
                        key={pl.id}
                        onClick={() => handleSelectPlaylistForAdd(pl.id)}
                        disabled={hasThisSong}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition cursor-pointer ${
                          hasThisSong 
                            ? 'bg-zinc-900/40 border-zinc-900 text-zinc-500 cursor-not-allowed opacity-60' 
                            : 'bg-zinc-900/60 border-zinc-900 hover:border-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={pl.coverUrl}
                            alt={pl.name}
                            className="w-8 h-8 rounded object-cover"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{pl.name}</p>
                            <p className="text-[10px] text-zinc-500 font-mono">{pl.songIds.length} tracks present</p>
                          </div>
                        </div>
                        {hasThisSong ? (
                          <span className="text-[9px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono font-bold uppercase shrink-0">
                            Already Added
                          </span>
                        ) : (
                          <span className="text-[9px] bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold uppercase shrink-0">
                            Add track
                          </span>
                        )}
                      </button>
                    );
                  })
              )}
            </div>

            {playlistAddError && (
              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40 text-xs text-rose-400 mt-4">
                {playlistAddError}
              </div>
            )}

            {playlistAddSuccess && (
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-xs text-emerald-400 mt-4">
                {playlistAddSuccess}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default function App() {
  return (
    <MockStateProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup/listener" element={<ListenerSignupPage />} />
          <Route path="/signup/artist" element={<ArtistSignupPage />} />
          <Route path="/*" element={<ProtectedRoute><MainAppContent /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </MockStateProvider>
  );
}
