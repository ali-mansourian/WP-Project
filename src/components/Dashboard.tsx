import React, { useState } from 'react';
import { useMockState } from '../context/MockStateContext';
import { Song } from '../types';
import { 
  Play, 
  Search, 
  Music, 
  HelpCircle, 
  CornerDownRight, 
  Sparkles, 
  Trash2, 
  ListMusic, 
  Clock,
  Radio
} from 'lucide-react';
import { ArtistDashboard } from './ArtistDashboard';
import { SupportDashboard } from './SupportDashboard';
import { AdminDashboard } from './AdminDashboard';

interface DashboardProps {
  currentView: string;
  setView: (view: string) => void;
  currentTrack: Song | null;
  setCurrentTrack: (song: Song | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  selectedPlaylistId: string | number | null;
  setSelectedPlaylistId: (id: string | number | null) => void;
  onLyricsClick: () => void;
  onAddToPlaylistClick: (songId: string | number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentView,
  setView,
  currentTrack,
  setCurrentTrack,
  isPlaying,
  setIsPlaying,
  selectedPlaylistId,
  setSelectedPlaylistId,
  onLyricsClick,
  onAddToPlaylistClick
}) => {
  const { 
    currentUser, 
    songs, 
    albums, 
    playlists, 
    createSupportTicket, 
    applyForArtist, 
    tickets, 
    applications, 
    removeTrackFromPlaylist,
    deletePlaylist
  } = useMockState();

  const [searchQuery, setSearchQuery] = useState('');
  
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState('');
  
  const [appArtistName, setAppArtistName] = useState('');
  const [appBio, setAppBio] = useState('');
  const [appGenre, setAppGenre] = useState('Lo-Fi Hip-Hop');
  const [appSuccess, setAppSuccess] = useState('');

  if (!currentUser) return null;

  const handleTrackPlay = (song: Song) => {
    setCurrentTrack(song);
    setIsPlaying(true);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;

    createSupportTicket(ticketSubject, ticketMessage);
    setTicketSubject('');
    setTicketMessage('');
    setTicketSuccess('Support ticket submitted successfully to queue!');
    setTimeout(() => setTicketSuccess(''), 4000);
  };

  const handleApplyArtist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appArtistName.trim() || !appBio.trim()) return;

