import React, { useState, useEffect } from 'react';
import { useMockState } from '../context/MockStateContext';
import './Admin.css';
import { 
  Shield, 
  DollarSign, 
  UserCheck, 
  TrendingUp, 
  Sliders, 
  AlertCircle,
  Check,
  X,
  Sparkles,
  Activity,
  Users,
  Send,
  MessageSquare,
  CheckCircle,
  FileText,
  UploadCloud,
  ChevronRight,
  User,
  Music,
  Headset,
  Coins
} from 'lucide-react';
import { Song, SupportTicket, ArtistApplication, User as AppUser } from '../types';

export const AdminDashboard: React.FC = () => {
  const { 
    currentUser,
    config, 
    updatePrices, 
    applications, 
    handleArtistApplication, 
    users, 
    songs,
    tickets,
    replyToSupportTicket,
    updateTicketStatus,
    adminPublishSong,
    notifications
  } = useMockState();

  // Tab Navigation State
  const [activeTab, setActiveTab] = useState<'artist-mgmt' | 'tickets' | 'auditing' | 'subscriptions'>('artist-mgmt');

  // 1. Artist Management State
  const [subTab, setSubTab] = useState<'submit' | 'metrics'>('submit');
  const [songTitle, setSongTitle] = useState('');
  const [songArtistId, setSongArtistId] = useState('');
  const [songAlbumName, setSongAlbumName] = useState('');
  const [songDuration, setSongDuration] = useState('180');
  const [songLyrics, setSongLyrics] = useState('');
  const [songCoverUrl, setSongCoverUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // 2. Tickets & Approvals State
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [rejectModalAppId, setRejectModalAppId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedPortfolioApp, setSelectedPortfolioApp] = useState<ArtistApplication | null>(null);

  // 3. Auditing & Settlement State
  const [settledArtists, setSettledArtists] = useState<Record<string, boolean>>({});
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutLogs, setPayoutLogs] = useState<string[]>([]);

  // 4. Subscription Configurations State
  const [silverPrice, setSilverPrice] = useState(config.silverPrice.toString());
  const [goldPrice, setGoldPrice] = useState(config.goldPrice.toString());
  const [configSuccess, setConfigSuccess] = useState('');
  const [configError, setConfigError] = useState('');

  // Auto-fill first artist if list changes
  const activeArtists = users.filter(u => u.role === 'artist');
  useEffect(() => {
    if (activeArtists.length > 0 && !songArtistId) {
      setSongArtistId(activeArtists[0].id);
    }
  }, [activeArtists, songArtistId]);

  // Calculations for Stats
  const pendingApps = applications.filter(a => a.status === 'pending');
  const openTickets = tickets.filter(t => t.status !== 'resolved');
  const totalStreamsCount = songs.reduce((acc, s) => acc + s.streams, 0);
  const totalArtistPayouts = Number((totalStreamsCount * config.metrics.averagePayoutPerStream).toFixed(2));
  const platformNetIncome = Number((config.metrics.totalRevenue - totalArtistPayouts).toFixed(2));

  // Pie chart variables
  const listenerUsers = users.filter(u => u.role === 'listener');
  const freeCount = listenerUsers.filter(u => u.tier === 'free').length;
  const silverCount = listenerUsers.filter(u => u.tier === 'silver').length;
  const goldCount = listenerUsers.filter(u => u.tier === 'gold').length;
  const artistCount = activeArtists.length;
  const supportCount = users.filter(u => u.role === 'support').length;
  const adminCount = users.filter(u => u.role === 'admin').length;

  const totalSegments = freeCount + silverCount + goldCount + artistCount || 1;

  // Cover presets
  const coverPresets = [
    { name: 'Cosmic Neon', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80' },
    { name: 'Acoustic Sunset', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80' },
    { name: 'Electro Beats', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80' },
    { name: 'Lo-Fi Chill', url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=300&q=80' },
    { name: 'Synthwave Night', url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&q=80' }
  ];

  useEffect(() => {
    if (!songCoverUrl && coverPresets.length > 0) {
      setSongCoverUrl(coverPresets[0].url);
    }
  }, [songCoverUrl]);

  // Handlers
  const handleMockUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');
    setUploadSuccess(false);

    if (!songTitle.trim()) {
      setUploadError('Song title is required.');
      return;
    }
    if (!songArtistId) {
      setUploadError('Please select a certified artist.');
      return;
    }
    if (!songAlbumName.trim()) {
      setUploadError('Album name is required.');
      return;
    }

    const durationSec = parseInt(songDuration);
    if (isNaN(durationSec) || durationSec <= 0) {
      setUploadError('Duration must be a positive number of seconds.');
      return;
    }

    const selectedArtist = users.find(u => u.id === songArtistId);
    if (!selectedArtist) {
      setUploadError('Selected artist not found.');
      return;
    }

    // Simulate progress bar for file upload
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            adminPublishSong(
              songTitle,
              songArtistId,
              selectedArtist.name,
              songAlbumName,
              durationSec,
              songLyrics,
              songCoverUrl
            );
            setIsUploading(false);
            setUploadSuccess(true);
            // Reset fields
            setSongTitle('');
            setSongAlbumName('');
            setSongLyrics('');
          }, 300);
          return 100;
        }
        return prev + 20;
      });
    }, 150);
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalAppId) return;

    await handleArtistApplication(rejectModalAppId, 'reject', rejectReason || 'Incomplete profile or audio files.');
    setRejectModalAppId(null);
    setRejectReason('');
  };

  const handleTicketReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || !ticketReplyText.trim()) return;

    replyToSupportTicket(selectedTicketId, ticketReplyText);
    setTicketReplyText('');
  };

  const handleSettleAllPayouts = () => {
    // Collect non-settled artists
    const artistEarnings = activeArtists.map(artist => {
      const artistSongs = songs.filter(s => s.artistId === artist.id);
      const artistStreams = artistSongs.reduce((sum, s) => sum + s.streams, 0);
      const royalty = artistStreams * config.metrics.averagePayoutPerStream;
      return { id: artist.id, name: artist.name, royalty };
    });

    const logs: string[] = [];
    artistEarnings.forEach(art => {
      if (art.royalty > 0) {
        logs.push(`Successfully disbursed $${art.royalty.toFixed(2)} to ${art.name} (Direct Deposit completed)`);
      }
    });

    if (logs.length === 0) {
      logs.push("No outstanding royalty streams found to settle at this moment.");
    }

    setPayoutLogs(logs);
    setShowPayoutModal(true);

    // Mark all as settled
    const updatedSettled: Record<string, boolean> = {};
    activeArtists.forEach(art => {
      updatedSettled[art.id] = true;
    });
    setSettledArtists(updatedSettled);
  };

  const handlePriceSave = (e: React.FormEvent) => {
    e.preventDefault();
    setConfigSuccess('');
    setConfigError('');

    const silverVal = parseFloat(silverPrice);
    const goldVal = parseFloat(goldPrice);

    if (isNaN(silverVal) || silverVal <= 0 || isNaN(goldVal) || goldVal <= 0) {
      setConfigError('Prices must be valid positive numbers.');
      return;
    }

    if (silverVal >= goldVal) {
      setConfigError('Gold plan must be priced higher than the Silver plan.');
      return;
    }

    updatePrices(silverVal, goldVal);
    setConfigSuccess('Subscription plans pricing updated and broadcasted to platform listeners!');
    setTimeout(() => setConfigSuccess(''), 4000);
  };

  // SVGs pie calculation helper
  const renderPieChart = () => {
    const radius = 60;
    const strokeWidth = 24;
    const circumference = 2 * Math.PI * radius;

    // Data points
    const data = [
      { name: 'Free Tier', count: freeCount, color: '#4b5563' },
      { name: 'Silver Tier', count: silverCount, color: '#94a3b8' },
      { name: 'Gold VIP', count: goldCount, color: '#eab308' },
      { name: 'Certified Artists', count: artistCount, color: '#10b981' }
    ];

    const total = data.reduce((sum, d) => sum + d.count, 0) || 1;
    let accumulatedAngle = 0;

    return (
      <div className="pie-chart-wrapper">
        <svg width="200" height="200" className="pie-chart-svg" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r={radius} fill="transparent" stroke="#1c1917" strokeWidth={strokeWidth} />
          {data.map((seg, i) => {
            if (seg.count === 0) return null;
            const percentage = seg.count / total;
            const strokeLength = percentage * circumference;
            const strokeOffset = circumference - strokeLength + accumulatedAngle;
            accumulatedAngle -= strokeLength;

            return (
              <circle
                key={i}
                cx="100"
                cy="100"
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${strokeLength} ${circumference}`}
                strokeDashoffset={strokeOffset}
                className="pie-wedge"
                style={{ transformOrigin: 'center' }}
              />
            );
          })}
        </svg>

        <div className="pie-legend">
          {data.map((seg, i) => (
            <div key={i} className="pie-legend-item">
              <span className="pie-legend-color" style={{ backgroundColor: seg.color }} />
              <div className="flex flex-col">
                <span className="text-xs text-zinc-300 font-semibold">{seg.name}</span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {seg.count} users ({((seg.count / total) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render Sub Panels
  const renderArtistMgmtPanel = () => {
    return (
      <div className="space-y-6">
        <div className="admin-panel-header">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Music className="text-emerald-400" />
              Artist Catalog Manager
            </h1>
            <p className="text-xs text-zinc-500 font-mono mt-1">Submit recordings or audit simulated royalty earnings</p>
          </div>

          <div className="flex gap-2 bg-[#09090b] p-1 border border-[#1f1f23] rounded-lg">
            <button
              onClick={() => setSubTab('submit')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                subTab === 'submit' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'
              }`}
            >
              Submit Music
            </button>
            <button
              onClick={() => setSubTab('metrics')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                subTab === 'metrics' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'
              }`}
            >
              Simulated Earnings
            </button>
          </div>
        </div>

        {subTab === 'submit' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 bg-[#121214] border border-[#1f1f23] p-6 rounded-2xl shadow-lg">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-1.5 font-mono">
                <UploadCloud className="w-4 h-4 text-emerald-400" />
                OFFICIAL METADATA INGESTION
              </h3>

              <form onSubmit={handleMockUpload} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Song Title</label>
                    <input
                      type="text"
                      value={songTitle}
                      onChange={(e) => setSongTitle(e.target.value)}
                      placeholder="e.g. Neon Horizons"
                      className="admin-input text-sm"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Target Certified Artist</label>
                    <select
                      value={songArtistId}
                      onChange={(e) => setSongArtistId(e.target.value)}
                      className="admin-input text-sm"
                    >
                      {activeArtists.length === 0 ? (
                        <option value="">No registered artists available</option>
                      ) : (
                        activeArtists.map((art) => (
                          <option key={art.id} value={art.id}>
                            {art.name} ({art.email})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Album / Collection Name</label>
                    <input
                      type="text"
                      value={songAlbumName}
                      onChange={(e) => setSongAlbumName(e.target.value)}
                      placeholder="e.g. Celestial Orbit EP"
                      className="admin-input text-sm"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Length / Duration (seconds)</label>
                    <input
                      type="number"
                      value={songDuration}
                      onChange={(e) => setSongDuration(e.target.value)}
                      className="admin-input text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Song Lyrics</label>
                  <textarea
                    value={songLyrics}
                    onChange={(e) => setSongLyrics(e.target.value)}
                    placeholder="We cruise on lines of gold, through neon streets untold..."
                    className="admin-input h-24 text-xs font-mono resize-none leading-relaxed"
                  />
                </div>

                {/* Cover Select Preset */}
                <div className="admin-form-group">
                  <label className="admin-form-label">Select Ingestion Cover Artwork</label>
                  <div className="grid grid-cols-5 gap-2">
                    {coverPresets.map((preset, index) => (
                      <button
                        type="button"
                        key={index}
                        onClick={() => setSongCoverUrl(preset.url)}
                        className={`relative rounded-lg overflow-hidden h-14 border transition cursor-pointer ${
                          songCoverUrl === preset.url ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-[#1f1f23] opacity-60 hover:opacity-100'
                        }`}
                        title={preset.name}
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] font-bold text-center py-0.5 truncate">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {isUploading && (
                  <div className="space-y-1 bg-zinc-950 p-4 rounded-xl border border-zinc-900">
                    <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                      <span>Uploading Audio Portals...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}

                {uploadError && (
                  <p className="text-xs text-rose-400 font-mono flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {uploadError}
                  </p>
                )}

                {uploadSuccess && (
                  <p className="text-xs text-emerald-400 font-mono flex items-center gap-1 bg-emerald-950/20 p-2 rounded-lg border border-emerald-900/30">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Ingestion successful! Track loaded, catalog indexed, and artist notified.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg transition shadow-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Music className="w-4 h-4" />
                  Publish & Index Recording
                </button>
              </form>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-[#121214] border border-[#1f1f23] p-5 rounded-2xl shadow">
                <h4 className="text-xs font-bold text-zinc-400 font-mono uppercase tracking-wider mb-3">Ingested Cover Live Preview</h4>
                <div className="aspect-square w-full rounded-xl overflow-hidden border border-zinc-800 bg-black relative flex items-center justify-center group shadow-inner">
                  {songCoverUrl ? (
                    <img src={songCoverUrl} alt="Preview" className="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
                  ) : (
                    <UploadCloud className="w-12 h-12 text-zinc-700 animate-pulse" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
                    <span className="text-[10px] text-emerald-400 font-bold font-mono uppercase tracking-widest">INGESTION PREVIEW</span>
                    <h3 className="text-lg font-bold text-white truncate">{songTitle || "Untitled Album Track"}</h3>
                    <p className="text-xs text-zinc-300 font-medium truncate">
                      Artist ID: {users.find(u => u.id === songArtistId)?.name || "Not Designated"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Simulated earnings metrics */
          <div className="space-y-6">
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Artist Name</th>
                    <th>Submited Tracks</th>
                    <th>Simulated Streams</th>
                    <th>Platform Share (30%)</th>
                    <th>Artist Share (70%)</th>
                    <th>Calculated Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {activeArtists.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-zinc-500 font-mono text-xs">
                        No active artist catalogs recorded.
                      </td>
                    </tr>
                  ) : (
                    activeArtists.map((artist) => {
                      const artistSongs = songs.filter(s => s.artistId === artist.id);
                      const artistStreams = artistSongs.reduce((sum, s) => sum + s.streams, 0);
                      const grossRoyalty = artistStreams * config.metrics.averagePayoutPerStream;
                      const platformKeeps = grossRoyalty * 0.3;
                      const artistKeeps = grossRoyalty * 0.7;

                      return (
                        <tr key={artist.id}>
                          <td className="font-semibold text-white">{artist.name}</td>
                          <td className="font-mono text-zinc-400">{artistSongs.length} tracks</td>
                          <td className="font-mono text-zinc-400">{artistStreams.toLocaleString()} plays</td>
                          <td className="font-mono text-rose-400">${platformKeeps.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                          <td className="font-mono text-emerald-400">${artistKeeps.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                          <td className="font-mono text-white font-bold">${grossRoyalty.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTicketsPanel = () => {
    const selectedTicket = tickets.find(t => t.id === selectedTicketId);

    return (
      <div className="space-y-8">
        {/* Section 1: Artist Approvals */}
        <div className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <h2 className="admin-panel-title flex items-center gap-2">
                <UserCheck className="text-rose-400" />
                Artist Credential & Verification Center
              </h2>
              <p className="text-xs text-zinc-500 font-mono mt-1">Review pending application submissions for verification badge approval</p>
            </div>
            <span className="admin-badge admin-badge-pending">{pendingApps.length} pending</span>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Applicant Name</th>
                  <th>Stage Name (Handle)</th>
                  <th>Genre</th>
                  <th>Submitted Bio & Portfolio</th>
                  <th className="text-right">Decisions</th>
                </tr>
              </thead>
              <tbody>
                {pendingApps.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-zinc-500 font-mono text-xs">
                      No verification requests are in queue.
                    </td>
                  </tr>
                ) : (
                  pendingApps.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <div className="font-semibold text-white">{app.userName}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">{app.userEmail}</div>
                      </td>
                      <td className="font-mono text-zinc-200">{app.artistName}</td>
                      <td>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-amber-400 uppercase">
                          {app.genre}
                        </span>
                      </td>
                      <td className="max-w-xs">
                        <div className="text-xs text-zinc-400 italic leading-relaxed truncate" title={app.bio}>
                          &ldquo;{app.bio}&rdquo;
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedPortfolioApp(app)}
                          className="text-emerald-400 hover:text-emerald-300 hover:underline text-[10px] font-bold uppercase tracking-wider font-mono cursor-pointer flex items-center gap-1 mt-1.5"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View Portfolio
                        </button>
                      </td>
                      <td>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setRejectModalAppId(app.id)}
                            className="px-2.5 py-1.5 bg-rose-950/50 hover:bg-rose-950 border border-rose-800/40 rounded-lg text-rose-300 transition text-xs font-semibold cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            onClick={async () => await handleArtistApplication(app.id, 'approve')}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg transition text-xs font-bold shadow-md cursor-pointer flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approve
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Support Ticket Feed and Live Chatbox */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Feed Column */}
          <div className="lg:col-span-5 bg-[#121214] border border-[#1f1f23] p-6 rounded-2xl shadow flex flex-col h-[520px]">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-1.5 font-mono">
              <Headset className="w-4 h-4 text-rose-400" />
              CUSTOMER SUPPORT QUEUE
            </h3>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {tickets.length === 0 ? (
                <div className="text-center py-16 text-zinc-500 text-xs font-mono">No support cases filed.</div>
              ) : (
                tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className={`w-full p-3.5 rounded-xl border text-left transition flex flex-col gap-2 cursor-pointer ${
                      selectedTicketId === ticket.id 
                        ? 'bg-[#1a1a1d] border-zinc-700' 
                        : 'bg-zinc-950/50 border-[#1f1f23] hover:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`admin-badge text-[8px] ${
                        ticket.status === 'resolved' 
                          ? 'admin-badge-resolved' 
                          : ticket.status === 'pending' 
                            ? 'admin-badge-pending' 
                            : 'admin-badge-open'
                      }`}>
                        {ticket.status}
                      </span>
                      <span className="text-[9px] text-zinc-600 font-mono">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white truncate">{ticket.subject}</h4>
                      <p className="text-[10px] text-zinc-500 font-mono truncate">By: {ticket.userName}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chatbox Column */}
          <div className="lg:col-span-7">
            {selectedTicket ? (
              <div className="agent-chat-container">
                <div className="agent-chat-header">
                  <div>
                    <h3 className="text-xs font-bold text-white">Subject: {selectedTicket.subject}</h3>
                    <p className="text-[10px] text-zinc-500 font-mono">
                      User: <strong className="text-zinc-400">{selectedTicket.userName}</strong> ({selectedTicket.userEmail})
                    </p>
                  </div>

                  {/* Status toggle selectors */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-zinc-500 font-mono uppercase">Case Status:</span>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value as any)}
                      className="bg-[#09090b] border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300 font-semibold focus:outline-none focus:border-emerald-500"
                    >
                      <option value="open">Open</option>
                      <option value="pending">Pending</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                {/* Messages Scroller */}
                <div className="agent-chat-messages scrollbar-thin">
                  {/* Initial Ticket Post */}
                  <div className="chat-bubble user">
                    <p className="font-semibold text-zinc-300 text-[10px] mb-1 font-mono uppercase">Original Case File:</p>
                    <p className="leading-relaxed">{selectedTicket.message}</p>
                    <span className="text-[8px] text-zinc-500 block text-right mt-1 font-mono">
                      {new Date(selectedTicket.createdAt).toLocaleTimeString()}
                    </span>
                  </div>

                  {/* Conversation Replies list */}
                  {selectedTicket.replies.map((reply) => (
                    <div 
                      key={reply.id} 
                      className={`chat-bubble ${reply.senderId === currentUser?.id ? 'agent' : 'user'}`}
                    >
                      <p className="font-mono text-[8px] opacity-75 mb-0.5">{reply.senderName}:</p>
                      <p className="leading-relaxed">{reply.message}</p>
                      <span className="text-[8px] opacity-60 block text-right mt-1 font-mono">
                        {new Date(reply.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Reply composers */}
                <form onSubmit={handleTicketReplySubmit} className="agent-chat-composer">
                  <input
                    type="text"
                    value={ticketReplyText}
                    onChange={(e) => setTicketReplyText(e.target.value)}
                    placeholder="Formulate professional agent resolution reply..."
                    className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-lg p-2.5 text-xs text-white outline-none"
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg transition cursor-pointer"
                    title="Send response"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="border border-dashed border-[#1f1f23] rounded-2xl h-[480px] flex flex-col items-center justify-center text-center p-8 bg-[#121214]/30">
                <MessageSquare className="w-12 h-12 text-zinc-700 mb-2 animate-bounce" />
                <h4 className="text-sm font-bold text-white">Support Comms System Offline</h4>
                <p className="text-xs text-zinc-500 max-w-xs mt-1">
                  Select a live help ticket from the customer support queue to open the secure chat interface.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAuditingPanel = () => {
    if (currentUser?.role !== 'admin') {
      return (
        <div className="bg-rose-950/20 border border-rose-900/30 p-6 rounded-2xl text-center">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2 animate-bounce" />
          <h4 className="text-sm font-bold text-white">Access Denied</h4>
          <p className="text-xs text-zinc-500 mt-1 font-mono">This panel is strictly restricted to Admin users only.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="admin-panel-header">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Coins className="text-rose-400" />
              Auditing, Royalty Pools & Settlements
            </h1>
            <p className="text-xs text-zinc-500 font-mono mt-1">Calculate gross licensing revenues and execute secure payout audits</p>
          </div>

          <button
            onClick={handleSettleAllPayouts}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-black text-xs font-bold rounded-lg transition shadow-lg flex items-center gap-1.5 cursor-pointer"
          >
            <Coins className="w-4 h-4" />
            Payout Outstandings
          </button>
        </div>

        {/* Calculations display pills */}
        <div className="payout-calculation-box">
          <h3 className="text-xs font-bold text-zinc-400 font-mono uppercase tracking-wider">Settlement Financial Summary</h3>
          <div className="payout-pills-row">
            <div className="payout-pill">
              <span className="text-[10px] text-zinc-500 font-mono block uppercase">Gross Subscriptions</span>
              <span className="text-xl font-bold text-white">${config.metrics.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            <div className="payout-pill">
              <span className="text-[10px] text-zinc-500 font-mono block uppercase">Artist Royalty Cap (70%)</span>
              <span className="text-xl font-bold text-amber-400">${totalArtistPayouts.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            <div className="payout-pill">
              <span className="text-[10px] text-zinc-500 font-mono block uppercase">Platform Retention (30%)</span>
              <span className="text-xl font-bold text-sky-400">${platformNetIncome.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
          </div>
        </div>

        <div className="admin-panel-card">
          <h3 className="text-sm font-bold text-white mb-4 font-mono uppercase">CERTIFIED ARTIST LEDGER</h3>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Artist Profile</th>
                  <th>Streams Count</th>
                  <th>Gross Royalty Pool Share</th>
                  <th>Direct Deposit Routing</th>
                  <th>Settlement Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {activeArtists.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-zinc-500 font-mono text-xs">
                      No certified artists to audit.
                    </td>
                  </tr>
                ) : (
                  activeArtists.map((artist) => {
                    const artistSongs = songs.filter(s => s.artistId === artist.id);
                    const artistStreams = artistSongs.reduce((sum, s) => sum + s.streams, 0);
                    const grossRoyalty = artistStreams * config.metrics.averagePayoutPerStream;
                    const isSettled = settledArtists[artist.id] || grossRoyalty === 0;

                    return (
                      <tr key={artist.id}>
                        <td>
                          <div className="font-semibold text-white">{artist.name}</div>
                          <div className="text-[9px] text-zinc-500 font-mono">ID: {artist.id}</div>
                        </td>
                        <td className="font-mono text-zinc-400">{artistStreams.toLocaleString()} plays</td>
                        <td className="font-mono text-emerald-400 font-bold">${grossRoyalty.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td className="font-mono text-zinc-500 text-xs">ACH Ending •••• 9801</td>
                        <td>
                          <span className={`admin-badge ${isSettled ? 'admin-badge-approved' : 'admin-badge-pending'}`}>
                            {isSettled ? 'Disbursed' : 'Awaiting Audit'}
                          </span>
                        </td>
                        <td className="text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSettledArtists(prev => ({ ...prev, [artist.id]: true }));
                              const logs = [`Successfully disbursed $${grossRoyalty.toFixed(2)} to ${artist.name} (Direct Deposit completed)`];
                              setPayoutLogs(logs);
                              setShowPayoutModal(true);
                            }}
                            disabled={isSettled}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                              isSettled 
                                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50' 
                                : 'bg-rose-500 hover:bg-rose-400 text-black shadow-lg font-bold'
                            }`}
                          >
                            {isSettled ? 'Settled' : 'Settle'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderSubscriptionPanel = () => {
    if (currentUser?.role !== 'admin') {
      return (
        <div className="bg-rose-950/20 border border-rose-900/30 p-6 rounded-2xl text-center">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2 animate-bounce" />
          <h4 className="text-sm font-bold text-white">Access Denied</h4>
          <p className="text-xs text-zinc-500 mt-1 font-mono">This panel is strictly restricted to Admin users only.</p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="admin-panel-header">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sliders className="text-rose-400" />
              Subscription Controls & Demographics
            </h1>
            <p className="text-xs text-zinc-500 font-mono mt-1">Modify monthly premium subscription limits and view segment shares</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form */}
          <div className="lg:col-span-5 bg-[#121214] border border-[#1f1f23] p-6 rounded-2xl shadow">
            <h3 className="text-sm font-bold text-white mb-4 font-mono uppercase">TIER CONFIGURATION PANEL</h3>

            <form onSubmit={handlePriceSave} className="space-y-4">
              <div className="admin-form-group">
                <label className="admin-form-label">Silver Tier Price ($ / monthly)</label>
                <input
                  type="text"
                  value={silverPrice}
                  onChange={(e) => setSilverPrice(e.target.value)}
                  className="admin-input font-mono text-sm"
                />
                <span className="text-[9px] text-zinc-500 leading-normal">
                  Standard Silver tier lifts playlist creation cap to 100 collections.
                </span>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Gold VIP Tier Price ($ / monthly)</label>
                <input
                  type="text"
                  value={goldPrice}
                  onChange={(e) => setGoldPrice(e.target.value)}
                  className="admin-input font-mono text-sm"
                />
                <span className="text-[9px] text-zinc-500 leading-normal">
                  VIP Gold tier lifts all limitations and provides live song listener statistics panel.
                </span>
              </div>

              {configError && (
                <p className="text-xs text-rose-400 font-mono">{configError}</p>
              )}

              {configSuccess && (
                <p className="text-xs text-emerald-400 font-mono bg-emerald-950/20 p-2 rounded-lg border border-emerald-900/30">
                  {configSuccess}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-500 hover:bg-rose-400 text-black text-xs font-bold rounded-lg transition shadow cursor-pointer"
              >
                Apply Plans Pricing
              </button>
            </form>
          </div>

          {/* SVG Pie Chart */}
          <div className="lg:col-span-7 bg-[#121214] border border-[#1f1f23] p-6 rounded-2xl shadow flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white mb-1 font-mono uppercase">User Tier Distribution</h3>
              <p className="text-xs text-zinc-500">Live share breakdown of registered listeners across platform segments</p>
            </div>

            <div className="py-6 flex justify-center items-center">
              {renderPieChart()}
            </div>

            <div className="pt-4 border-t border-zinc-900 text-center">
              <span className="text-[10px] text-zinc-500 font-mono">
                Total active segments mapped: <strong className="text-white">{totalSegments} tiers</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-dashboard-container animate-in fade-in duration-200">
      {/* Sidebar for Admin controls */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <span className="text-[10px] text-rose-400 font-bold font-mono tracking-widest uppercase block mb-1">
            {currentUser?.role === 'admin' ? 'SECURE OPERATIONS' : 'SUPPORT DESK'}
          </span>
          <h2 className="text-sm font-bold text-white leading-none truncate">
            {currentUser?.role === 'admin' ? 'Admin Controller' : 'Support Console'}
          </h2>
          <span className="text-[9px] text-zinc-500 font-mono mt-1 block truncate">
            Agent: {currentUser?.name}
          </span>
        </div>

        <nav className="admin-sidebar-menu">
          <button
            onClick={() => setActiveTab('artist-mgmt')}
            className={`admin-menu-btn ${activeTab === 'artist-mgmt' ? 'active' : ''}`}
          >
            <Music className="w-4 h-4" />
            <span>Artist Studio Mgmt</span>
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`admin-menu-btn ${activeTab === 'tickets' ? 'active' : ''}`}
          >
            <Headset className="w-4 h-4" />
            <span>Tickets & Approvals</span>
            {pendingApps.length + openTickets.length > 0 && (
              <span className="admin-menu-btn-badge">{pendingApps.length + openTickets.length}</span>
            )}
          </button>

          {currentUser?.role === 'admin' && (
            <>
              <button
                onClick={() => setActiveTab('auditing')}
                className={`admin-menu-btn ${activeTab === 'auditing' ? 'active' : ''}`}
              >
                <Coins className="w-4 h-4" />
                <span>Auditing & Settlement</span>
              </button>

              <button
                onClick={() => setActiveTab('subscriptions')}
                className={`admin-menu-btn ${activeTab === 'subscriptions' ? 'active' : ''}`}
              >
                <Sliders className="w-4 h-4" />
                <span>Plans & Charts</span>
              </button>
            </>
          )}
        </nav>

        <div className="admin-sidebar-footer">
          <span className="text-[9px] text-zinc-500 font-mono">CONNECTION STATUS:</span>
          <span className="text-[10px] text-emerald-400 font-bold font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            LOCAL ENCRYPTED
          </span>
        </div>
      </aside>

      {/* Main Workspace content */}
      <main className="admin-main-content">
        {activeTab === 'artist-mgmt' && renderArtistMgmtPanel()}
        {activeTab === 'tickets' && renderTicketsPanel()}
        {activeTab === 'auditing' && currentUser?.role === 'admin' && renderAuditingPanel()}
        {activeTab === 'subscriptions' && currentUser?.role === 'admin' && renderSubscriptionPanel()}
      </main>

      {/* Rejection Modal */}
      {rejectModalAppId && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <button
              onClick={() => setRejectModalAppId(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4 text-rose-400">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Decline Artist Application</h3>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div className="admin-form-group">
                <label className="admin-form-label">Reason for Rejection (Feedback for Artist)</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Portfolio links are inaccessible. Audio recording files must exceed 128kbps bitrate."
                  className="admin-input h-24 text-xs resize-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalAppId(null)}
                  className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white rounded-lg transition cursor-pointer"
                >
                  Decline Certification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payout Logs Modal */}
      {showPayoutModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card max-w-lg">
            <button
              onClick={() => setShowPayoutModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4 text-emerald-400">
              <CheckCircle className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Secure ACH Royalty Settled</h3>
            </div>

            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 max-h-60 overflow-y-auto space-y-2 scrollbar-thin">
              {payoutLogs.map((log, i) => (
                <div key={i} className="text-[10px] font-mono text-zinc-300 flex items-center gap-2">
                  <span className="text-emerald-500">✔</span>
                  {log}
                </div>
              ))}
            </div>

            <div className="mt-5">
              <button
                onClick={() => setShowPayoutModal(false)}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg transition cursor-pointer"
              >
                Close Audit Records
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Portfolio Modal */}
      {selectedPortfolioApp && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card max-w-md">
            <button
              onClick={() => setSelectedPortfolioApp(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4 text-emerald-400">
              <FileText className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Artist Portfolio Review</h3>
            </div>

            <div className="space-y-4 text-left">
              <div>
                <span className="text-[10px] text-zinc-500 font-mono block uppercase">Applicant Name</span>
                <span className="text-sm font-bold text-white">{selectedPortfolioApp.userName}</span>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 font-mono block uppercase">Stage Handle</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">@{selectedPortfolioApp.artistName}</span>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 font-mono block uppercase">Contact Email</span>
                <span className="text-xs text-zinc-300 font-mono">{selectedPortfolioApp.userEmail}</span>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 font-mono block uppercase">Genre</span>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-amber-400 uppercase mt-1">
                  {selectedPortfolioApp.genre || "Pending Classification"}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 font-mono block uppercase">Biography</span>
                <p className="text-xs text-zinc-300 italic leading-relaxed bg-zinc-950 p-3 rounded-lg border border-zinc-900 mt-1">
                  &ldquo;{selectedPortfolioApp.bio || "No biography provided."}&rdquo;
                </p>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 font-mono block uppercase mb-1.5">Submitted Demo Tracks ({selectedPortfolioApp.portfolioFiles?.length || 0})</span>
                <div className="space-y-1.5">
                  {selectedPortfolioApp.portfolioFiles && selectedPortfolioApp.portfolioFiles.length > 0 ? (
                    selectedPortfolioApp.portfolioFiles.map((fileName, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-zinc-950 border border-zinc-900 rounded-lg">
                        <Music className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs text-zinc-300 font-mono truncate flex-1">{fileName}</span>
                        <span className="text-[8px] text-zinc-500 font-mono uppercase bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">demo</span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-center gap-2 p-2 bg-zinc-950 border border-zinc-900 rounded-lg">
                        <Music className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs text-zinc-300 font-mono truncate flex-1">demo_recording_mix.wav</span>
                        <span className="text-[8px] text-zinc-500 font-mono uppercase bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 font-bold">demo</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-zinc-950 border border-zinc-900 rounded-lg">
                        <Music className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs text-zinc-300 font-mono truncate flex-1">raw_vocal_sample.mp3</span>
                        <span className="text-[8px] text-zinc-500 font-mono uppercase bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 font-bold">demo</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => setSelectedPortfolioApp(null)}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg transition cursor-pointer"
              >
                Close Portfolio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
