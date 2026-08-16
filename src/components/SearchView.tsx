import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext, useNavigate, useSearchParams } from 'react-router-dom';
import { useMockState } from '../context/MockStateContext';
import { Song, Playlist } from '../types';
import { 
  Search, 
  Play, 
  Pause, 
  MoreVertical, 
  Plus, 
  Check, 
  Trash2, 
  FolderPlus, 
  Mic, 
  Sparkles, 
  Crown,
  Info, 
  Volume2,
  Calendar,
  Layers,
  Heading,
  Download
} from 'lucide-react';

interface OutletContextType {
  currentTrack: Song | null;
  setCurrentTrack: (song: Song | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  onLyricsClick: () => void;
  onAddToPlaylistClick: (songId: string | number) => void;
}

export const SearchView: React.FC = () => {
  const { currentUser, songs, playlists, addTrackToPlaylist, removeTrackFromPlaylist } = useMockState();
  const { currentTrack, setCurrentTrack, isPlaying, setIsPlaying, onLyricsClick } = useOutletContext<OutletContextType>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedGenre, setSelectedGenre] = useState('All');

  // Sync search state when route parameters change
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);
  
  // Custom dropdown context menu state
  const [activeMenuSongId, setActiveMenuSongId] = useState<string | number | null>(null);
  
  // Feedback notification toasts state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'warning'>('success');

  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuSongId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  if (!currentUser) return null;

  // Filter user's playlists
  const userPlaylists = playlists.filter(p => p.userId === currentUser.id);

  // Genres collected dynamically or default popular
  const genres = ['All', 'Retro', 'Neon Synth', 'Ambient Chill', 'Acoustic', 'Jazz', 'Pop'];

  // Real-time search filtering
  const filteredSongs = songs.filter(song => {
    const matchesSearch = 
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (song.albumName || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    // Simple mock genre match based on title/album name keywords
    let genreMatch = true;
    if (selectedGenre !== 'All') {
      const g = selectedGenre.toLowerCase();
      const songText = `${song.title} ${song.albumName} ${song.lyrics}`.toLowerCase();
      if (g === 'retro') genreMatch = songText.includes('retro') || songText.includes('synth') || songText.includes('drive');
      else if (g === 'neon synth') genreMatch = songText.includes('neon') || songText.includes('cyber') || songText.includes('synthesizer');
      else if (g === 'ambient chill') genreMatch = songText.includes('ambient') || songText.includes('drift') || songText.includes('chill');
      else if (g === 'acoustic') genreMatch = songText.includes('guitar') || songText.includes('acoustic') || songText.includes('sunset') || songText.includes('woodland');
      else if (g === 'jazz') genreMatch = songText.includes('jazz') || songText.includes('midnight') || songText.includes('sax');
      else if (g === 'pop') genreMatch = songText.includes('pop') || songText.includes('love') || songText.includes('dance');
    }
    
    return matchesSearch && genreMatch && song.approved;
  });

  const showToast = (message: string, type: 'success' | 'warning' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handlePlaylistAdd = async (playlistId: string | number, song: Song) => {
    const result = await addTrackToPlaylist(playlistId, song.id);
    setActiveMenuSongId(null);
    if (result && result.success) {
      showToast(`Added "${song.title}" to playlist successfully!`, 'success');
    } else {
      showToast(result ? result.message : 'Failed to add track.', 'warning');
    }
  };

  const handlePlaylistRemove = async (playlistId: string | number, song: Song) => {
    await removeTrackFromPlaylist(playlistId, song.id);
    setActiveMenuSongId(null);
    showToast(`Removed "${song.title}" from playlist.`, 'success');
  };

  const handlePlaySong = (song: Song) => {
    setCurrentTrack(song);
    setIsPlaying(true);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Search Header Banner */}
      <div className="bg-gradient-to-r from-zinc-900/80 via-zinc-950 to-zinc-900/80 p-6 rounded-2xl border border-zinc-900 shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Search className="w-5 h-5 text-emerald-400" />
            <span>Discovery Engine</span>
          </h1>
          <p className="text-[10px] text-zinc-400 font-mono">
            Real-time filter archive, lyrics playback, and cross-playlist curators.
          </p>
        </div>

        {/* Input Form field */}
        <div className="relative max-w-md w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              const val = e.target.value;
              setSearchQuery(val);
              setSearchParams(val ? { q: val } : {}, { replace: true });
            }}
            placeholder="Search titles, creators, or albums..."
            className="w-full bg-[#18181b] border border-zinc-800 hover:border-zinc-700 focus:border-emerald-500 focus:outline-none rounded-xl py-2 pl-9 pr-4 text-xs text-zinc-200 placeholder-zinc-500 transition"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Genre Pills Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider shrink-0 mr-1">Vibes:</span>
        {genres.map(genre => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className={`px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer transition shrink-0 ${
              selectedGenre === genre
                ? 'bg-emerald-500 text-black shadow shadow-emerald-500/10'
                : 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Discovery Feedback Toast */}
      {toastMessage && (
        <div className={`fixed bottom-28 right-6 z-50 p-3.5 rounded-xl border shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 ${
          toastType === 'warning'
            ? 'bg-amber-950/90 border-amber-800 text-amber-200'
            : 'bg-zinc-900/95 border-zinc-800 text-zinc-200'
        }`}>
          {toastType === 'warning' ? <Crown className="w-4 h-4 text-amber-400" /> : <Sparkles className="w-4 h-4 text-emerald-400" />}
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Results grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
          <span className="text-[10px] text-zinc-500 uppercase font-mono font-bold tracking-widest">
            Production Archive ({filteredSongs.length} releases)
          </span>
          <span className="text-[9px] text-zinc-600 font-mono">
            Right action menu adds or removes tracks from playlists
          </span>
        </div>

        {filteredSongs.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-900 rounded-2xl bg-zinc-950/10">
            <Layers className="w-10 h-10 text-zinc-800 mx-auto mb-2 animate-bounce" />
            <h3 className="text-xs font-bold text-zinc-400">No archival matches</h3>
            <p className="text-[10px] text-zinc-600 font-mono mt-1">
              Try revising keywords or selecting a different Vibe pill.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSongs.map(song => {
              const isPlayingThis = currentTrack && song.id === currentTrack.id && isPlaying;
              
              return (
                <div
                  key={song.id}
                  className={`bg-zinc-950/40 hover:bg-[#121214] border rounded-2xl p-4 transition-all duration-200 group flex items-start justify-between gap-3 relative ${
                    isPlayingThis ? 'border-emerald-500/30 shadow shadow-emerald-500/5' : 'border-zinc-900/60'
                  }`}
                >
                  <div className="flex gap-3.5 min-w-0 flex-1">
                    {/* Album Art Cover with play overlay */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-zinc-850 shadow">
                      <img
                        src={song.coverUrl}
                        alt={song.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        onClick={() => handlePlaySong(song)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200 cursor-pointer"
                      >
                        {isPlayingThis ? (
                          <Pause className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                        ) : (
                          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                        )}
                      </button>
                    </div>

                    {/* Metadata column */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <p 
                        onClick={() => handlePlaySong(song)}
                        className={`text-xs font-bold truncate cursor-pointer hover:underline ${
                          isPlayingThis ? 'text-emerald-400 font-extrabold' : 'text-zinc-200'
                        }`}
                      >
                        {song.title}
                      </p>
                      <p className="text-[10px] text-zinc-400 font-medium truncate">
                        {song.artistName}
                      </p>
                      <p className="text-[9px] text-zinc-500 font-semibold truncate leading-none">
                        Album: {song.albumName}
                      </p>
                      <div className="flex items-center gap-2 text-[8px] text-zinc-600 font-mono pt-1.5">
                        <span className="flex items-center gap-0.5">
                          <Volume2 className="w-2.5 h-2.5" /> {song.streams.toLocaleString()} streams
                        </span>
                        <span>•</span>
                        <span>{Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column context drop action buttons */}
                  <div className="flex flex-row items-center gap-1.5 shrink-0 relative">
                    {/* Download Music - Hidden/Disabled for Free users */}
                    {currentUser && currentUser.tier !== 'free' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const link = document.createElement('a');
                          link.href = song.audioUrl;
                          link.download = `${song.title} - ${song.artistName}.mp3`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-500 hover:text-emerald-400 transition cursor-pointer border border-transparent hover:border-zinc-800"
                        title="Download Track"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => setActiveMenuSongId(activeMenuSongId === song.id ? null : song.id)}
                      className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-500 hover:text-zinc-300 transition cursor-pointer border border-transparent hover:border-zinc-800"
                      title="Add or Remove from Playlists"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Custom Dropdown Context Menu */}
                    {activeMenuSongId === song.id && (
                      <div 
                        ref={menuRef}
                        className="absolute right-0 top-9 w-52 bg-[#121214] border border-zinc-800 rounded-xl py-2 shadow-2xl z-40 text-left animate-in fade-in zoom-in-95"
                      >
                        <span className="px-3 py-1 text-[8px] text-zinc-500 uppercase tracking-widest font-mono font-bold block border-b border-zinc-900 pb-1 mb-1.5">
                          Curate Track
                        </span>
                        
                        {userPlaylists.length === 0 ? (
                          <div className="px-3 py-2 text-[10px] text-zinc-500 italic text-center">
                            No playlists created yet.
                            <button
                              onClick={() => navigate('/playlists')}
                              className="mt-1.5 w-full py-1 bg-zinc-900 hover:bg-zinc-850 hover:text-white text-zinc-300 rounded font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <FolderPlus className="w-3 h-3" /> Create Now
                            </button>
                          </div>
                        ) : (
                          <div className="max-h-44 overflow-y-auto space-y-0.5 px-1">
                            {userPlaylists.map(playlist => {
                              const alreadyAdded = playlist.songIds.includes(song.id);
                              
                              return alreadyAdded ? (
                                <button
                                  key={playlist.id}
                                  onClick={() => handlePlaylistRemove(playlist.id, song)}
                                  className="w-full text-left px-2.5 py-1.5 hover:bg-rose-950/20 text-rose-400 text-[10px] font-bold rounded flex items-center justify-between transition cursor-pointer"
                                >
                                  <span className="truncate mr-1">In: {playlist.name}</span>
                                  <Trash2 className="w-3 h-3 shrink-0" />
                                </button>
                              ) : (
                                <button
                                  key={playlist.id}
                                  onClick={() => handlePlaylistAdd(playlist.id, song)}
                                  className="w-full text-left px-2.5 py-1.5 hover:bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded flex items-center justify-between transition cursor-pointer"
                                >
                                  <span className="truncate mr-1">Add: {playlist.name}</span>
                                  <Plus className="w-3 h-3 shrink-0" />
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Lyric shortcut mic indicator */}
                    {song.lyrics && (
                      <button
                        onClick={() => {
                          setCurrentTrack(song);
                          setTimeout(() => onLyricsClick(), 100);
                        }}
                        className="p-1 hover:text-white text-zinc-600 transition"
                        title="Karaoke lyrics available"
                      >
                        <Mic className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
