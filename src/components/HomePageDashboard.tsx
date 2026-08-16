import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useMockState } from '../context/MockStateContext';
import { Song, Playlist, Album } from '../types';
import { Play, Pause, Sparkles, Crown, Heart, Clock, Volume2, Compass, ArrowRight, Star } from 'lucide-react';

interface OutletContextType {
  currentTrack: Song | null;
  setCurrentTrack: (song: Song | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  onLyricsClick: () => void;
  onAddToPlaylistClick: (songId: string | number) => void;
}

export const HomePageDashboard: React.FC = () => {
  const { currentUser, songs, albums, playlists, toggleFollowArtist, initiateSubscriptionPurchase } = useMockState();
  const { currentTrack, setCurrentTrack, isPlaying, setIsPlaying, onAddToPlaylistClick } = useOutletContext<OutletContextType>();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const handleTrackPlay = (song: Song) => {
    setCurrentTrack(song);
    setIsPlaying(true);
  };

  const handlePlaylistPlay = (playlist: Playlist) => {
    const playlistSongs = songs.filter(s => playlist.songIds.includes(s.id));
    if (playlistSongs.length > 0) {
      setCurrentTrack(playlistSongs[0]);
      setIsPlaying(true);
    }
  };

  const handleAlbumPlay = (album: Album) => {
    const albumTracks = songs.filter(s => s.albumId === album.id);
    if (albumTracks.length > 0) {
      setCurrentTrack(albumTracks[0]);
      setIsPlaying(true);
    }
  };

  // Sort tracks by streams to get "Top Trending Tracks"
  const trendingTracks = [...songs].sort((a, b) => b.streams - a.streams);

  // Take the user's playlists or first few default playlists for "Recently Played"
    const recentlyPlayedPlaylists = playlists.filter(p => p.userId === currentUser.id).slice(0, 6);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Dynamic Header Banner / Greeting Card */}
      <div className="greeting-banner-card">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-emerald-400 font-mono font-bold tracking-widest uppercase bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/30">
              Live Stream Engine Active
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Good day, {currentUser.name}!
          </h1>
          <p className="text-sm text-zinc-400 max-w-xl">
            You are currently streaming on the <strong className="text-emerald-400 font-bold uppercase">{currentUser.tier}</strong> tier level. Explore your customized listening portal.
          </p>
        </div>
        {currentUser.tier !== 'gold' && (
          <button
            onClick={() => initiateSubscriptionPurchase('gold')}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black text-xs font-extrabold rounded-lg transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <Sparkles className="w-4 h-4 fill-black" />
            <span>Simulate Gold Upgrade</span>
          </button>
        )}
      </div>

