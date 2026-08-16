import React from 'react';
import { useMockState } from '../context/MockStateContext';
import { Song } from '../types';
import { X, Mic, Star, Sparkles, ShieldAlert, Heart } from 'lucide-react';

interface LyricsModalProps {
  currentTrack: Song | null;
  isOpen: boolean;
  onClose: () => void;
  onUpgradeTrigger: () => void;
}

export const LyricsModal: React.FC<LyricsModalProps> = ({
  currentTrack,
  isOpen,
  onClose,
  onUpgradeTrigger
}) => {
  const { currentUser, initiateSubscriptionPurchase } = useMockState();
  if (!isOpen || !currentUser) return null;

  const handleUpgradeClick = async (tier: 'silver' | 'gold') => {
    await initiateSubscriptionPurchase(tier);
    onUpgradeTrigger();
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-zinc-950 border-l border-zinc-800 shadow-2xl z-40 flex flex-col h-[calc(100vh-96px)] select-none animate-in slide-in-from-right duration-300">
      
      {/* Header Panel */}
      <div className="p-4 border-b border-zinc-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Live Studio Lyrics</h3>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-900 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        {currentTrack ? (
          <div className="space-y-6">
            {/* Song details */}
            <div className="flex items-center gap-4 bg-zinc-900/40 p-3 rounded-xl border border-zinc-900">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-12 h-12 rounded object-cover shadow-md"
              />
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{currentTrack.title}</h4>
                <p className="text-xs text-zinc-400 truncate">{currentTrack.artistName}</p>
              </div>
            </div>

            {/* Lyrics with Gating Enforcement */}
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono block">
                Lyrics transcript
              </span>

              {/* FREE TIER GATING */}
              {currentUser.tier === 'free' ? (
                <div className="space-y-4">
                  {/* Show first few lines as preview */}
                  <p className="text-zinc-300 font-semibold leading-relaxed blur-[1px]">
                    {(currentTrack.lyrics || '').split('\n').slice(0, 2).map((line, idx) => (
                      <span key={idx} className="block mb-2 text-base">{line}</span>
                    ))}
                  </p>
                  
                  {/* Teaser blur */}
                  <p className="text-zinc-700/40 select-none font-bold select-none leading-relaxed select-none pointer-events-none filter blur-[3.5px]">
                    This is a preview of premium features<br />
                    Upgrade to view full lyrics scrolling live<br />
                    Join Silver or Gold today for full lyrics!
                  </p>

                  {/* High Quality Upgrade Teaser */}
                  <div className="p-5 rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-emerald-900/30 text-center shadow-xl space-y-4">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-sm font-bold text-white">Unlock Lyrics Catalog</h5>
                      <p className="text-xs text-zinc-400 leading-normal">
                        Lyrics view is restricted on Free plan. Upgrade to view full synced lyrics, high-bitrate streaming, and unlimited skips.
                      </p>
                    </div>
                    <div className="space-y-2 pt-1">
                      <button
                        onClick={() => handleUpgradeClick('silver')}
                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg transition cursor-pointer"
                      >
                        Get Silver Plan ($4.99/mo)
                      </button>
                      <button
                        onClick={() => handleUpgradeClick('gold')}
                        className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
                      >
                        Get Gold Premium ($9.99/mo)
                      </button>
                    </div>
                  </div>
                </div>
              ) : currentUser.tier === 'silver' ? (
                /* SILVER TIER: Full static scrollable text */
                <div className="space-y-4">
                  <div className="p-2 bg-zinc-900/30 border border-zinc-800 rounded-lg flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                    <Star className="w-3.5 h-3.5 text-zinc-400 fill-zinc-400" />
                    <span>Silver subscription active. Full lyrics available.</span>
                  </div>
                  <div className="text-zinc-200 text-base leading-relaxed space-y-3 font-medium whitespace-pre-wrap">
                    {currentTrack.lyrics}
                  </div>
                  <div className="p-4 rounded-xl bg-yellow-950/20 border border-yellow-900/40 text-center space-y-2 mt-4">
                    <p className="text-xs text-yellow-300">
                      Want synchronized karaoke-style highlighting?
                    </p>
                    <button
                      onClick={() => handleUpgradeClick('gold')}
                      className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold rounded-full transition cursor-pointer"
                    >
                      Upgrade to Gold
                    </button>
                  </div>
                </div>
              ) : (
                /* GOLD TIER: Dynamic high contrast display with gold sparks! */
                <div className="space-y-4">
                  <div className="p-2.5 bg-yellow-950/40 border border-yellow-800/40 rounded-lg flex items-center gap-2 text-[10px] text-yellow-400 font-mono font-bold">
                    <Star className="w-3.5 h-3.5 fill-yellow-400" />
                    <span>GOLD VIP KARAOKE ON: HI-RES AUDIO ACTIVE</span>
                  </div>
                  <div className="text-yellow-100 text-lg leading-relaxed space-y-4 font-bold font-sans">
                    {(currentTrack.lyrics || '').split('\n').map((line, idx) => {
                      const isActive = idx === 1; // simulation of active karaoke row
                      return (
                        <p 
                          key={idx} 
                          className={`transition duration-300 p-2 rounded-lg ${
                            isActive 
                              ? 'bg-yellow-500 text-black shadow-lg scale-105 transform origin-left border border-yellow-400' 
                              : 'text-zinc-400 hover:text-yellow-100/70'
                          }`}
                        >
                          {line}
                        </p>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 space-y-3">
            <Mic className="w-10 h-10 text-zinc-600 mx-auto" />
            <p className="text-sm font-semibold text-zinc-400">No Song Playing</p>
            <p className="text-xs text-zinc-500 font-mono">Play a track to see lyrics.</p>
          </div>
        )}
      </div>

      {/* Footer support prompt */}
      <div className="p-4 bg-zinc-950 border-t border-zinc-900 text-center">
        <span className="text-[9px] text-zinc-600 font-mono">
          Spotify Phase 1 Mocking Console | Powered by LocalStorage
        </span>
      </div>

    </div>
  );
};