    applyForArtist(appArtistName, appBio, appGenre);
    setAppArtistName('');
    setAppBio('');
    setAppSuccess('Artist application submitted to administrators!');
    setTimeout(() => setAppSuccess(''), 4000);
  };

  const renderViewContent = () => {
    if (currentView === 'home') {
      const earlyAccessTracks = songs.slice().reverse().slice(0, 2);

      return (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          <div className="bg-gradient-to-b from-zinc-900/50 to-zinc-950 p-6 rounded-2xl border border-zinc-900 shadow-xl flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] text-emerald-400 font-mono font-bold tracking-widest uppercase">
                Now Streaming • Phase 1 Core
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Welcome to your dashboard, {currentUser.name}!
              </h2>
              <p className="text-xs text-zinc-400">
                You are currently experiencing the platform on the <strong className="text-emerald-400 font-semibold uppercase">{currentUser.tier}</strong> plan.
              </p>
            </div>
            {currentUser.tier === 'free' && (
              <button
                onClick={() => setView('support-center')}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg transition shadow cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Upgrade Premium</span>
              </button>
            )}
          </div>

          {currentUser.tier === 'gold' && (
            <div className="p-6 bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-900 border border-amber-500/30 rounded-2xl space-y-4 shadow-xl">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
                <h3 className="text-sm font-extrabold text-amber-400 font-mono uppercase tracking-wider">
                  Gold Exclusive: Early Access Releases
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {earlyAccessTracks.map((song) => (
                  <div key={song.id} className="flex items-center gap-3 p-3 bg-zinc-950/80 rounded-xl border border-amber-500/20">
                    <img src={song.coverUrl} alt={song.title} className="w-12 h-12 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{song.title}</p>
                      <p className="text-[10px] text-amber-300 font-mono truncate">{song.artistName} • Early Premier</p>
                    </div>
                    <button
                      onClick={() => handleTrackPlay(song)}
                      className="p-2 bg-amber-500 text-black rounded-full hover:bg-amber-400 transition"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white tracking-tight">Curated Albums</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {albums.map((album) => {
                const albumTracks = songs.filter(s => s.albumId === album.id);
                return (
                  <div 
                    key={album.id}
                    className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-900 hover:bg-zinc-900/60 transition group cursor-pointer flex flex-col justify-between"
                  >
                    <div className="relative overflow-hidden rounded-lg aspect-square mb-3">
                      <img
                        src={album.coverUrl}
                        alt={album.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (albumTracks.length > 0) {
                            handleTrackPlay(albumTracks[0]);
                          }
                        }}
                        className="absolute bottom-3 right-3 w-10 h-10 bg-emerald-500 text-black rounded-full flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transition translate-y-2 group-hover:translate-y-0 cursor-pointer"
                      >
                        <Play className="w-5 h-5 fill-black ml-0.5" />
                      </button>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white truncate">{album.title}</h4>
                      <p className="text-xs text-zinc-500 font-medium truncate mt-0.5">{album.artistName}</p>
                      <span className="text-[9px] text-zinc-600 font-mono mt-1 block">
                        {albumTracks.length} {albumTracks.length === 1 ? 'Track' : 'Tracks'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-[#121212] border border-zinc-800 p-6 rounded-2xl shadow-xl space-y-4">
              <h3 className="text-sm font-bold font-mono uppercase tracking-widest text-zinc-400">
                Popular Streaming Songs
              </h3>
              <div className="space-y-2">
                {songs.map((song, idx) => {
                  const isThisTrack = currentTrack && song.id === currentTrack.id;
                  return (
                    <div 
                      key={song.id}
                      onClick={() => handleTrackPlay(song)}
                      className={`flex items-center gap-3 p-2.5 rounded-xl transition group cursor-pointer ${
                        isThisTrack 
                          ? 'bg-emerald-950/20 border border-emerald-900/20' 
                          : 'bg-zinc-900/20 hover:bg-zinc-900/50'
                      }`}
                    >
                      <span className="w-4 text-xs font-mono text-zinc-600 text-center">
                        {idx + 1}
                      </span>
                      <img
                        src={song.coverUrl}
                        alt={song.title}
                        className="w-10 h-10 rounded object-cover border border-zinc-800"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold truncate ${isThisTrack ? 'text-emerald-400 font-bold' : 'text-white'}`}>
                          {song.title}
                        </p>
                        <p className="text-[10px] text-zinc-500 truncate">
                          {song.artistName} • {song.albumName || 'Single'}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                        </span>
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow">
                          <Play className="w-3 h-3 fill-black ml-0.2" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-4 bg-[#121212] border border-zinc-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-400 font-mono uppercase tracking-widest">
                  Quick Stats & Activity
                </h3>
                
                <div className="space-y-3">
                  <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-900">
                    <span className="text-[9px] text-zinc-500 font-mono">Current User Identity</span>
                    <p className="text-xs font-semibold text-zinc-300 mt-1">{currentUser.name}</p>
                    <p className="text-[10px] text-zinc-500">Tier: <strong className="text-emerald-400 font-mono uppercase">{currentUser.tier}</strong></p>
                  </div>
                  
                  <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-900">
                    <span className="text-[9px] text-zinc-500 font-mono">Active Subscriptions</span>
                    <p className="text-xs text-zinc-400 mt-1">Playlists Count: <strong className="text-white font-mono">{playlists.filter(p => p.userId === currentUser.id).length}</strong></p>
                    <p className="text-[10px] text-zinc-500">Upgrade to Gold for zero skip/playlist limits!</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-900 text-[10px] text-zinc-600 font-mono leading-normal mt-4">
                All metrics are mock computed in real-time within your active local session using Spotify-Like React Context structures.
              </div>
            </div>

          </div>

        </div>
      );
    }

    if (currentView === 'search') {
      const filteredSongs = songs.filter(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.artistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.albumName || '').toLowerCase().includes(searchQuery.toLowerCase())
      );

      return (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Search Platform</h2>
            <p className="text-xs text-zinc-500">Query songs, albums, playlists, or artist profiles instant-feed.</p>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What do you want to listen to?"
              className="w-full bg-[#242424] border border-zinc-800 hover:border-zinc-700 focus:border-emerald-500 focus:outline-none rounded-full py-3.5 pl-12 pr-4 text-sm text-white font-sans shadow-xl transition"
            />
          </div>

          <div className="bg-[#121212] border border-zinc-800 p-6 rounded-2xl shadow-xl space-y-4">
            <span className="text-xs font-bold text-zinc-500 font-mono uppercase tracking-widest block">
              Search Results ({filteredSongs.length})
            </span>

            {filteredSongs.length === 0 ? (
              <div className="text-center py-20 text-zinc-500">
                <Music className="w-10 h-10 text-zinc-700 mx-auto mb-2 animate-pulse" />
                <p className="text-sm font-semibold">No matches found</p>
                <p className="text-xs text-zinc-600 font-mono mt-1">Try querying "Midnight" or "Luna Wave" or "Synth".</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSongs.map((song) => {
                  const isThisTrack = currentTrack && song.id === currentTrack.id;
                  return (
                    <div 
                      key={song.id}
                      onClick={() => handleTrackPlay(song)}
                      className={`flex items-center gap-3.5 p-3 rounded-xl transition cursor-pointer border ${
                        isThisTrack 
                          ? 'bg-emerald-950/20 border-emerald-900/30' 
                          : 'bg-zinc-900/30 border-zinc-900 hover:bg-zinc-900/70 hover:border-zinc-800'
                      }`}
                    >
                      <img
                        src={song.coverUrl}
                        alt={song.title}
                        className="w-11 h-11 rounded object-cover border border-zinc-800 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold truncate ${isThisTrack ? 'text-emerald-400 font-bold' : 'text-white'}`}>
                          {song.title}
                        </p>
                        <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                          Artist: {song.artistName} • Album: {song.albumName || 'Single'}
                        </p>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                        {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (currentView === 'playlist-detail') {
      const playlist = playlists.find(p => p.id === selectedPlaylistId);
      if (!playlist) {
        return <div className="text-zinc-500">Playlist not found.</div>;
      }

      const playlistSongs = songs.filter(s => playlist.songIds.includes(s.id));

      const handleDeleteClick = () => {
        deletePlaylist(playlist.id);
        setView('home');
      };

      return (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 bg-gradient-to-b from-emerald-950/20 to-zinc-950 p-6 rounded-2xl border border-zinc-900">
            <img
              src={playlist.coverUrl}
              alt={playlist.name}
              className="w-36 h-36 rounded-xl object-cover shadow-2xl border border-zinc-800"
            />
            <div className="flex-1 space-y-2">
              <span className="text-[10px] text-emerald-400 font-mono uppercase font-bold tracking-widest">
                Playlist Catalog
              </span>
              <h2 className="text-3xl font-bold text-white tracking-tight leading-none">
                {playlist.name}
              </h2>
              <p className="text-xs text-zinc-400 leading-normal max-w-xl">
                {playlist.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                <span>By User: <strong>{currentUser.name}</strong></span>
                <span>•</span>
                <span>{playlistSongs.length} tracks total</span>
                <span>•</span>
                <span>Created {playlist.createdAt}</span>
              </div>
            </div>

            <button
              onClick={handleDeleteClick}
              className="p-2.5 bg-rose-950 text-rose-300 border border-rose-900 rounded-lg hover:bg-rose-900 hover:text-white transition shadow cursor-pointer self-start md:self-end"
              title="Delete Playlist"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-[#121212] border border-zinc-800 p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <span className="text-xs font-bold text-zinc-400 font-mono uppercase tracking-widest">
                Track List
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Click any track to stream</span>
            </div>

            {playlistSongs.length === 0 ? (
              <div className="text-center py-16 text-zinc-500 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/10">
                <ListMusic className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
                <p className="text-xs font-semibold text-zinc-400">This playlist is empty</p>
                <p className="text-[10px] text-zinc-500 font-mono mt-1">Navigate to Home or Search and click '+' on any track to add it!</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {playlistSongs.map((song, idx) => {
                  const isThisTrack = currentTrack && song.id === currentTrack.id;
                  return (
                    <div 
                      key={song.id}
                      onClick={() => handleTrackPlay(song)}
                      className={`flex items-center gap-3 p-2.5 rounded-xl transition cursor-pointer group ${
                        isThisTrack ? 'bg-emerald-950/20' : 'hover:bg-zinc-900/40'
                      }`}
                    >
                      <span className="w-4 text-xs font-mono text-zinc-600 text-center">{idx + 1}</span>
                      <img
                        src={song.coverUrl}
                        alt={song.title}
                        className="w-9 h-9 rounded object-cover border border-zinc-800"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold truncate ${isThisTrack ? 'text-emerald-400 font-bold' : 'text-white'}`}>
                          {song.title}
                        </p>
                        <p className="text-[10px] text-zinc-500 truncate">{song.artistName} • {song.albumName || 'Single'}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTrackFromPlaylist(playlist.id, song.id);
                          }}
                          className="p-1.5 rounded bg-zinc-900 text-zinc-500 hover:text-rose-400 border border-zinc-800 hover:border-rose-950 transition cursor-pointer opacity-0 group-hover:opacity-100"
                          title="Remove from Playlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      );
    }

    if (currentView === 'support-center') {
      const userTickets = tickets.filter(t => t.userId === currentUser.id);
      const userApps = applications.filter(a => a.userId === currentUser.id);

      return (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white tracking-tight">Support & Creator Application Portal</h2>
            <p className="text-xs text-zinc-400">File assistance tickets, inspect historical complaints, or request authorization to launch as an artist.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <div className="bg-[#121212] border border-zinc-800 p-6 rounded-2xl shadow-xl space-y-6">
              <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Become a Certified Artist</h3>
              </div>

              {userApps.length > 0 ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-900 space-y-2">
                    <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest block">Active request status</span>
                    {userApps.map(app => (
                      <div key={app.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-white">Artist Profile: {app.artistName}</p>
                          <span className={`text-[9px] px-2 py-0.5 border font-mono rounded font-bold uppercase ${
                            app.status === 'approved' ? 'bg-emerald-950 text-emerald-300 border-emerald-900' :
                            app.status === 'rejected' ? 'bg-rose-950 text-rose-300 border-rose-900' :
                            'bg-yellow-950 text-yellow-300 border-yellow-900'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 leading-normal">
                          Genre tag: <strong>{app.genre}</strong> • Applied: {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                        {app.status === 'pending' && (
                          <div className="p-2.5 rounded bg-yellow-950/10 border border-yellow-900/20 text-[10px] text-yellow-300/80 leading-normal font-mono">
                            Your application is in the admin audit queue. Click the identity switcher top right to log in as "Admin Chief" to approve this request!
                          </div>
                        )}
                        {app.status === 'approved' && (
                          <div className="p-2.5 rounded bg-emerald-950/10 border border-emerald-900/20 text-[10px] text-emerald-300/80 leading-normal font-mono">
                            Approved! Log in as your artist alias inside the identity switcher to access the Creator Studio.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleApplyArtist} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 font-mono uppercase mb-1.5">
                      Requested Artist Pseudonym
                    </label>
                    <input
                      type="text"
                      required
                      value={appArtistName}
                      onChange={(e) => setAppArtistName(e.target.value)}
                      placeholder="e.g. DJ SynthWave"
                      className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 font-mono uppercase mb-1.5">
                      Genre Focus
                    </label>
                    <select
                      value={appGenre}
                      onChange={(e) => setAppGenre(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                    >
                      <option value="Lo-Fi Hip-Hop">Lo-Fi Hip-Hop</option>
                      <option value="Synthwave">Synthwave / Electro</option>
                      <option value="Ambient Chill">Ambient Chill</option>
                      <option value="Acoustic Folk">Acoustic Folk</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 font-mono uppercase mb-1.5">
                      Artist Bio & Pitch
                    </label>
                    <textarea
                      required
                      value={appBio}
                      onChange={(e) => setAppBio(e.target.value)}
                      placeholder="Why do you want to release tracks on this platform? Tell us about your style..."
                      className="w-full h-20 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-amber-500 focus:outline-none rounded-lg p-2.5 text-xs text-white resize-none"
                    />
                  </div>

                  {appSuccess && (
                    <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/50 text-xs text-emerald-300">
                      {appSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition shadow-lg"
                  >
                    Submit Creator Profile Application
                  </button>
                </form>
              )}
            </div>

            <div className="bg-[#121212] border border-zinc-800 p-6 rounded-2xl shadow-xl space-y-6">
              <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
                <HelpCircle className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">File Support Assistance Ticket</h3>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 font-mono uppercase mb-1.5">
                    Troubleshoot Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="e.g. Silver Subscription billing error"
                    className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-sky-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 font-mono uppercase mb-1.5">
                    Detailed Explanation
                  </label>
                  <textarea
                    required
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="My payment went through but my fidelity is still low. Please check my credentials..."
                    className="w-full h-20 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-sky-500 focus:outline-none rounded-lg p-2.5 text-xs text-white resize-none"
                  />
                </div>

                {ticketSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/50 text-xs text-emerald-300">
                    {ticketSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2 bg-sky-500 hover:bg-sky-400 text-black text-xs font-bold rounded-lg transition shadow-lg"
                >
                  Publish Ticket to Support Queue
                </button>
              </form>
            </div>

          </div>

          <div className="bg-[#121212] border border-zinc-800 p-6 rounded-2xl shadow-xl space-y-4">
            <span className="text-xs font-bold text-zinc-500 font-mono uppercase tracking-widest block border-b border-zinc-900 pb-3">
              Your Open Tickets & Helpdesk History ({userTickets.length})
            </span>

            {userTickets.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 font-mono text-xs">
                No tickets submitted yet in this browser session.
              </div>
            ) : (
              <div className="space-y-4">
                {userTickets.map((t) => (
                  <div key={t.id} className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-900 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{t.subject}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] px-2 py-0.5 rounded border font-mono uppercase font-bold ${
                          t.status === 'open' ? 'bg-rose-950 text-rose-300 border-rose-900' :
                          t.status === 'pending' ? 'bg-yellow-950 text-yellow-300 border-yellow-900' :
                          'bg-emerald-950 text-emerald-300 border-emerald-900'
                        }`}>
                          {t.status}
                        </span>
                        <span className="text-[9px] text-zinc-500 font-mono">{new Date(t.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-400 bg-zinc-950/50 p-2.5 rounded-lg leading-relaxed whitespace-pre-wrap border border-zinc-900/60">
                      {t.message}
                    </p>

                    {t.replies.length > 0 && (
                      <div className="pl-4 border-l-2 border-sky-800 space-y-3 mt-2">
                        {t.replies.map(r => (
                          <div key={r.id} className="space-y-1">
                            <div className="flex items-center gap-2 text-[10px] text-sky-400 font-mono">
                              <CornerDownRight className="w-3.5 h-3.5" />
                              <span>Reply from <strong>{r.senderName}</strong></span>
                            </div>
                            <p className="text-xs text-zinc-300 bg-sky-950/10 p-2.5 rounded border border-sky-900/20 whitespace-pre-wrap">
                              {r.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      );
    }

    if (currentView === 'artist-dashboard') {
      return <ArtistDashboard />;
    }
    if (currentView === 'support-agent-dashboard') {
      return <SupportDashboard />;
    }
    if (currentView === 'admin-dashboard') {
      return <AdminDashboard />;
    }

    return null;
  };

  return (
    <div className="flex-1 bg-[#121212] overflow-y-auto pb-32">
      <div className="max-w-5xl mx-auto px-8 py-6">
        {renderViewContent()}
      </div>
    </div>
  );
};