      {/* Grid of Recently Played Playlists */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-emerald-400" />
            <span>Recently Played Playlists</span>
          </h2>
          <button 
            onClick={() => navigate('/playlists')}
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-semibold transition"
          >
            <span>See all Playlists</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentlyPlayedPlaylists.map((playlist) => {
            const isThisPlaylistPlaying = songs
              .filter(s => playlist.songIds.includes(s.id))
              .some(s => currentTrack && s.id === currentTrack.id && isPlaying);

            return (
              <div
                key={playlist.id}
                onClick={() => navigate(`/playlists`)}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/30 border border-zinc-900/60 hover:bg-zinc-900/80 transition group cursor-pointer relative"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={playlist.coverUrl}
                    alt={playlist.name}
                    className="w-14 h-14 rounded-lg object-cover shadow-md shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{playlist.name}</p>
                    <p className="text-xs text-zinc-500 truncate font-medium">{playlist.description}</p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isThisPlaylistPlaying) {
                      setIsPlaying(false);
                    } else {
                      handlePlaylistPlay(playlist);
                    }
                  }}
                  className="w-10 h-10 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition duration-200 transform hover:scale-105 cursor-pointer shrink-0"
                  title="Play playlist"
                >
                  {isThisPlaylistPlaying ? (
                    <Pause className="w-4 h-4 fill-black" />
                  ) : (
                    <Play className="w-4 h-4 fill-black ml-0.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scrollable Row of Newly Released Albums */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            <span>Newly Released Albums</span>
          </h2>
          <button 
            onClick={() => navigate('/albums')}
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-semibold transition"
          >
            <span>See all Albums</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="horizontal-scroll-row">
          {albums.map((album) => {
            const albumTracks = songs.filter(s => s.albumId === album.id);
            const isThisAlbumPlaying = albumTracks.some(t => currentTrack && t.id === currentTrack.id && isPlaying);

            return (
              <div
                key={album.id}
                onClick={() => navigate('/albums')}
                className="w-48 shrink-0 p-4 rounded-xl bg-zinc-900/20 border border-zinc-900 hover:bg-zinc-900/50 transition group cursor-pointer flex flex-col justify-between"
              >
                <div className="relative overflow-hidden rounded-lg aspect-square mb-3.5">
                  <img
                    src={album.coverUrl}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isThisAlbumPlaying) {
                        setIsPlaying(false);
                      } else {
                        handleAlbumPlay(album);
                      }
                    }}
                    className="absolute bottom-3 right-3 w-10 h-10 bg-emerald-500 text-black rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition transform translate-y-1 group-hover:translate-y-0 cursor-pointer"
                  >
                    {isThisAlbumPlaying ? (
                      <Pause className="w-5 h-5 fill-black" />
                    ) : (
                      <Play className="w-5 h-5 fill-black ml-0.5" />
                    )}
                  </button>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white truncate">{album.title}</h4>
                  <p className="text-[10px] text-zinc-500 font-semibold truncate mt-0.5">{album.artistName}</p>
                  <span className="text-[9px] text-zinc-600 font-mono mt-1 block">
                    {albumTracks.length} {albumTracks.length === 1 ? 'Track' : 'Tracks'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Trending Tracks and Golden Early Access Module */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Top Trending Tracks */}
        <div className="lg:col-span-7 bg-[#121214] border border-zinc-800/80 p-6 rounded-2xl shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white font-mono uppercase tracking-widest text-zinc-400">
            Top Trending Tracks
          </h2>
          
          <div className="space-y-2">
            {trendingTracks.map((song, idx) => {
              const isThisTrack = currentTrack && song.id === currentTrack.id;
              return (
                <div
                  key={song.id}
                  onClick={() => handleTrackPlay(song)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition group cursor-pointer ${
                    isThisTrack 
                      ? 'bg-emerald-950/20 border border-emerald-900/30 text-white' 
                      : 'bg-zinc-900/20 hover:bg-zinc-900/50'
                  }`}
                >
                  <span className="w-5 text-xs font-mono text-zinc-500 text-center font-bold">
                    {idx + 1}
                  </span>
                  
                  <img
                    src={song.coverUrl}
                    alt={song.title}
                    className="w-10 h-10 rounded-md object-cover border border-zinc-850 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold truncate ${isThisTrack ? 'text-emerald-400' : 'text-zinc-200'}`}>
                      {song.title}
                    </p>
                    <p className="text-[10px] text-zinc-500 truncate font-semibold">
                      {song.artistName} • {song.albumName}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 font-mono text-zinc-500 text-[10px]">
                    <span className="hidden sm:inline-block">
                      {song.streams.toLocaleString()} streams
                    </span>
                    <span>
                      {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToPlaylistClick(song.id);
                      }}
                      className="text-zinc-500 hover:text-white transition p-1 cursor-pointer"
                      title="Add to playlist"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Quick Profile Demographics / Simulated Info Box */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[#121214] border border-zinc-800/80 p-6 rounded-2xl shadow-xl flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-zinc-400 font-mono uppercase tracking-widest">
                Session Identity Status
              </h3>
              
              <div className="space-y-3">
                <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-900">
                  <span className="text-[9px] text-zinc-500 font-mono block mb-1">Active User Profile</span>
                  <p className="text-sm font-bold text-white">{currentUser.name}</p>
                  <p className="text-xs text-zinc-400 mt-1">{currentUser.email}</p>
                </div>

                <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-900">
                  <span className="text-[9px] text-zinc-500 font-mono block mb-1">Listener Demographics</span>
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                    <div>
                      <span className="text-zinc-500 block text-[9px] font-mono">Date of Birth</span>
                      <span className="text-zinc-300">{currentUser.dob || '1998-05-12 (Preloaded)'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[9px] font-mono">Gender</span>
                      <span className="text-zinc-300 capitalize">{currentUser.gender || 'Prefer not to say'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-900 text-[10px] text-zinc-600 font-mono leading-relaxed mt-4">
              Switch roles to the Support Agent or Admin inside the switcher to execute tickets and certify pending creators.
            </div>
          </div>
        </div>

      </div>

      {/* Exclusive "Early Access" Module - Strictly visible ONLY for GOLD tier users */}
      {currentUser.tier === 'gold' && (
        <div className="early-access-gold-module flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative mt-6">
          <div className="flex items-start gap-4 z-10">
            <div className="gold-crown-icon-badge shrink-0">
              <Crown className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="bg-amber-500/20 text-amber-400 text-[9px] font-bold font-mono tracking-widest uppercase px-2 py-0.5 rounded border border-amber-500/30">
                  Early Access to New Tracks
                </span>
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping" />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">Studio Master early listening portal</h3>
              <p className="text-xs text-zinc-400 max-w-xl">
                As an accredited **Gold Level Patron**, you are granted early playback access to our premium high-fidelity 3D spatial studio recording. Enjoy immersive lossless acoustics!
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full md:w-auto shrink-0 z-10">
            <div className="bg-[#241c0e] border border-amber-900/30 p-3 rounded-xl flex items-center gap-3 w-full sm:w-auto">
              <img
                src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&q=80"
                alt="Gold Master Album"
                className="w-10 h-10 rounded object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0 pr-4">
                <p className="text-xs font-bold text-amber-300 truncate">Midnight Drive (Spatial Master)</p>
                <p className="text-[9px] text-zinc-400 truncate">Luna Wave • Lossless 96kHz</p>
              </div>
            </div>

            <button
              onClick={() => {
                const specialMasterTrack: Song = {
                  id: "sng-gold-master",
                  title: "Midnight Drive (High Fidelity Spatial Gold Master)",
                  artistId: "usr-luna",
                  artistName: "Luna Wave",
                  albumId: "alb-retro-wave",
                  albumName: "Neon Highways (Lossless Edition)",
                  duration: 194,
                  audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                  coverUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&q=80",
                  lyrics: "[Ultra Premium Spatial Masters Only]\nCruising down the golden highway at 3 AM...",
                  streams: 125,
                  releaseDate: "2026-07-05",
                  approved: true
                };
                handleTrackPlay(specialMasterTrack);
              }}
              className="w-full sm:w-auto px-5 py-3 bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold rounded-xl transition duration-200 shadow-xl shadow-amber-500/15 flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <Crown className="w-4 h-4 fill-black" />
              <span>Stream Lossless Master</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

// Simple inline plus icon helper
const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
