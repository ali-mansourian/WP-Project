import React, { useState, useRef } from 'react';
import { useMockState } from '../context/MockStateContext';
import { Song } from '../types';
import { 
  Sparkles, 
  Upload, 
  TrendingUp, 
  Music, 
  DollarSign, 
  ListMusic,
  FileAudio,
  AlertCircle,
  Trash2,
  Edit,
  X,
  FileText,
  Users,
  Image as ImageIcon,
  Activity,
  Loader2
} from 'lucide-react';

export const ArtistDashboard: React.FC = () => {
  const { currentUser, songs, uploadSong, updateSong, deleteSong, config } = useMockState();

  const [title, setTitle] = useState('');
  const [albumName, setAlbumName] = useState('');
  const [releaseType, setReleaseType] = useState<'single' | 'album'>('single');
  const [genre, setGenre] = useState('Synthwave');
  const [releaseYear, setReleaseYear] = useState(new Date().getFullYear().toString());
  const [collaborators, setCollaborators] = useState('');
  const [durationSecs, setDurationSecs] = useState('180');
  const [lyrics, setLyrics] = useState('');
  
  const [dragActiveAudio, setDragActiveAudio] = useState(false);
  const [audioFileName, setAudioFileName] = useState('');
  const [audioFileSize, setAudioFileSize] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const [dragActiveCover, setDragActiveCover] = useState(false);
  const [coverFileName, setCoverFileName] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAlbumName, setEditAlbumName] = useState('');
  const [editLyrics, setEditLyrics] = useState('');
  const [editGenre, setEditGenre] = useState('');
  const [editReleaseYear, setEditReleaseYear] = useState('');
  const [editCollaborators, setEditCollaborators] = useState('');
  const [editReleaseType, setEditReleaseType] = useState<'single' | 'album'>('single');
  const [isEditing, setIsEditing] = useState(false);

  const [deletingSong, setDeletingSong] = useState<Song | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  if (!currentUser || currentUser.role !== 'artist') {
    return (
      <div className="bg-rose-950/20 border border-rose-900/30 p-8 rounded-2xl text-center max-w-lg mx-auto my-12 shadow-2xl">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4 animate-bounce" />
        <h4 className="text-lg font-bold text-white font-sans">Access Denied</h4>
        <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
          The Artist Management Panel is exclusively restricted to authenticated artists. Please register or switch roles.
        </p>
      </div>
    );
  }

  if (currentUser.status === 'pending' || currentUser.status === 'rejected') {
    return (
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl text-center max-w-xl mx-auto my-12 shadow-2xl space-y-4">
        <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-500">
          <AlertCircle className="w-8 h-8 animate-pulse" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-white font-sans">Application Status: {currentUser.status?.toUpperCase() || 'PENDING'}</h3>
          <p className="text-xs text-zinc-500 font-mono">Profile Verification Required</p>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-md mx-auto">
          {currentUser.status === 'rejected' 
            ? "Your previous artist application was rejected by support specialists. Please contact the platform administrators to appeal or revise your submission."
            : "Your artist application is currently pending evaluation. Our support staff will review your submitted credentials and audio portfolio shortly."}
        </p>
      </div>
    );
  }

  const artistSongs = songs.filter(s => s.artistId === currentUser.id);

  const totalTracks = artistSongs.length;
  const totalStreams = artistSongs.reduce((acc, s) => acc + s.streams, 0);
  const totalListeners = Math.round(totalStreams * 0.74) + (totalTracks * 12);
  const totalEarnings = Number((totalStreams * config.metrics.averagePayoutPerStream).toFixed(2));

  // --- AUDIO FILE HANDLERS ---
  const handleAudioDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActiveAudio(true);
    else if (e.type === "dragleave") setDragActiveAudio(false);
  };
  const handleAudioDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActiveAudio(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setAudioFileName(file.name);
      setAudioFileSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');
      setAudioFile(file);
    }
  };
  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioFileName(file.name);
      setAudioFileSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');
      setAudioFile(file);
    }
  };

  // --- COVER FILE HANDLERS ---
  const handleCoverDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActiveCover(true);
    else if (e.type === "dragleave") setDragActiveCover(false);
  };
  const handleCoverDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActiveCover(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setCoverFileName(file.name);
      setCoverFile(file);
    }
  };
  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFileName(file.name);
      setCoverFile(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    // Auto-generate album name for singles
    const finalAlbumName = releaseType === 'single' ? `${title.trim()} - Single` : albumName.trim();

    if (!title.trim() || !finalAlbumName || !durationSecs.trim()) {
      setError('Please provide song title, album/collection name, and duration.');
      return;
    }

    const duration = parseInt(durationSecs);
    if (isNaN(duration) || duration <= 0) {
      setError('Duration must be a positive number of seconds.');
      return;
    }

    if (!audioFile) {
      setError('An audio file (mp3, wav, flac) is required.');
      return;
    }

    setIsUploading(true);

    try {
      const result = await uploadSong(title, finalAlbumName, duration, lyrics, '', {
        releaseType,
        genre,
        releaseYear,
        collaborators,
        audioFile,
        coverFile
      });

      if (result && result.success) {
        setSuccess(`"${title}" published successfully to your stream catalog!`);
        setTitle(''); setAlbumName(''); setDurationSecs('180'); setLyrics('');
        setCollaborators(''); setAudioFileName(''); setAudioFileSize(''); setAudioFile(null);
        setCoverFileName(''); setCoverFile(null); setReleaseType('single'); setGenre('Synthwave');
        setTimeout(() => setSuccess(''), 4500);
      } else {
        setError(result ? result.message : 'Failed to publish track.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const startEditing = (song: Song) => {
    setEditingSong(song);
    setEditTitle(song.title);
    
    // Check if the album name was autogenerated to strip it cleanly if needed, 
    // but typically we just populate it as is.
    setEditAlbumName(song.albumName || '');
    setEditLyrics(song.lyrics || '');
    setEditGenre(song.genre || 'Pop');
    setEditReleaseYear(song.releaseYear || new Date().getFullYear().toString());
    setEditCollaborators(song.collaborators || '');
    setEditReleaseType(song.releaseType || 'single');
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSong) return;
    setIsEditing(true);

    // Auto-generate album name for edited singles
    const finalEditAlbumName = editReleaseType === 'single' ? `${editTitle.trim()} - Single` : editAlbumName.trim();
    
    try {
      const result = await updateSong(editingSong.id, {
        title: editTitle,
        albumName: finalEditAlbumName,
        lyrics: editLyrics,
        genre: editGenre,
        releaseYear: editReleaseYear,
        collaborators: editCollaborators,
        releaseType: editReleaseType
      });

      if (result && result.success) {
        setSuccess(`Successfully updated track "${editTitle}"!`);
        setEditingSong(null);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result ? result.message : 'Update failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Update failed.');
    } finally {
      setIsEditing(false);
    }
  };

  const triggerTakeDown = (song: Song) => {
    setDeletingSong(song);
  };

  const handleTakeDownConfirm = async () => {
    if (!deletingSong) return;
    setIsDeleting(true);

    try {
      const result = await deleteSong(deletingSong.id);
      if (result && result.success) {
        setSuccess(`Track "${deletingSong.title}" has been taken down and de-listed.`);
        setDeletingSong(null);
        setTimeout(() => setSuccess(''), 3500);
      } else {
        setError(result ? result.message : 'Failed to delete track.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete track.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="bg-gradient-to-r from-emerald-950/35 via-zinc-900 to-zinc-900 p-8 rounded-2xl border border-emerald-500/10 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-5 flex items-center justify-center">
          <Sparkles className="w-64 h-64 text-emerald-400 rotate-12" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold font-mono uppercase tracking-wider">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            <span>Artist Management Console</span>
          </div>
          <h1 className="text-3xl font-bold text-white font-sans tracking-tight">
            Welcome back, {currentUser.name}!
          </h1>
          <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
            Manage your audio content pipeline, analyze unique platform listeners, upload verified tracks, and update release metadata on-the-fly.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 border-l-2 border-emerald-500 pl-3">
          <Activity className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold text-white tracking-wider uppercase font-mono">Performance Analytics</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-zinc-950/70 p-5 rounded-xl border border-zinc-900 shadow-md relative overflow-hidden group hover:border-zinc-800 transition-all">
            <div className="absolute top-4 right-4 text-emerald-500/20 group-hover:text-emerald-500/40 transition">
              <TrendingUp className="w-10 h-10" />
            </div>
            <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-1">Total Play Streams</span>
            <div className="text-2xl font-bold text-white font-mono mt-1">{totalStreams.toLocaleString()}</div>
            <div className="text-[10px] text-zinc-500 font-mono mt-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Live listener counters
            </div>
          </div>

          <div className="bg-zinc-950/70 p-5 rounded-xl border border-zinc-900 shadow-md relative overflow-hidden group hover:border-zinc-800 transition-all">
            <div className="absolute top-4 right-4 text-sky-500/20 group-hover:text-sky-500/40 transition">
              <Users className="w-10 h-10" />
            </div>
            <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-1">Total Unique Listeners</span>
            <div className="text-2xl font-bold text-white font-mono mt-1">{totalListeners.toLocaleString()}</div>
            <div className="text-[10px] text-zinc-500 font-mono mt-2">
              Based on IP & account sessions
            </div>
          </div>

          <div className="bg-zinc-950/70 p-5 rounded-xl border border-zinc-900 shadow-md relative overflow-hidden group hover:border-zinc-800 transition-all">
            <div className="absolute top-4 right-4 text-amber-500/20 group-hover:text-amber-500/40 transition">
              <DollarSign className="w-10 h-10" />
            </div>
            <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-1">Calculated Earnings</span>
            <div className="text-2xl font-bold text-amber-400 font-mono mt-1">${totalEarnings.toFixed(2)}</div>
            <div className="text-[10px] text-zinc-500 font-mono mt-2">
              Estimated payout: ${config.metrics.averagePayoutPerStream}/play
            </div>
          </div>

          <div className="bg-zinc-950/70 p-5 rounded-xl border border-zinc-900 shadow-md relative overflow-hidden group hover:border-zinc-800 transition-all">
            <div className="absolute top-4 right-4 text-indigo-500/20 group-hover:text-indigo-500/40 transition">
              <Music className="w-10 h-10" />
            </div>
            <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-1">Published Tracks</span>
            <div className="text-2xl font-bold text-white font-mono mt-1">{totalTracks}</div>
            <div className="text-[10px] text-zinc-500 font-mono mt-2">
              Singles & album tracks active
            </div>
          </div>
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/50 text-xs text-emerald-300 font-mono flex items-center gap-2 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          {success}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/50 text-xs text-rose-300 font-mono flex items-center gap-2 animate-pulse">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 bg-zinc-950/40 border border-zinc-900 p-6 rounded-2xl shadow-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
            <Upload className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Release Audio Pipeline</h3>
          </div>

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 font-mono uppercase mb-1.5">Track Title</label>
                <input
                  type="text" required value={title}
                  disabled={isUploading}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Neon Horizon"
                  className="w-full bg-zinc-950 border border-zinc-900 focus:border-emerald-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 font-mono uppercase mb-1.5">Album / Collection</label>
                <input
                  type="text" 
                  required={releaseType === 'album'} 
                  value={releaseType === 'single' ? (title ? `${title} - Single` : '') : albumName}
                  disabled={isUploading || releaseType === 'single'}
                  onChange={(e) => setAlbumName(e.target.value)}
                  placeholder="e.g. Retro Dreams LP"
                  className={`w-full bg-zinc-950 border border-zinc-900 focus:border-emerald-500 focus:outline-none rounded-lg p-2.5 text-xs text-white transition-opacity ${releaseType === 'single' ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 font-mono uppercase mb-1.5">Format</label>
                <div className="grid grid-cols-2 gap-1 bg-zinc-950 p-1 border border-zinc-900 rounded-lg">
                  <button
                    type="button" disabled={isUploading}
                    onClick={() => setReleaseType('single')}
                    className={`py-1.5 text-[10px] font-bold rounded font-mono transition cursor-pointer ${
                      releaseType === 'single' ? 'bg-emerald-500 text-black shadow' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Single
                  </button>
                  <button
                    type="button" disabled={isUploading}
                    onClick={() => setReleaseType('album')}
                    className={`py-1.5 text-[10px] font-bold rounded font-mono transition cursor-pointer ${
                      releaseType === 'album' ? 'bg-emerald-500 text-black shadow' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Album
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 font-mono uppercase mb-1.5">Genre</label>
                <select
                  value={genre} disabled={isUploading}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 focus:border-emerald-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                >
                  <option value="Synthwave">Synthwave</option>
                  <option value="Lo-Fi">Lo-Fi Beats</option>
                  <option value="Ambient">Ambient Space</option>
                  <option value="Pop">Pop</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 font-mono uppercase mb-1.5">Release Year</label>
                <input
                  type="number" required value={releaseYear} disabled={isUploading}
                  onChange={(e) => setReleaseYear(e.target.value)}
                  placeholder="2026"
                  className="w-full bg-zinc-950 border border-zinc-900 focus:border-emerald-500 focus:outline-none rounded-lg p-2.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 font-mono uppercase mb-1.5">Collaborators</label>
                <input
                  type="text" value={collaborators} disabled={isUploading}
                  onChange={(e) => setCollaborators(e.target.value)}
                  placeholder="e.g. DJ Spark"
                  className="w-full bg-zinc-950 border border-zinc-900 focus:border-emerald-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 font-mono uppercase mb-1.5">Duration (seconds)</label>
                <input
                  type="number" required value={durationSecs} disabled={isUploading}
                  onChange={(e) => setDurationSecs(e.target.value)}
                  placeholder="180"
                  className="w-full bg-zinc-950 border border-zinc-900 focus:border-emerald-500 focus:outline-none rounded-lg p-2.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 font-mono uppercase mb-1.5">Audio File Upload</label>
              <div 
                onDragEnter={handleAudioDrag} onDragOver={handleAudioDrag} onDragLeave={handleAudioDrag} onDrop={handleAudioDrop}
                onClick={() => !isUploading && audioInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                  dragActiveAudio ? 'border-emerald-500 bg-emerald-950/10' : audioFile ? 'border-emerald-800/80 bg-zinc-950' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/20'
                }`}
              >
                <input ref={audioInputRef} type="file" accept="audio/*" onChange={handleAudioSelect} className="hidden" disabled={isUploading} />
                <FileAudio className={`w-8 h-8 mx-auto mb-2 transition-transform ${audioFile ? 'text-emerald-400' : 'text-zinc-600'}`} />
                {audioFile ? (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-emerald-400 font-mono truncate max-w-xs mx-auto">{audioFileName}</p>
                    <p className="text-[10px] text-zinc-500 font-mono">Ready to upload ({audioFileSize})</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-zinc-300 font-medium">Drag & drop your master audio track</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 font-mono uppercase mb-1.5">Cover Art Upload</label>
              <div 
                onDragEnter={handleCoverDrag} onDragOver={handleCoverDrag} onDragLeave={handleCoverDrag} onDrop={handleCoverDrop}
                onClick={() => !isUploading && coverInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                  dragActiveCover ? 'border-emerald-500 bg-emerald-950/10' : coverFile ? 'border-emerald-800/80 bg-zinc-950' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/20'
                }`}
              >
                <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverSelect} className="hidden" disabled={isUploading} />
                <ImageIcon className={`w-8 h-8 mx-auto mb-2 transition-transform ${coverFile ? 'text-emerald-400' : 'text-zinc-600'}`} />
                {coverFile ? (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-emerald-400 font-mono truncate max-w-xs mx-auto">{coverFileName}</p>
                    <p className="text-[10px] text-zinc-500 font-mono">Ready to upload</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-zinc-300 font-medium">Drag cover image or click to browse</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 font-mono uppercase mb-1.5">Song Lyrics</label>
              <textarea
                value={lyrics} disabled={isUploading}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="[Verse 1]&#13;Walking down neon lit streets..."
                className="w-full h-24 bg-zinc-950 border border-zinc-900 focus:border-emerald-500 focus:outline-none rounded-lg p-2.5 text-xs text-white resize-none font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg transition shadow-lg flex items-center justify-center gap-2 cursor-pointer font-mono uppercase tracking-wider disabled:opacity-50"
            >
              {isUploading && <Loader2 className="w-4 h-4 animate-spin text-black" />}
              <span>{isUploading ? 'Uploading Track...' : 'Verify & Publish Track'}</span>
            </button>
          </form>
        </div>

        <div className="lg:col-span-7 bg-zinc-950/40 border border-zinc-900 p-6 rounded-2xl shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <div className="flex items-center gap-2">
              <ListMusic className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Your Catalog Content Control</h3>
            </div>
            <span className="text-[10px] bg-zinc-900 text-zinc-400 border border-zinc-800 px-2.5 py-1 rounded-full font-mono">
              {totalTracks} Tracks Listed
            </span>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[640px] pr-1">
            {artistSongs.length === 0 ? (
              <div className="p-16 text-center rounded-2xl border-2 border-dashed border-zinc-900 bg-zinc-950/10">
                <FileAudio className="w-12 h-12 text-zinc-700 mx-auto mb-3 animate-pulse" />
                <p className="text-sm font-bold text-zinc-400">Your Catalog is Empty</p>
                <p className="text-xs text-zinc-500 font-mono mt-1">Publish your first track using the release pipeline form!</p>
              </div>
            ) : (
              artistSongs.map((song) => {
                const trackRoyalty = Number((song.streams * config.metrics.averagePayoutPerStream).toFixed(2));
                return (
                  <div key={song.id} className="flex flex-col p-4 rounded-xl bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition group gap-4">
                    <div className="flex items-start gap-4">
                      <img src={song.coverUrl} alt={song.title} className="w-12 h-12 rounded-lg object-cover border border-zinc-800 shrink-0 shadow-md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white truncate group-hover:text-emerald-400 transition">{song.title}</span>
                          <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase bg-zinc-900 text-emerald-400 border border-emerald-950">
                            {song.releaseType || 'single'}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-mono truncate mt-0.5">
                          Album: <span className="text-zinc-300">{song.albumName}</span> • Genre: <span className="text-zinc-300">{song.genre || 'Pop'}</span> • Year: <span className="text-zinc-300">{song.releaseYear || '2026'}</span>
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end shrink-0 pl-2">
                        <span className="text-xs font-bold text-emerald-400 font-mono bg-emerald-950/10 border border-emerald-900/30 px-2 py-0.5 rounded">
                          {song.streams.toLocaleString()} streams
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono mt-1.5 font-bold">
                          Earnings: ${trackRoyalty.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-zinc-900/50">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-zinc-500 font-mono">
                          ID: <span className="text-zinc-400 font-bold">{song.id}</span>
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => startEditing(song)} className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-[10px] font-bold font-mono transition flex items-center gap-1 cursor-pointer">
                          <Edit className="w-3.5 h-3.5" /><span>Edit</span>
                        </button>

                        <button onClick={() => triggerTakeDown(song)} className="px-2.5 py-1.5 rounded-lg bg-rose-950/20 hover:bg-rose-900/40 border border-rose-900/30 text-rose-400 hover:text-rose-300 text-[10px] font-bold font-mono transition flex items-center gap-1 cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" /><span>Take Down</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {editingSong && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#121212] border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button onClick={() => setEditingSong(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-3 mb-5 text-emerald-400">
              <Edit className="w-5 h-5" />
              <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">Edit Published Metadata</h3>
            </div>
            <form onSubmit={handleEditSave} className="space-y-4 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 font-mono uppercase mb-1">Track Title</label>
                  <input type="text" required value={editTitle} disabled={isEditing} onChange={(e) => setEditTitle(e.target.value)} className="w-full bg-zinc-950 border border-zinc-900 focus:border-emerald-500 focus:outline-none rounded-lg p-2.5 text-xs text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 font-mono uppercase mb-1">Album Title</label>
                  <input 
                    type="text" 
                    required={editReleaseType === 'album'} 
                    value={editReleaseType === 'single' ? (editTitle ? `${editTitle} - Single` : '') : editAlbumName} 
                    disabled={isEditing || editReleaseType === 'single'} 
                    onChange={(e) => setEditAlbumName(e.target.value)} 
                    className={`w-full bg-zinc-950 border border-zinc-900 focus:border-emerald-500 focus:outline-none rounded-lg p-2.5 text-xs text-white transition-opacity ${editReleaseType === 'single' ? 'opacity-50 cursor-not-allowed' : ''}`} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 font-mono uppercase mb-1">Format</label>
                  <select value={editReleaseType} disabled={isEditing} onChange={(e) => setEditReleaseType(e.target.value as 'single' | 'album')} className="w-full bg-zinc-950 border border-zinc-900 focus:border-emerald-500 focus:outline-none rounded-lg p-2.5 text-xs text-white">
                    <option value="single">Single</option>
                    <option value="album">Album</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 font-mono uppercase mb-1">Genre</label>
                  <input type="text" required value={editGenre} disabled={isEditing} onChange={(e) => setEditGenre(e.target.value)} className="w-full bg-zinc-950 border border-zinc-900 focus:border-emerald-500 focus:outline-none rounded-lg p-2.5 text-xs text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 font-mono uppercase mb-1">Release Year</label>
                  <input type="number" required value={editReleaseYear} disabled={isEditing} onChange={(e) => setEditReleaseYear(e.target.value)} className="w-full bg-zinc-950 border border-zinc-900 focus:border-emerald-500 focus:outline-none rounded-lg p-2.5 text-xs text-white font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 font-mono uppercase mb-1">Lyrics</label>
                <textarea value={editLyrics} disabled={isEditing} onChange={(e) => setEditLyrics(e.target.value)} className="w-full h-32 bg-zinc-950 border border-zinc-900 focus:border-emerald-500 focus:outline-none rounded-lg p-2.5 text-xs text-white resize-none font-mono" />
              </div>
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setEditingSong(null)} className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold rounded-lg border border-zinc-850">Cancel</button>
                <button type="submit" disabled={isEditing} className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg flex items-center justify-center gap-2">
                  {isEditing && <Loader2 className="w-4 h-4 animate-spin text-black" />} Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingSong && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#121212] border border-zinc-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative text-center">
            <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-4">
              <Trash2 className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-white font-sans">Take Down Stream?</h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Are you sure you want to take down <span className="text-white font-bold font-mono">"{deletingSong.title}"</span>?
            </p>
            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setDeletingSong(null)} className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold rounded-lg">No, Keep Track</button>
              <button type="button" disabled={isDeleting} onClick={handleTakeDownConfirm} className="flex-1 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2">
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin text-white" />} Yes, Take Down
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};