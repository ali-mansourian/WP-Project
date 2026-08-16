import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useMockState } from '../context/MockStateContext';
import { Song, Album } from '../types';
import { Play, Pause, Compass, Disc, Calendar, Plus, Search, ArrowUpDown } from 'lucide-react';

interface OutletContextType {
  currentTrack: Song | null;
  setCurrentTrack: (song: Song | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  onLyricsClick: () => void;
  onAddToPlaylistClick: (songId: string | number) => void;
}

export const AlbumsView: React.FC = () => {
  const { albums, songs } = useMockState();
  const { currentTrack, setCurrentTrack, isPlaying, setIsPlaying, onAddToPlaylistClick } = useOutletContext<OutletContextType>();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'listeners' | 'releaseDate'>('releaseDate');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | number | null>(null);

  const filteredAlbums = albums.filter(album => 
    album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    album.artistName.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'releaseDate') {
      return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
    } else {
      const aStreams = songs.filter(s => s.albumId === a.id).reduce((acc, s) => acc + s.streams, 0);
      const bStreams = songs.filter(s => s.albumId === b.id).reduce((acc, s) => acc + s.streams, 0);
      return bStreams - aStreams;
    }
  });

  const activeAlbumId = selectedAlbumId || (filteredAlbums.length > 0 ? filteredAlbums[0].id : null);
  const activeAlbum = albums.find(a => a.id === activeAlbumId);
  const albumTracks = activeAlbum ? songs.filter(s => s.albumId === activeAlbum.id) : [];

  const handleTrackPlay = (song: Song) => {
    setCurrentTrack(song);
    setIsPlaying(true);
  };

  const handlePlayAlbum = (album: Album) => {
    const tracks = songs.filter(s => s.albumId === album.id);
    if (tracks.length > 0) {
      setCurrentTrack(tracks[0]);
      setIsPlaying(true);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-zinc-900 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Curated Albums & Singles</h1>
          <p className="text-xs text-zinc-400 font-medium mt-1">Browse high fidelity audio catalogs preloaded into your workspace.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search albums or artists..."
              className="bg-zinc-900 border border-zinc-800 focus:border-emerald-500 focus:outline-none text-xs text-white pl-9 pr-3 py-2 rounded-lg w-48 sm:w-64"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-400">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'listeners' | 'releaseDate')}
              className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
            >
              <option value="releaseDate" className="bg-zinc-900">Sort by Date</option>
              <option value="listeners" className="bg-zinc-900">Sort by Streams</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-bold text-zinc-500 font-mono uppercase tracking-wider">Albums Catalog</h3>
          
          {filteredAlbums.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-zinc-900 rounded-xl">
              <p className="text-xs text-zinc-500">No matching albums found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredAlbums.map((album) => {
                const tracks = songs.filter(s => s.albumId === album.id);
                const isSelected = album.id === activeAlbumId;
                const isAlbumPlaying = tracks.some(t => currentTrack && t.id === currentTrack.id && isPlaying);

                return (
                  <div
                    key={album.id}
                    onClick={() => setSelectedAlbumId(album.id)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between group relative ${
                      isSelected
                        ? 'bg-zinc-900 border-zinc-800'
                        : 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-800'
                    }`}
                  >
                    <div className="relative overflow-hidden rounded-lg aspect-square mb-3 shadow-md">
                      <img
                        src={album.coverUrl}
                        alt={album.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isAlbumPlaying) {
                            setIsPlaying(false);
                          } else {
                            setSelectedAlbumId(album.id);
                            handlePlayAlbum(album);
                          }
                        }}
                        className="absolute bottom-2.5 right-2.5 w-9 h-9 bg-emerald-500 text-black rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition transform translate-y-1 group-hover:translate-y-0 cursor-pointer"
                      >
                        {isAlbumPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
                      </button>
                    </div>

                    <div>
                      <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-emerald-400' : 'text-white'}`}>
                        {album.title}
                      </h4>
                      <p 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/search?q=${encodeURIComponent(album.artistName)}`);
                        }}
                        className="text-[10px] text-zinc-500 font-semibold truncate mt-0.5 hover:underline cursor-pointer hover:text-zinc-300"
                      >
                        {album.artistName}
                      </p>
                      <span className="text-[8px] text-zinc-600 font-mono mt-1 block">
                        {tracks.length} {tracks.length === 1 ? 'Track' : 'Tracks'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-7 space-y-4">
          {activeAlbum ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 bg-gradient-to-b from-zinc-900/60 to-zinc-950 p-5 rounded-xl border border-zinc-900">
                <img
                  src={activeAlbum.coverUrl}
                  alt={activeAlbum.title}
                  className="w-24 h-24 rounded-lg object-cover shadow border border-zinc-850"
                  referrerPolicy="no-referrer"
                />
                
                <div className="flex-1 space-y-1.5 min-w-0">
                  <span className="text-[9px] text-emerald-400 font-mono uppercase font-bold tracking-widest block">
                    Preloaded Album Catalog
                  </span>
                  <h2 className="text-xl font-bold text-white tracking-tight truncate leading-none">
                    {activeAlbum.title}
                  </h2>
                  <p 
                    onClick={() => navigate(`/search?q=${encodeURIComponent(activeAlbum.artistName)}`)}
                    className="text-xs text-zinc-400 font-semibold hover:underline cursor-pointer hover:text-zinc-200"
                  >
                    By {activeAlbum.artistName}
                  </p>
                  
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{activeAlbum.releaseDate}</span>
                    </span>
                    <span>•</span>
                    <span>{albumTracks.length} tracks cataloged</span>
                  </div>
                </div>

                {albumTracks.length > 0 && (
                  <button
                    onClick={() => handlePlayAlbum(activeAlbum)}
                    className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow shrink-0 self-start sm:self-end"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Stream Album</span>
                  </button>
                )}
              </div>

              <div className="bg-[#121214] border border-zinc-850 p-5 rounded-xl space-y-4 shadow">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                  <span className="text-[10px] font-bold text-zinc-400 font-mono uppercase tracking-widest">
                    Track Listings
                  </span>
                  <span className="text-[9px] text-zinc-600 font-mono">Click to play track • Tap '+' to add</span>
                </div>

                <div className="space-y-1.5">
                  {albumTracks.map((song, idx) => {
                    const isThisTrack = currentTrack && song.id === currentTrack.id;
                    return (
                      <div
                        key={song.id}
                        onClick={() => handleTrackPlay(song)}
                        className={`flex items-center justify-between p-2.5 rounded-xl transition cursor-pointer ${
                          isThisTrack ? 'bg-emerald-950/20 text-white' : 'hover:bg-zinc-900/30'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-5 text-xs font-mono text-zinc-600 text-center font-semibold">
                            {idx + 1}
                          </span>
                          <div className="w-8 h-8 rounded bg-zinc-900 flex items-center justify-center border border-zinc-850 shrink-0 text-zinc-500">
                            <Disc className={`w-4 h-4 ${isThisTrack && isPlaying ? 'animate-spin text-emerald-400' : ''}`} />
                          </div>
                          <div className="min-w-0">
                            <p className={`text-xs font-bold truncate ${isThisTrack ? 'text-emerald-400' : 'text-zinc-200'}`}>
                              {song.title}
                            </p>
                            <p className="text-[10px] text-zinc-500 truncate font-semibold">
                              Streams: {song.streams.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0 font-mono text-zinc-500 text-[10px]">
                          <span>
                            {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToPlaylistClick(song.id);
                            }}
                            className="text-zinc-500 hover:text-white transition p-1 cursor-pointer"
                            title="Add track to playlist"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-zinc-950/20 border border-zinc-900 rounded-xl">
              <Compass className="w-12 h-12 text-zinc-800 mb-2" />
              <h3 className="text-sm font-bold text-zinc-400">Select an album</h3>
              <p className="text-xs text-zinc-500 font-mono mt-1">
                Choose from the catalog on the left to show song listings.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};