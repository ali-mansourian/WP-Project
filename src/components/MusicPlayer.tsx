import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useMockState } from '../context/MockStateContext';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Mic, 
  Heart, 
  Plus, 
  Disc,
  Sparkles,
  Shuffle,
  Repeat,
  Repeat1,
  ListMusic,
  X,
  ChevronDown,
  Download,
  Gauge,
  Zap,
  Trash2
} from 'lucide-react';
import { Song } from '../types';
import { useNavigate } from 'react-router-dom';
import './Player.css';

interface MusicPlayerProps {
  currentTrack: Song | null;
  setCurrentTrack: (song: Song | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  playNextTrack: () => void;
  playPrevTrack: () => void;
  onLyricsClick: () => void;
  onAddToPlaylistClick: (songId: string | number) => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  currentTrack,
  setCurrentTrack,
  isPlaying,
  setIsPlaying,
  playNextTrack,
  playPrevTrack,
  onLyricsClick,
  onAddToPlaylistClick
}) => {
  const { currentUser, songs, toggleFollowArtist, incrementSongStreams } = useMockState();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();
  
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [skipsRemaining, setSkipsRemaining] = useState(6);
  const [showSkipAlert, setShowSkipAlert] = useState(false);
  const [streamLogged, setStreamLogged] = useState(false);
  const [showStreamLimitAlert, setShowStreamLimitAlert] = useState(false);

  // Advanced Player States (Bonus Features)
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('all');
  const [queueOpen, setQueueOpen] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  // New Specs: Quality, Crossfade, Speed, Custom Queue
  const [audioQuality, setAudioQuality] = useState<'128k' | '320k' | 'flac'>('320k');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [crossfadeEnabled, setCrossfadeEnabled] = useState(true);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [customQueue, setCustomQueue] = useState<Song[]>([]);

  const [activeColor, setActiveColor] = useState('#10b981');

  // Initialize custom queue when songs change
  useEffect(() => {
    if (songs && songs.length > 0 && customQueue.length === 0) {
      setCustomQueue(songs);
    }
  }, [songs]);

  const getStreamLimit = (tier: string) => {
    if (tier === 'free') return 60;
    if (tier === 'silver') return 100;
    return Infinity;
  };

  const isStreamLimitReached = () => {
    if (!currentUser || currentUser.role !== 'listener') return false;
    const count = currentUser.dailyStreamsCount || 0;
    return count >= getStreamLimit(currentUser.tier);
  };

  // Color Extraction for Dominant Cover Color matching
  useEffect(() => {
    if (!currentTrack || !currentTrack.coverUrl) {
      setActiveColor('#10b981');
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentTrack.coverUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, 1, 1);
          const imageData = ctx.getImageData(0, 0, 1, 1).data;
          const r = imageData[0];
          const g = imageData[1];
          const b = imageData[2];
          
          let finalR = r;
          let finalG = g;
          let finalB = b;
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          if (brightness < 60) {
            finalR = Math.min(255, r + 60);
            finalG = Math.min(255, g + 60);
            finalB = Math.min(255, b + 60);
          } else if (brightness > 220) {
            finalR = Math.max(30, r - 60);
            finalG = Math.max(30, g - 60);
            finalB = Math.max(30, b - 60);
          }
          setActiveColor(`rgb(${finalR}, ${finalG}, ${finalB})`);
        }
      } catch (err) {
        setActiveColor('#10b981');
      }
    };

    img.onerror = () => {
      setActiveColor('#10b981');
    };
  }, [currentTrack]);

  // Volume & Speed updates
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.playbackRate = playbackRate;
    }
  }, [volume, isMuted, playbackRate]);

  // Next Track Logic with Crossfade Support
  const handleNext = useCallback(() => {
    const queueToUse = customQueue.length > 0 ? customQueue : songs;
    if (!currentTrack || queueToUse.length === 0) return;
    
    if (currentUser && currentUser.role === 'listener' && currentUser.tier === 'free') {
      if (skipsRemaining <= 0) {
        setShowSkipAlert(true);
        setTimeout(() => setShowSkipAlert(false), 4000);
        return;
      }
      setSkipsRemaining(prev => prev - 1);
    }

    if (isShuffle) {
      const otherSongs = queueToUse.filter(s => s.id !== currentTrack.id);
      if (otherSongs.length > 0) {
        const randomSong = otherSongs[Math.floor(Math.random() * otherSongs.length)];
        setCurrentTrack(randomSong);
        setIsPlaying(true);
      }
    } else {
      const currentIndex = queueToUse.findIndex(s => s.id === currentTrack.id);
      if (currentIndex !== -1 && currentIndex < queueToUse.length - 1) {
        setCurrentTrack(queueToUse[currentIndex + 1]);
        setIsPlaying(true);
      } else {
        if (repeatMode === 'all') {
          setCurrentTrack(queueToUse[0]);
          setIsPlaying(true);
        } else {
          setIsPlaying(false);
          if (audioRef.current) audioRef.current.pause();
        }
      }
    }
  }, [currentTrack, customQueue, songs, currentUser, skipsRemaining, isShuffle, repeatMode, setCurrentTrack, setIsPlaying]);

  const handlePrev = useCallback(() => {
    const queueToUse = customQueue.length > 0 ? customQueue : songs;
    if (!currentTrack || queueToUse.length === 0) return;

    if (isShuffle) {
      const otherSongs = queueToUse.filter(s => s.id !== currentTrack.id);
      if (otherSongs.length > 0) {
        const randomSong = otherSongs[Math.floor(Math.random() * otherSongs.length)];
        setCurrentTrack(randomSong);
        setIsPlaying(true);
      }
    } else {
      const currentIndex = queueToUse.findIndex(s => s.id === currentTrack.id);
      if (currentIndex > 0) {
        setCurrentTrack(queueToUse[currentIndex - 1]);
        setIsPlaying(true);
      } else {
        if (repeatMode === 'all') {
          setCurrentTrack(queueToUse[queueToUse.length - 1]);
          setIsPlaying(true);
        } else {
          if (audioRef.current) audioRef.current.currentTime = 0;
        }
      }
    }
  }, [currentTrack, customQueue, songs, isShuffle, repeatMode, setCurrentTrack, setIsPlaying]);

  // Audio Event Listeners & Crossfade Handler
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);

      // Smooth Crossfade effect (Last 5 seconds)
      if (crossfadeEnabled && duration > 10 && duration - audio.currentTime <= 5 && duration - audio.currentTime > 0) {
        const fadeRatio = (duration - audio.currentTime) / 5;
        audio.volume = Math.max(0, (isMuted ? 0 : volume) * fadeRatio);
      }
    };

    const handleDurationChange = () => setDuration(audio.duration || currentTrack?.duration || 0);
    const handleEnded = () => {
      audio.volume = isMuted ? 0 : volume; // Reset volume after crossfade
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        handleNext();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    if (currentTrack) {
      const prevSrc = audio.src;
      if (prevSrc !== currentTrack.audioUrl) {
        audio.src = currentTrack.audioUrl;
        audio.load();
        setStreamLogged(false);
      }

      if (isPlaying) {
        if (isStreamLimitReached()) {
          audio.pause();
          setIsPlaying(false);
          setShowStreamLimitAlert(true);
          return;
        }
        audio.play().catch(() => {
          setIsPlaying(false);
        });
      } else {
        audio.pause();
      }
    } else {
      audio.pause();
    }

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack, isPlaying, repeatMode, isShuffle, crossfadeEnabled, duration, volume, isMuted, handleNext]);

  // Keyboard Shortcuts Support (Space, M, Arrow Keys, L, Q)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement).tagName.toLowerCase())) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (currentTrack) setIsPlaying(!isPlaying);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (audioRef.current) {
          audioRef.current.currentTime = Math.min(duration, currentTime + 5);
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (audioRef.current) {
          audioRef.current.currentTime = Math.max(0, currentTime - 5);
        }
      } else if (e.code === 'KeyM') {
        setIsMuted(prev => !prev);
      } else if (e.code === 'KeyL') {
        if (currentTrack) onLyricsClick();
      } else if (e.code === 'KeyQ') {
        setQueueOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTrack, isPlaying, currentTime, duration, setIsPlaying, onLyricsClick]);

  // Increment Streams count
  useEffect(() => {
    let isMounted = true;

    const logStream = async () => {
      if (isPlaying && currentTrack && currentTime > 10 && !streamLogged) {
        setStreamLogged(true); // Set immediately to prevent multiple calls
        
        const result: any = await incrementSongStreams(currentTrack.id);
        
        if (isMounted && result) {
          if (!result.success && result.message === 'limit_reached') {
            setShowStreamLimitAlert(true);
            setIsPlaying(false);
            if (audioRef.current) audioRef.current.pause();
          }
        }
      }
    };
    
    logStream();

    return () => {
      isMounted = false;
    };
  }, [isPlaying, currentTrack, currentTime, streamLogged, incrementSongStreams, setIsPlaying]);

  if (!currentUser) return null;

  const handlePlayPause = () => {
    if (!currentTrack) return;
    if (!isPlaying && isStreamLimitReached()) {
      setShowStreamLimitAlert(true);
      return;
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    setIsMuted(value === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleDownload = () => {
    if (!currentTrack) return;
    const link = document.createElement('a');
    link.href = currentTrack.audioUrl;
    link.download = `${currentTrack.title} - ${currentTrack.artistName}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const removeFromQueue = (songId: string | number) => {
    setCustomQueue(prev => prev.filter(s => s.id !== songId));
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const cycleRepeatMode = () => {
    if (repeatMode === 'all') setRepeatMode('one');
    else if (repeatMode === 'one') setRepeatMode('none');
    else setRepeatMode('all');
  };

  // FIX: Added safe fallback to prevent crash if followedArtists is missing
  const isFollowing = (currentUser.followedArtists || []).includes(currentTrack?.artistName || '');

  return (
    <div style={{ '--active-theme-color': activeColor } as React.CSSProperties}>
      <div 
        className="desktop-player-only h-24 bg-[#181818] fixed bottom-0 left-0 right-0 z-40 px-6 flex items-center justify-between select-none shadow-2xl transition-all duration-300"
        style={{ borderTop: '2px solid var(--active-theme-color)' }}
      >
        {/* Left: Track Details & Heart */}
        <div className="flex items-center gap-4 w-1/4 min-w-[200px]">
          {currentTrack ? (
            <>
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-14 h-14 rounded-md object-cover shadow-lg border border-zinc-850 transition-transform duration-300 hover:scale-105"
              />
              <div className="flex flex-col min-w-0">
                <span 
                  onClick={() => navigate(`/search?q=${encodeURIComponent(currentTrack.title)}`)}
                  className="text-sm font-semibold text-white hover:underline cursor-pointer truncate"
                  title="Search song"
                >
                  {currentTrack.title}
                </span>
                <span 
                  onClick={() => navigate(`/search?q=${encodeURIComponent(currentTrack.artistName)}`)}
                  className="text-xs text-zinc-400 hover:underline cursor-pointer truncate"
                  title="Search artist"
                >
                  {currentTrack.artistName}
                </span>
                {currentTrack.albumName && (
                  <span 
                    onClick={() => navigate(`/search?q=${encodeURIComponent(currentTrack.albumName || '')}`)}
                    className="text-[10px] text-zinc-500 hover:underline cursor-pointer truncate"
                    title="Search album"
                  >
                    {currentTrack.albumName}
                  </span>
                )}
                {currentUser.tier === 'gold' && (
                  <span className="text-[10px] text-amber-400 font-mono font-bold mt-0.5" title="Stream Count">
                    🔥 {currentTrack.streams ? currentTrack.streams.toLocaleString() : 0} streams
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 ml-2">
                <button
                  onClick={() => toggleFollowArtist(currentTrack.artistName)}
                  className="p-1.5 hover:text-white hover:scale-110 transition cursor-pointer"
                  title={isFollowing ? "Unfollow Artist" : "Follow Artist"}
                >
                  <Heart 
                    className="w-4 h-4 transition-colors duration-200"
                    style={{ 
                      color: isFollowing ? 'var(--active-theme-color)' : 'rgb(161, 161, 170)',
                      fill: isFollowing ? 'var(--active-theme-color)' : 'transparent'
                    }} 
                  />
                </button>
                <button
                  onClick={() => onAddToPlaylistClick(currentTrack.id)}
                  className="p-1.5 hover:text-white hover:scale-110 transition cursor-pointer"
                  title="Add to Playlist"
                >
                  <Plus className="w-4 h-4 text-zinc-400 hover:text-white" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded bg-zinc-900 flex items-center justify-center border border-zinc-800">
                <Disc className="w-6 h-6 text-zinc-700 animate-spin-slow" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-500">No Track Selected</span>
                <span className="text-[10px] text-zinc-600 font-mono">Choose a song to start listening</span>
              </div>
            </div>
          )}
        </div>

        {/* Center: Perfectly Symmetric Player Controls */}
        <div className="flex flex-col items-center gap-1.5 flex-1 max-w-xl px-4">
          <div className="flex items-center gap-6 justify-center">
            {/* 1. Shuffle */}
            <button
              onClick={() => setIsShuffle(!isShuffle)}
              className="p-1 transition cursor-pointer hover:scale-110"
              style={{ color: isShuffle ? 'var(--active-theme-color)' : 'rgb(113, 113, 122)' }}
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            {/* 2. Prev */}
            <button
              onClick={handlePrev}
              className="text-zinc-400 hover:text-white transition cursor-pointer hover:scale-110"
              title="Previous Track (Left Arrow)"
              disabled={!currentTrack}
            >
              <SkipBack className="w-5 h-5 shrink-0" />
            </button>
            
            {/* 3. CENTER PLAY/PAUSE BUTTON */}
            <button
              onClick={handlePlayPause}
              className={`w-10 h-10 rounded-full bg-white text-black flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer shadow-lg mx-1 ${
                !currentTrack ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title={isPlaying ? "Pause (Space)" : "Play (Space)"}
              disabled={!currentTrack}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-black text-black" />
              ) : (
                <Play className="w-5 h-5 fill-black text-black translate-x-[1px]" />
              )}
            </button>

            {/* 4. Next */}
            <button
              onClick={handleNext}
              className="text-zinc-400 hover:text-white transition cursor-pointer hover:scale-110 relative"
              title="Next Track (Right Arrow)"
              disabled={!currentTrack}
            >
              <SkipForward className="w-5 h-5 shrink-0" />
              {currentUser.role === 'listener' && currentUser.tier === 'free' && (
                <span className="absolute -top-3.5 -right-3 px-1 py-0.2 rounded bg-amber-500 text-[8px] text-black font-bold font-mono">
                  {skipsRemaining}
                </span>
              )}
            </button>

            {/* 5. Repeat */}
            <button
              onClick={cycleRepeatMode}
              className="p-1 transition cursor-pointer hover:scale-110"
              style={{ color: repeatMode !== 'none' ? 'var(--active-theme-color)' : 'rgb(113, 113, 122)' }}
              title={`Repeat Mode: ${repeatMode}`}
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-4 h-4" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Progress Slider */}
          <div className="w-full flex items-center gap-3">
            <span className="text-[10px] text-zinc-400 font-mono select-none w-8 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              disabled={!currentTrack}
              className="flex-1 h-1 bg-zinc-600 hover:bg-zinc-500 rounded-lg appearance-none cursor-pointer focus:outline-none player-range-input"
              style={{ accentColor: 'var(--active-theme-color)' }}
            />
            <span className="text-[10px] text-zinc-400 font-mono select-none w-8 text-left">
              {formatTime(duration)}
            </span>
          </div>

          {showSkipAlert && (
            <div className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-amber-950/90 border border-amber-800 text-amber-200 text-[11px] px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 animate-bounce">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Skip limit reached (6/hr). Upgrade to Premium to skip unlimited songs!</span>
            </div>
          )}

          {showStreamLimitAlert && (
            <div className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-red-950/95 border border-red-800 text-red-200 text-[11px] px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-bounce z-50">
              <Sparkles className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span>Daily limit reached ({getStreamLimit(currentUser.tier)} streams/day). Upgrade Subscription for unlimited streaming!</span>
              <button onClick={() => setShowStreamLimitAlert(false)} className="ml-2 hover:text-white font-black cursor-pointer text-xs p-1">×</button>
            </div>
          )}
        </div>

        {/* Right Tools (Crossfade, Queue, Speed, Quality, Volume) */}
        <div className="flex items-center gap-3 w-1/4 justify-end min-w-[220px]">
          {/* Crossfade Toggle Button */}
          <button
            onClick={() => setCrossfadeEnabled(!crossfadeEnabled)}
            className="p-1 transition cursor-pointer hover:scale-105 flex items-center gap-0.5 text-[9px] font-mono border rounded px-1.5 py-0.5"
            style={{ 
              color: crossfadeEnabled ? 'var(--active-theme-color)' : 'rgb(113, 113, 122)',
              borderColor: crossfadeEnabled ? 'var(--active-theme-color)' : 'rgb(63, 63, 70)'
            }}
            title="Toggle 5s Crossfade transition"
          >
            <Zap className="w-3 h-3" />
            <span className="font-bold">FADE</span>
          </button>

          {/* Playback Speed Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="p-1 text-zinc-400 hover:text-white transition cursor-pointer text-[10px] font-mono font-bold border border-zinc-800 rounded hover:border-zinc-600 flex items-center gap-1 px-1.5 py-0.5"
              title="Playback Speed"
            >
              <Gauge className="w-3 h-3" />
              <span>{playbackRate}x</span>
            </button>
            {showSpeedMenu && (
              <div className="absolute bottom-10 right-0 bg-zinc-900 border border-zinc-750 rounded-lg p-1.5 shadow-xl z-50 flex flex-col gap-1 w-20 text-center font-mono text-xs">
                {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(speed => (
                  <button
                    key={speed}
                    onClick={() => {
                      setPlaybackRate(speed);
                      setShowSpeedMenu(false);
                    }}
                    className={`px-2 py-1 rounded transition text-[11px] ${
                      playbackRate === speed ? 'bg-zinc-800 font-bold text-emerald-400' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Queue Button */}
          <button
            onClick={() => setQueueOpen(!queueOpen)}
            className="p-1.5 hover:scale-105 transition cursor-pointer"
            style={{ color: queueOpen ? 'var(--active-theme-color)' : 'rgb(161, 161, 170)' }}
            title="Play Queue (Q)"
          >
            <ListMusic className="w-4.5 h-4.5" />
          </button>

          {/* Lyrics Button */}
          <button
            onClick={onLyricsClick}
            className="p-1.5 hover:text-white hover:scale-105 transition cursor-pointer text-zinc-400 relative"
            title="Lyrics Console (L)"
            disabled={!currentTrack}
          >
            <Mic className="w-4.5 h-4.5" />
            {currentUser.tier === 'gold' && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping" />
            )}
          </button>

          {/* Download Music */}
          {currentUser.tier !== 'free' && (
            <button
              onClick={handleDownload}
              className="p-1.5 hover:text-white hover:scale-105 transition cursor-pointer text-zinc-400"
              title="Download Track"
              disabled={!currentTrack}
            >
              <Download className="w-4.5 h-4.5" />
            </button>
          )}

          {/* Volume Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              className="text-zinc-400 hover:text-white transition cursor-pointer"
              title={isMuted ? "Unmute (M)" : "Mute (M)"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-500" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-zinc-600 hover:bg-zinc-500 rounded-lg appearance-none cursor-pointer focus:outline-none"
              style={{ accentColor: 'var(--active-theme-color)' }}
            />
          </div>

          {/* Quality Selector Widget */}
          <div className="relative">
            <div 
              onClick={() => setShowQualityMenu(!showQualityMenu)}
              className="border rounded px-2 py-1 text-[8px] font-mono text-zinc-500 select-none flex flex-col items-center transition-colors cursor-pointer hover:border-white"
              style={{ borderColor: 'var(--active-theme-color)', opacity: 0.9 }}
              title="Change Audio Streaming Quality"
            >
              <span className="leading-none text-zinc-600 uppercase font-bold text-[7px]">FIDELITY</span>
              <span className="mt-0.5 font-bold transition-colors" style={{ color: 'var(--active-theme-color)' }}>
                {audioQuality === 'flac' ? '24-bit FLAC' : audioQuality === '320k' ? '320kbps High' : '128kbps Std'}
              </span>
            </div>

            {showQualityMenu && (
              <div className="absolute bottom-12 right-0 bg-zinc-900 border border-zinc-750 rounded-xl p-2 shadow-2xl z-50 w-36 font-mono text-xs space-y-1">
                <span className="text-[8px] text-zinc-500 uppercase tracking-widest block font-bold px-2 py-1">Audio Quality</span>
                <button
                  onClick={() => { setAudioQuality('128k'); setShowQualityMenu(false); }}
                  className={`w-full text-left px-2 py-1.5 rounded transition text-[10px] ${
                    audioQuality === '128k' ? 'bg-zinc-800 font-bold text-emerald-400' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  128kbps Standard
                </button>
                <button
                  onClick={() => { setAudioQuality('320k'); setShowQualityMenu(false); }}
                  className={`w-full text-left px-2 py-1.5 rounded transition text-[10px] ${
                    audioQuality === '320k' ? 'bg-zinc-800 font-bold text-emerald-400' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  320kbps High Quality
                </button>
                <button
                  onClick={() => { setAudioQuality('flac'); setShowQualityMenu(false); }}
                  className={`w-full text-left px-2 py-1.5 rounded transition text-[10px] ${
                    audioQuality === 'flac' ? 'bg-zinc-800 font-bold text-amber-400' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  24-bit Hi-Res FLAC
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Queue Drawer */}
      {queueOpen && (
        <div 
          className="absolute bottom-24 right-6 w-80 bg-[#121214]/95 backdrop-blur border rounded-xl p-4 shadow-2xl z-50 animate-in slide-in-from-bottom-5 duration-200 transition-colors"
          style={{ borderColor: 'var(--active-theme-color)' }}
        >
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-3">
            <div className="flex items-center gap-1.5">
              <ListMusic className="w-4 h-4" style={{ color: 'var(--active-theme-color)' }} />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Play Queue ({customQueue.length})</h4>
            </div>
            <button
              onClick={() => setQueueOpen(false)}
              className="text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            <div>
              <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-mono font-bold block mb-1">Now Playing</span>
              {currentTrack ? (
                <div className="flex items-center gap-2 p-1.5 rounded bg-zinc-900/50">
                  <img src={currentTrack.coverUrl} className="w-8 h-8 rounded object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold truncate transition-colors" style={{ color: 'var(--active-theme-color)' }}>{currentTrack.title}</p>
                    <p className="text-[9px] text-zinc-500 truncate">{currentTrack.artistName}</p>
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-zinc-600 font-mono italic">No active song</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-mono font-bold block">Up Next</span>
                {customQueue.length > 0 && (
                  <button 
                    onClick={() => setCustomQueue([])} 
                    className="text-[8px] text-zinc-500 hover:text-rose-400 font-mono uppercase"
                  >
                    Clear Queue
                  </button>
                )}
              </div>
              <div className="space-y-1.5">
                {(customQueue.length > 0 ? customQueue : songs).filter(s => s.id !== currentTrack?.id).slice(0, 6).map((song, idx) => (
                  <div 
                    key={song.id} 
                    className="flex items-center justify-between p-1 rounded hover:bg-zinc-900/60 transition group"
                  >
                    <div 
                      onClick={() => {
                        setCurrentTrack(song);
                        setIsPlaying(true);
                      }}
                      className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
                    >
                      <span className="text-[9px] font-mono text-zinc-600 w-3 text-center">{idx + 1}</span>
                      <img src={song.coverUrl} className="w-7 h-7 rounded object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold text-zinc-300 truncate">{song.title}</p>
                        <p className="text-[8px] text-zinc-500 truncate">{song.artistName}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromQueue(song.id)}
                      className="text-zinc-600 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition"
                      title="Remove from queue"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Player Bar */}
      {currentTrack && (
        <div 
          onClick={() => setIsMobileExpanded(true)}
          className="mobile-player-bar-minimal flex md:hidden cursor-pointer"
          style={{ borderTop: '2px solid var(--active-theme-color)' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <img src={currentTrack.coverUrl} className="w-10 h-10 rounded object-cover" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate leading-none mb-1">{currentTrack.title}</p>
              <p className="text-[10px] text-zinc-500 truncate">{currentTrack.artistName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handlePlayPause}
              className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-black text-black" /> : <Play className="w-4 h-4 fill-black text-black translate-x-[0.5px]" />}
            </button>
            <button
              onClick={handleNext}
              className="text-zinc-400 hover:text-white p-1 cursor-pointer"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Expanded Fullscreen Mobile Modal */}
      {isMobileExpanded && currentTrack && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#0c0c0e] text-white p-6 animate-in slide-in-from-bottom duration-300 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setIsMobileExpanded(false)}
              className="p-2 text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
            <div className="text-center">
              <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-bold block">Now Streaming</span>
              <span 
                onClick={() => {
                  navigate(`/search?q=${encodeURIComponent(currentTrack.albumName || '')}`);
                  setIsMobileExpanded(false);
                }}
                className="text-[10px] font-semibold text-zinc-400 truncate max-w-[180px] block hover:underline cursor-pointer"
                title="Search album"
              >
                {currentTrack.albumName}
              </span>
            </div>
            <button
              onClick={() => onAddToPlaylistClick(currentTrack.id)}
              className="p-2 text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-4 space-y-6">
            <div 
              className="relative w-56 h-56 md:w-64 md:h-64 mx-auto rounded-full shadow-2xl overflow-hidden flex items-center justify-center bg-black transition-all duration-500"
              style={{ 
                boxShadow: '0 0 35px var(--active-theme-color)',
                borderColor: 'var(--active-theme-color)',
                borderWidth: '2px'
              }}
            >
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className={`w-full h-full object-cover transition-transform ${
                  isPlaying ? 'animate-spin-slow' : 'animate-spin-slow animate-spin-paused'
                }`}
              />
              <div className="absolute w-12 h-12 rounded-full bg-[#0c0c0e] border-2 border-zinc-900 shadow-inner flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-zinc-850" />
              </div>
            </div>

            <div className="text-center space-y-1.5 w-full px-4">
              <h3 
                onClick={() => {
                  navigate(`/search?q=${encodeURIComponent(currentTrack.title)}`);
                  setIsMobileExpanded(false);
                }}
                className="text-lg font-bold text-white tracking-tight truncate hover:underline cursor-pointer"
                title="Search song"
              >
                {currentTrack.title}
              </h3>
              <p 
                onClick={() => {
                  navigate(`/search?q=${encodeURIComponent(currentTrack.artistName)}`);
                  setIsMobileExpanded(false);
                }}
                className="text-sm text-zinc-400 font-medium truncate hover:underline cursor-pointer inline-block"
                title="Search artist"
              >
                {currentTrack.artistName}
              </p>
            </div>
          </div>

          {/* Interactive Karaoke Sync Lyrics */}
          <div className="p-4 bg-zinc-900/40 rounded-2xl border border-zinc-850/50 space-y-2 mb-6">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <span className="text-[9px] font-mono uppercase font-bold tracking-widest flex items-center gap-1 transition-colors" style={{ color: 'var(--active-theme-color)' }}>
                <Mic className="w-3 h-3" /> Live Interactive Lyrics Sync
              </span>
              <span className="text-[8px] text-zinc-600 font-mono">Click line to seek</span>
            </div>
            <div className="lyrics-scroll-block h-32 overflow-y-auto text-center py-2 text-xs font-semibold leading-relaxed text-zinc-400 space-y-2">
              {currentTrack.lyrics ? (
                currentTrack.lyrics.split('\n').map((line, idx) => {
                  const lines = (currentTrack.lyrics || '').split('\n');
                  const targetTime = (duration / lines.length) * idx;
                  const isActiveLine = idx === Math.min(Math.floor(lines.length * (currentTime / (duration || 1))), lines.length - 1);
                  return (
                    <p 
                      key={idx} 
                      onClick={() => {
                        if (audioRef.current) {
                          audioRef.current.currentTime = targetTime;
                          setCurrentTime(targetTime);
                        }
                      }}
                      className={`transition-all duration-300 cursor-pointer hover:text-white ${
                        isActiveLine ? 'scale-105 font-bold' : 'opacity-45 text-zinc-300'
                      }`}
                      style={{ color: isActiveLine ? 'var(--active-theme-color)' : undefined }}
                    >
                      {line}
                    </p>
                  );
                })
              ) : (
                <p className="text-zinc-600 italic font-mono text-[10px]">No lyrics synced for this production catalog.</p>
              )}
            </div>
          </div>

          <div className="space-y-5 pb-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full player-range-input"
                style={{ accentColor: 'var(--active-theme-color)' }}
              />
            </div>

            <div className="flex items-center justify-between px-4">
              <button
                onClick={() => setIsShuffle(!isShuffle)}
                className="p-2 transition cursor-pointer"
                style={{ color: isShuffle ? 'var(--active-theme-color)' : 'rgb(113, 113, 122)' }}
                title="Shuffle"
              >
                <Shuffle className="w-5 h-5" />
              </button>

              <button
                onClick={handlePrev}
                className="p-2 text-zinc-300 hover:text-white transition cursor-pointer"
                title="Previous"
              >
                <SkipBack className="w-6 h-6 fill-current" />
              </button>

              <button
                onClick={handlePlayPause}
                className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center transition active:scale-95 shadow-xl shadow-white/5 cursor-pointer"
                title="Play / Pause"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-black text-black" /> : <Play className="w-6 h-6 fill-black text-black translate-x-[0.5px]" />}
              </button>

              <button
                onClick={handleNext}
                className="p-2 text-zinc-300 hover:text-white transition cursor-pointer relative"
                title="Next"
              >
                <SkipForward className="w-6 h-6 fill-current" />
              </button>

              <button
                onClick={cycleRepeatMode}
                className="p-2 transition cursor-pointer"
                style={{ color: repeatMode !== 'none' ? 'var(--active-theme-color)' : 'rgb(113, 113, 122)' }}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="w-5 h-5" />
                ) : (
                  <Repeat className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};