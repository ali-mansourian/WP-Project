import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../api';
import {
  User,
  Song,
  Album,
  Playlist,
  Notification,
  SupportTicket,
  ArtistApplication,
  SystemConfig,
  UserRole,
  ListenerTier
} from '../types';

// Unsplash high quality placeholder music covers
const COVERS = {
  retro: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80",
  neon: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80",
  ambient: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80",
  acoustic: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&q=80",
  jazz: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&q=80",
  pop: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&q=80"
};

// Default system configurations
const DEFAULT_CONFIG: SystemConfig = {
  silverPrice: 4.99,
  goldPrice: 9.99,
  metrics: {
    totalRevenue: 2450.50,
    artistPayoutRate: 0.70, // 70% goes to artists
    platformKeepRate: 0.30, // 30% goes to platform
    totalStreams: 148200,
    averagePayoutPerStream: 0.0045 // $0.0045 per stream
  }
};

// Initial users pre-loaded in the DB
const DEFAULT_USERS: User[] = [
  {
    id: "usr-free",
    name: "Alex Carter",
    email: "alex@free.com",
    role: "listener",
    tier: "free",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80",
    followedArtists: ["The Synth Project"],
    playlistsCount: 1,
    joinedDate: "2026-01-15"
  },
  {
    id: "usr-silver",
    name: "Sarah Jenkins",
    email: "sarah@silver.com",
    role: "listener",
    tier: "silver",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
    followedArtists: ["Luna Wave", "Echo Drift"],
    playlistsCount: 2,
    joinedDate: "2026-02-10"
  },
  {
    id: "usr-gold",
    name: "Marcus Aurelius",
    email: "marcus@gold.com",
    role: "listener",
    tier: "gold",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
    followedArtists: ["Luna Wave", "The Synth Project"],
    playlistsCount: 3,
    joinedDate: "2025-11-20"
  },
  {
    id: "usr-luna",
    name: "Luna Wave (Artist)",
    email: "luna@artist.com",
    role: "artist",
    tier: "free",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
    followedArtists: [],
    playlistsCount: 0,
    joinedDate: "2025-08-05"
  },
  {
    id: "usr-synth",
    name: "The Synth Project (Artist)",
    email: "synth@artist.com",
    role: "artist",
    tier: "free",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80",
    followedArtists: [],
    playlistsCount: 0,
    joinedDate: "2025-09-12"
  },
  {
    id: "usr-agent",
    name: "Support Agent Dave",
    email: "dave@support.com",
    role: "support",
    tier: "free",
    avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&q=80",
    followedArtists: [],
    playlistsCount: 0,
    joinedDate: "2025-06-01"
  },
  {
    id: "usr-admin",
    name: "Admin Chief",
    email: "admin@spotify.com",
    role: "admin",
    tier: "free",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&q=80",
    followedArtists: [],
    playlistsCount: 0,
    joinedDate: "2025-05-01"
  }
];

// Pre-loaded tracks
const DEFAULT_SONGS: Song[] = [
  {
    id: "sng-1",
    title: "Midnight Drive",
    artistId: "usr-luna",
    artistName: "Luna Wave",
    albumId: "alb-retro-wave",
    albumName: "Neon Highways",
    duration: 194,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    coverUrl: COVERS.neon,
    lyrics: "Cruising down the boulevard at 3 AM\nNeon lights flashing, memories of you again\nMidnight drive, midnight drive\nWe keep the hope alive...",
    streams: 48920,
    releaseDate: "2025-10-15",
    approved: true
  },
  {
    id: "sng-2",
    title: "Starlight Echo",
    artistId: "usr-luna",
    artistName: "Luna Wave",
    albumId: "alb-retro-wave",
    albumName: "Neon Highways",
    duration: 215,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    coverUrl: COVERS.neon,
    lyrics: "Starlight echoing through the empty space\nI can still feel your touch, I can see your face\nFloating through the stratosphere\nI wish you were here...",
    streams: 32040,
    releaseDate: "2025-10-15",
    approved: true
  },
  {
    id: "sng-3",
    title: "Cyber City Dreams",
    artistId: "usr-synth",
    artistName: "The Synth Project",
    albumId: "alb-digital-era",
    albumName: "Digital Era",
    duration: 242,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    coverUrl: COVERS.retro,
    lyrics: "Digital clouds over synthetic trees\nCyber city dreams are blowing in the breeze\nRows of code in a neon glow\nWhere do all the memories go?",
    streams: 27150,
    releaseDate: "2025-12-01",
    approved: true
  },
  {
    id: "sng-4",
    title: "Afterlight",
    artistId: "usr-synth",
    artistName: "The Synth Project",
    albumId: "alb-digital-era",
    albumName: "Digital Era",
    duration: 188,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    coverUrl: COVERS.retro,
    lyrics: "Instrumental synth solo driving through the dusk...\n[Synth waves rising]\nNo more words, just the electric beat\nEchoing off the warm concrete.",
    streams: 19800,
    releaseDate: "2025-12-01",
    approved: true
  },
  {
    id: "sng-5",
    title: "Misty Valleys",
    artistId: "usr-synth",
    artistName: "Echo Drift", // Guest artist / virtual artist
    albumId: "alb-misty",
    albumName: "Misty Valleys",
    duration: 165,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    coverUrl: COVERS.ambient,
    lyrics: "[Acoustic humming]\nMist rises from the valley deep\nWhile the busy city falls asleep\nFind your peace, find your rest\nLay your head upon my chest.",
    streams: 20290,
    releaseDate: "2026-02-14",
    approved: true
  }
];

const DEFAULT_ALBUMS: Album[] = [
  {
    id: "alb-retro-wave",
    title: "Neon Highways",
    artistId: "usr-luna",
    artistName: "Luna Wave",
    coverUrl: COVERS.neon,
    releaseDate: "2025-10-15",
    songIds: ["sng-1", "sng-2"]
  },
  {
    id: "alb-digital-era",
    title: "Digital Era",
    artistId: "usr-synth",
    artistName: "The Synth Project",
    coverUrl: COVERS.retro,
    releaseDate: "2025-12-01",
    songIds: ["sng-3", "sng-4"]
  },
  {
    id: "alb-misty",
    title: "Misty Valleys",
    artistId: "usr-synth",
    artistName: "Echo Drift",
    coverUrl: COVERS.ambient,
    releaseDate: "2026-02-14",
    songIds: ["sng-5"]
  }
];

// Default Playlists
const DEFAULT_PLAYLISTS: Playlist[] = [
  {
    id: "pl-1",
    name: "Alex's Favs",
    userId: "usr-free",
    description: "My favorite lo-fi tracks",
    coverUrl: COVERS.acoustic,
    songIds: ["sng-1", "sng-3"],
    isPublic: true,
    createdAt: "2026-01-20"
  },
  {
    id: "pl-2",
    name: "Sarah's Chill Station",
    userId: "usr-silver",
    description: "Late night drives and relaxing synths",
    coverUrl: COVERS.neon,
    songIds: ["sng-1", "sng-2", "sng-5"],
    isPublic: true,
    createdAt: "2026-02-11"
  },
  {
    id: "pl-3",
    name: "Marcus Elite Collection",
    userId: "usr-gold",
    description: "Gold subscription mood tracks",
    coverUrl: COVERS.pop,
    songIds: ["sng-1", "sng-2", "sng-3", "sng-4", "sng-5"],
    isPublic: true,
    createdAt: "2025-11-25"
  }
];

// Default Notifications
const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: "not-1",
    userId: "usr-free",
    role: "listener",
    title: "Upgrade to Ad-Free Premium",
    message: "Encountering ads and skip limits? Upgrade to Silver for $4.99 or Gold for $9.99 for unrestricted audio!",
    type: "warning",
    read: false,
    createdAt: "2026-07-05T09:00:00"
  },
  {
    id: "not-1-exp",
    userId: "usr-silver",
    role: "listener",
    title: "Subscription Renewal Notice",
    message: "Your Silver plan subscription is expiring in 3 days on 2026-07-09. Standard renewal auto-debit will be processed.",
    type: "warning",
    read: false,
    createdAt: "2026-07-06T01:15:00"
  },
  {
    id: "not-1-rel",
    userId: "all",
    role: "listener",
    title: "New Artist Release: 'Sunset Drift' Single!",
    message: "Luna Echo has just dropped a brand new single 'Sunset Drift'. Stream it now in high-fidelity!",
    type: "success",
    read: false,
    createdAt: "2026-07-06T01:45:00"
  },
  {
    id: "not-2",
    userId: "usr-luna",
    role: "artist",
    title: "Album 'Neon Highways' Approved!",
    message: "Your album has passed review and is generating stream revenue. Current stream rate is $0.0045/stream.",
    type: "success",
    read: false,
    createdAt: "2026-07-04T12:00:00"
  },
  {
    id: "not-2-rej",
    userId: "usr-luna",
    role: "artist",
    title: "Album Artwork Update Requested",
    message: "Your previous album draft was rejected due to blurry artwork. Please re-upload with high-resolution 1:1 image ratios.",
    type: "warning",
    read: false,
    createdAt: "2026-07-05T14:20:00"
  },
  {
    id: "not-2-fin",
    userId: "usr-luna",
    role: "artist",
    title: "Financial Clearance: Stream Revenue Payout Cleared",
    message: "Your financial earnings statement for June 2026 is processed. $245.80 has been deposited to your connected bank account.",
    type: "success",
    read: false,
    createdAt: "2026-07-05T18:00:00"
  },
  {
    id: "not-3",
    userId: "all",
    role: "support",
    title: "New Support Tickets",
    message: "Two unresolved tickets require attention in the Queue.",
    type: "ticket",
    read: false,
    createdAt: "2026-07-05T08:30:00"
  },
  {
    id: "not-admin-tkt",
    userId: "all",
    role: "admin",
    title: "New Ticket Escalation",
    message: "A billing issue has been escalated to administrative review.",
    type: "ticket",
    read: false,
    createdAt: "2026-07-06T00:10:00"
  },
  {
    id: "not-admin-verif",
    userId: "all",
    role: "admin",
    title: "Artist Verification Request Pending",
    message: "New artist registration 'DJ Nebula' is awaiting administrative portfolio audit and approval.",
    type: "warning",
    read: false,
    createdAt: "2026-07-06T01:30:00"
  }
];

// Support Tickets
const DEFAULT_TICKETS: SupportTicket[] = [
  {
    id: "tkt-1",
    userId: "usr-free",
    userName: "Alex Carter",
    userEmail: "alex@free.com",
    subject: "Ad frequency too high",
    message: "Hi, I am hearing ads every two songs on the Free tier. Is this expected or a glitch?",
    status: "open",
    createdAt: "2026-07-04T15:30:00",
    replies: [
      {
        id: "rep-1",
        senderId: "usr-agent",
        senderName: "Support Agent Dave",
        message: "Hi Alex! Yes, on the Free Tier we serve brief audio/banner ads after every few tracks to support our artists. To get rid of ads entirely and stream in High Quality, you might want to look at our Silver tier!",
        createdAt: "2026-07-04T16:45:00"
      }
    ]
  },
  {
    id: "tkt-2",
    userId: "usr-silver",
    userName: "Sarah Jenkins",
    userEmail: "sarah@silver.com",
    subject: "Fidelity issues on Silver plan",
    message: "Sometimes the songs sound like low bitrate. Does Silver support 320kbps or is that Gold-only?",
    status: "open",
    createdAt: "2026-07-05T01:10:00",
    replies: []
  }
];

// Artist Applications
const DEFAULT_APPLICATIONS: ArtistApplication[] = [
  {
    id: "app-1",
    userId: "usr-free",
    userName: "Alex Carter",
    userEmail: "alex@free.com",
    artistName: "MC Carter",
    bio: "Hip-hop producer making lo-fi vibes out of Seattle.",
    genre: "Lo-Fi Hip-Hop",
    status: "pending",
    createdAt: "2026-07-04T22:00:00"
  }
];

// Context Type definition
interface MockStateContextProps {
  currentUser: User | null;
  users: User[];
  songs: Song[];
  albums: Album[];
  playlists: Playlist[];
  notifications: Notification[];
  tickets: SupportTicket[];
  applications: ArtistApplication[];
  config: SystemConfig;
  adminStats: any;
  
  // Auth Functions

  // Auth Functions (Now Async)
  authenticateUser: (email: string, password: string) => Promise<{ success: boolean; message: string; user?: User }>;
  registerListener: (name: string, email: string, password: string, dob: string, gender: string) => Promise<{ success: boolean; message: string; user?: User }>;
  registerArtist: (stageName: string, email: string, password: string, portfolioFiles?: File[]) => Promise<{ success: boolean; message: string; user?: User }>;
  logout: () => Promise<void>;
  switchUser: (userId: string) => void;
  
  // Subscription / Tier Operations
  initiateSubscriptionPurchase: (tier: 'silver' | 'gold') => Promise<void>;
  updatePrices: (silver: number, gold: number) => Promise<{ success: boolean; message: string }>;
  
  // Playlist Operations (Tier Restricted)
  createPlaylist: (name: string, description: string, isPublic?: boolean) => Promise<{ success: boolean; message: string }>;
  deletePlaylist: (playlistId: string | number) => Promise<void>;
  renamePlaylist: (playlistId: string | number, newName: string, newDescription?: string, isPublic?: boolean) => Promise<{ success: boolean; message: string }>;
  addTrackToPlaylist: (playlistId: string | number, songId: string | number) => Promise<{ success: boolean; message: string }>;
  removeTrackFromPlaylist: (playlistId: string | number, songId: string | number) => Promise<void>;
  
  // Social Operations
  toggleFollowArtist: (artistName: string) => void;
  
  // Notifications Operations
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  deleteNotification: (id: string) => void;
  
  // Profile & Account Operations
  updateProfile: (name: string, dob: string, gender: string, avatarUrl?: string) => void;
  deleteAccount: () => Promise<{ success: boolean; message: string }>;
  
  // Ticket / Support Operations
  // Ticket / Support Operations (Connected to Django Backend)
  createSupportTicket: (subject: string, message: string) => Promise<{ success: boolean; message: string }>;
  replyToSupportTicket: (ticketId: string | number, message: string) => Promise<{ success: boolean; message: string }>;
  resolveSupportTicket: (ticketId: string | number) => Promise<{ success: boolean; message: string }>;
  updateTicketStatus: (ticketId: string | number, status: 'open' | 'pending' | 'resolved') => Promise<{ success: boolean; message: string }>;
  
  // Artist Application Operations
  applyForArtist: (artistName: string, bio: string, genre: string) => void;
  handleArtistApplication: (appId: string | number, action: 'approve' | 'reject', rejectionReason?: string) => Promise<void>;
  resetRejectedArtistToListener: () => void;
  
  // Music Release Operations
  uploadSong: (
    title: string, 
    albumName: string, 
    duration: number, 
    lyrics: string, 
    coverUrl?: string,
    extra?: any
  ) => Promise<{ success: boolean; message: string }>;
  updateSong: (songId: string | number, updates: Partial<Song>) => Promise<{ success: boolean; message: string }>;
  deleteSong: (songId: string | number) => Promise<{ success: boolean; message: string }>;
  adminPublishSong: (title: string, artistId: string, artistName: string, albumName: string, duration: number, lyrics: string, coverUrl?: string) => void;
  incrementSongStreams: (songId: string | number, listenedSeconds?: number, durationSeconds?: number) => void;
}

const MockStateContext = createContext<MockStateContextProps | undefined>(undefined);

export const MockStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
  const stored = localStorage.getItem('spotify_mock_current_user');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
});
  const [users, setUsers] = useState<User[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [applications, setApplications] = useState<ArtistApplication[]>([]);
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);
  const [adminStats, setAdminStats] = useState<any>(null);

  // Initialize data from LocalStorage or seed defaults
  // Initialize data from Django Backend
  useEffect(() => {
    // 1. Initialize user from storage instantly to prevent UI flashing
      const storedCurrentUser = localStorage.getItem('spotify_mock_current_user');
      if (storedCurrentUser) {
        try {
          const parsedUser = JSON.parse(storedCurrentUser);
          const normalizedUser = normalizeApiUser(parsedUser);
          setCurrentUser(normalizedUser);
          localStorage.setItem('spotify_mock_current_user', JSON.stringify(normalizedUser));
        } catch {
          setCurrentUser(null);
          localStorage.removeItem('spotify_mock_current_user');
        }
      } else {
        setCurrentUser(null);
      }
    // 2. Fetch live data from Django
    const fetchRealData = async () => {
      // 1. Fetch Public Songs
      try {
        const realSongs = await apiFetch('/api/music/songs/');
        if (Array.isArray(realSongs)) {
          const normalizedSongs = realSongs.map(normalizeApiSong);
          setSongs(normalizedSongs);
          localStorage.setItem('spotify_mock_songs', JSON.stringify(normalizedSongs));
        }
      } catch (error) {
        console.error('Failed to load songs:', error);
      }

      // 2. Fetch Public Albums
      try {
        const realAlbums = await apiFetch('/api/music/albums/');
        if (Array.isArray(realAlbums)) {
          const normalizedAlbums = realAlbums.map(normalizeApiAlbum);
          setAlbums(normalizedAlbums);
          localStorage.setItem('spotify_mock_albums', JSON.stringify(normalizedAlbums));
        }
      } catch (error) {
        console.error('Failed to load albums:', error);
      }

      // If no user is logged in, clear private/user-specific data
      if (!storedCurrentUser) {
        setPlaylists([]);
        setNotifications([]);
        setTickets([]);
        setApplications([]);
        return;
      }

      let parsedUser: any = null;
      try {
        parsedUser = JSON.parse(storedCurrentUser);
      } catch {
        parsedUser = null;
      }

      // 3. Fetch Real Playlists
      try {
        const realPlaylists = await apiFetch('/api/playlists/');
        if (Array.isArray(realPlaylists)) {
          const normalizedPlaylists = realPlaylists.map(normalizeApiPlaylist);
          setPlaylists(normalizedPlaylists);
          localStorage.setItem('spotify_mock_playlists', JSON.stringify(normalizedPlaylists));
        }
      } catch (error) {
        console.warn('Could not load playlists:', error);
        setPlaylists([]);
      }

      // 4. Fetch Real Notifications
      try {
        const realNotifications = await apiFetch('/api/notifications/');
        if (Array.isArray(realNotifications)) {
          const normalizedNotifications = realNotifications.map(normalizeApiNotification);
          setNotifications(normalizedNotifications);
          localStorage.setItem('spotify_mock_notifications', JSON.stringify(normalizedNotifications));
        }
      } catch (error) {
        console.warn('Could not load notifications:', error);
        setNotifications([]);
      }

            // Fetch Real Subscription Plans to sync prices
      try {
        const plans = await apiFetch('/api/subscriptions/plans/');
        if (Array.isArray(plans)) {
          const silverPlan = plans.find((p: any) => p.tier === 'silver');
          const goldPlan = plans.find((p: any) => p.tier === 'gold');
          if (silverPlan && goldPlan) {
            const updatedConfig = {
              ...config,
              silverPrice: Number(silverPlan.price),
              goldPrice: Number(goldPlan.price)
            };
            setConfig(updatedConfig);
            saveToStorage('spotify_mock_config', updatedConfig);
          }
        }
      } catch (err) {
        console.warn("Could not fetch subscription plans:", err);
      }

      // 5. Fetch Real Support Tickets
      // We fetch the list first, then fetch each ticket detail so replies are included.
      try {
        const realTickets = await apiFetch('/api/support/tickets/');
        if (Array.isArray(realTickets)) {
          const detailedTickets = await Promise.all(
            realTickets.map(async (ticket: any) => {
              try {
                return await apiFetch(`/api/support/tickets/${ticket.id}/`);
              } catch {
                return ticket;
              }
            })
          );

          const normalizedTickets = detailedTickets.map(normalizeApiTicket);
          setTickets(normalizedTickets);
          localStorage.setItem('spotify_mock_tickets', JSON.stringify(normalizedTickets));
        }
      } catch (error) {
        console.warn('Could not load support tickets:', error);
        setTickets([]);
      }

      // 6. Fetch Real Artist Applications (Admin/Support only)
      if (parsedUser && (parsedUser.role === 'admin' || parsedUser.role === 'support')) {
        try {
          const realApplications = await apiFetch('/api/auth/admin/artists/');
          if (Array.isArray(realApplications)) {
            const mappedApps: ArtistApplication[] = realApplications.map((u: any) => ({
              id: u.id,
              userId: u.id,
              userName: u.name || u.email || 'Unknown',
              userEmail: u.email || '',
              artistName: u.stage_name || u.name || u.email || 'Unknown Artist',
              bio: u.bio || 'No biography provided.',
              genre: 'Pending Classification',
              status: (u.status === 'rejected' ? 'rejected' : 'pending') as
                | 'pending'
                | 'approved'
                | 'rejected',
              rejectionReason: u.rejection_reason,
              createdAt: u.joined_date || u.created_at || '',
              portfolioFiles: [],
            }));

            setApplications(mappedApps);
            localStorage.setItem('spotify_mock_applications', JSON.stringify(mappedApps));
          }
        } catch (error) {
          console.warn('Could not load artist applications:', error);
          setApplications([]);
        }
              // Fetch Admin Dashboard Data (Admin only)
      if (parsedUser && parsedUser.role === 'admin') {
        try {
          // Fetch all real users for admin management
          const realUsers = await apiFetch('/api/auth/admin/users/');
          if (Array.isArray(realUsers)) {
            const normalizedUsers = realUsers.map(normalizeApiUser);
            setUsers(normalizedUsers);
            saveToStorage('spotify_mock_users', normalizedUsers);
          }

          // Fetch real admin platform stats
          const stats = await apiFetch('/api/analytics/admin/stats/');
          if (stats) {
            setAdminStats(stats);
          }
        } catch (adminError) {
          console.warn('Could not load admin dashboard data:', adminError);
        }
       }
      } else {
        setApplications([]);
      }
    };
    
    fetchRealData();
    
    // 3. Keep mock data for features we haven't wired up to Django yet (Support, Config, Notifications)
    

    setTickets([]);
    
    const storedConfig = localStorage.getItem('spotify_mock_config');
    if (storedConfig) setConfig(JSON.parse(storedConfig));
    else setConfig(DEFAULT_CONFIG);
    
  }, []);

  // Sync state helpers to LocalStorage
  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

// Convert Django API responses into the exact shape expected by the React UI

  const absoluteMediaUrl = (url?: string | null): string => {
    if (!url) return '';
    return url;
  };

  const normalizeApiUser = (raw: any): User => {
    return {
      id: raw.id,
      name: raw.name || raw.stage_name || raw.email || 'User',
      email: raw.email || '',
      role: (raw.role || 'listener') as UserRole,
      tier: (raw.tier || 'free') as ListenerTier,
      avatarUrl:
        absoluteMediaUrl(raw.avatar) ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
      followedArtists: Array.isArray(raw.followed_artists) ? raw.followed_artists : [],
      playlistsCount: Number(raw.playlists_count || 0),
      joinedDate: raw.joined_date || raw.created_at || '',
      token: raw.token,
      status: raw.status as User['status'],
      rejectionReason: raw.rejection_reason,
      dob: raw.date_of_birth || '',
      gender: raw.gender || '',
      stage_name: raw.stage_name,
      stageName: raw.stage_name,
      bio: raw.bio,
    };
  };

  const normalizeApiSong = (raw: any): Song => {
    return {
      id: raw.id,
      title: raw.title || '',
      artistId: raw.artist ?? '',
      artistName: raw.artist_name || '',
      albumId: raw.album ?? null,
      albumName: raw.album_name || '',
      duration: Number(raw.duration || 0),
      audioUrl:
        absoluteMediaUrl(raw.audio_file) ||
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      coverUrl: absoluteMediaUrl(raw.cover) || COVERS.neon,
      lyrics: raw.lyrics || '',
      streams: Number(raw.streams || 0),
      releaseDate: raw.release_date || raw.created_at || '',
      approved: Boolean(raw.approved),
      releaseType: raw.release_type as Song['releaseType'],
      genre: raw.genre,
      releaseYear: raw.release_year != null ? String(raw.release_year) : undefined,
      collaborators: raw.collaborators,
    };
  };

  const normalizeApiAlbum = (raw: any): Album => {
    const normalizedSongs = Array.isArray(raw.songs)
      ? raw.songs.map(normalizeApiSong)
      : [];

    return {
      id: raw.id,
      title: raw.title || '',
      artistId: raw.artist ?? '',
      artistName: raw.artist_name || '',
      coverUrl: absoluteMediaUrl(raw.cover) || COVERS.retro,
      releaseDate: raw.release_date || raw.created_at || '',
      songIds: normalizedSongs.map(song => song.id),
      songs: normalizedSongs,
    };
  };
  const normalizeApiPlaylist = (raw: any): Playlist => {
    const rawSongs = Array.isArray(raw.tracks)
      ? raw.tracks.map((track: any) => track.song).filter(Boolean)
      : Array.isArray(raw.songs)
        ? raw.songs
        : [];

    const normalizedSongs = rawSongs.map(normalizeApiSong);

    return {
      id: raw.id,
      name: raw.title || raw.name || '',
      userId: raw.owner ?? raw.user ?? '',
      description: raw.description || '',
      coverUrl: absoluteMediaUrl(raw.cover) || COVERS.acoustic,
      songIds: normalizedSongs.map(song => song.id),
      songs: normalizedSongs,
      isPublic: raw.visibility === 'public',
      createdAt: raw.created_at || raw.createdAt || '',
    };
  };


  const normalizeApiNotification = (raw: any): Notification => {
    // Map backend types to frontend types
    let frontendType: Notification['type'] = 'info';
    if (raw.type === 'subscription' || raw.type === 'payment') frontendType = 'payment';
    else if (raw.type === 'support') frontendType = 'ticket';
    else if (raw.type === 'artist' || raw.type === 'music') frontendType = 'success';
    else if (raw.type === 'system') frontendType = 'warning';

    return {
      id: raw.id,
      userId: raw.user,
      role: 'listener', // Fallback role for UI compatibility
      title: raw.title || '',
      message: raw.message || '',
      type: frontendType,
      read: Boolean(raw.read),
      createdAt: raw.created_at || '',
    };
  };


  const normalizeApiTicket = (raw: any): SupportTicket => {
    // Map Django status to frontend status
    let frontendStatus: 'open' | 'pending' | 'resolved' = 'open';
    if (raw.status === 'in_progress') frontendStatus = 'pending';
    else if (raw.status === 'resolved' || raw.status === 'closed') frontendStatus = 'resolved';

    const normalizedReplies = Array.isArray(raw.replies)
      ? raw.replies.map((r: any) => ({
          id: r.id,
          senderId: r.author?.id || '',
          senderName: r.author?.name || r.author?.email || 'Unknown',
          message: r.message || '',
          createdAt: r.created_at || '',
        }))
      : [];

    return {
      id: raw.id,
      userId: raw.user?.id || '',
      userName: raw.user?.name || raw.user?.email || 'Unknown',
      userEmail: raw.user?.email || '',
      subject: raw.subject || '',
      message: raw.message || '',
      status: frontendStatus,
      createdAt: raw.created_at || '',
      replies: normalizedReplies,
    };
  };

  // 1. Auth Functions (Connected to Django Backend)
  const authenticateUser = async (email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
    try {
      const data = await apiFetch('/api/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      const user = data.user;
      user.token = data.token; // Save the Django Token
      
      setCurrentUser(user);
      saveToStorage('spotify_mock_current_user', user);
      
      return { success: true, message: "Authentication successful.", user };
    } catch (error: any) {
      return { success: false, message: error.message || "Login failed. Please check your credentials." };
    }
  };

  const registerListener = async (
    name: string, email: string, password: string, dob: string, gender: string
  ): Promise<{ success: boolean; message: string; user?: User }> => {
    try {
      // FIX: Changed from /api/auth/register/ to /api/auth/register/listener/
      const data = await apiFetch('/api/auth/register/listener/', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          name,
          role: 'listener',
          dob,
          gender
        })
      });
      
      const user = data.user;
      user.token = data.token;
      
      setCurrentUser(user);
      saveToStorage('spotify_mock_current_user', user);
      
      return { success: true, message: "Listener account registered successfully!", user };
    } catch (error: any) {
      return { success: false, message: error.message || "Registration failed." };
    }
  };

  const registerArtist = async (
    stageName: string, email: string, password: string, portfolioFiles?: File[]
  ): Promise<{ success: boolean; message: string; user?: User }> => {
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('name', stageName);
      formData.append('role', 'artist');
      formData.append('stage_name', stageName);
      
      if (portfolioFiles && portfolioFiles.length > 0) {
        portfolioFiles.forEach(file => {
          formData.append('portfolio_files', file);
        });
      }

      // FIX: Changed from /api/auth/register/ to /api/auth/register/artist/
      const data = await apiFetch('/api/auth/register/artist/', {
        method: 'POST',
        body: formData 
      });
      
      const user = data.user;
      user.token = data.token;
      
      setCurrentUser(user);
      saveToStorage('spotify_mock_current_user', user);
      
      return { success: true, message: "Artist application submitted successfully. Your account is pending approval!", user };
    } catch (error: any) {
      return { success: false, message: error.message || "Registration failed." };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiFetch('/api/auth/logout/', { method: 'POST' });
    } catch (error) {
      console.warn("Server logout failed, clearing local state anyway.");
    }
    setCurrentUser(null);
    localStorage.removeItem('spotify_mock_current_user');
  };

  const switchUser = (userId: string) => {
    // Note: Mock switching breaks real JWT/Token auth. 
    // If a user clicks the dev switcher, we force a logout so they can log in properly.
    logout();
  };

  // 2. Subscription / Pricing Operations
    // 2. Subscription / Pricing Operations (Connected to Django & Zarinpal)
  const initiateSubscriptionPurchase = async (tier: 'silver' | 'gold'): Promise<void> => {
    try {
      // 1. Fetch active plans to get the correct database ID
      const plans = await apiFetch('/api/subscriptions/plans/');
      const targetPlan = plans.find((p: any) => p.tier === tier && p.is_active);

      if (!targetPlan) {
        alert(`${tier.toUpperCase()} plan is currently unavailable.`);
        return;
      }

      // 2. Request payment URL from Django (which calls Zarinpal)
      const res = await apiFetch('/api/subscriptions/purchase/', {
        method: 'POST',
        body: JSON.stringify({ plan_id: targetPlan.id })
      });

      if (res.payment_url) {
        // 3. Save plan ID for the callback verification page
        localStorage.setItem('pending_subscription_plan_id', targetPlan.id.toString());
        
        // 4. Redirect user to Zarinpal Sandbox
        window.location.href = res.payment_url;
      } else {
        alert(res.error || "Failed to initialize payment gateway.");
      }
    } catch (err: any) {
      console.error("Payment initiation failed:", err);
      alert(err.message || "An error occurred while connecting to the payment gateway.");
    }
  };

  const updatePrices = async (silver: number, gold: number): Promise<{ success: boolean; message: string }> => {
    try {
      const plans = await apiFetch('/api/subscriptions/plans/');
      const silverPlan = plans.find((p: any) => p.tier === 'silver');
      const goldPlan = plans.find((p: any) => p.tier === 'gold');

      if (silverPlan) {
        await apiFetch(`/api/subscriptions/plans/${silverPlan.id}/`, {
          method: 'PATCH',
          body: JSON.stringify({ price: silver })
        });
      }
      if (goldPlan) {
        await apiFetch(`/api/subscriptions/plans/${goldPlan.id}/`, {
          method: 'PATCH',
          body: JSON.stringify({ price: gold })
        });
      }

      const updatedConfig = {
        ...config,
        silverPrice: Number(silver.toFixed(2)),
        goldPrice: Number(gold.toFixed(2))
      };
      setConfig(updatedConfig);
      saveToStorage('spotify_mock_config', updatedConfig);

      // Keep the mock notification for UI feedback
      const systemNotif: Notification = {
        id: `not-${Date.now()}`,
        userId: 'all',
        role: 'listener',
        title: 'Subscription Pricing Update',
        message: `We have updated our premium rates: Silver plan is now $${silver}/mo, and Gold is $${gold}/mo.`,
        type: 'info',
        read: false,
        createdAt: new Date().toISOString()
      };
      const updatedNotifs = [systemNotif, ...notifications];
      setNotifications(updatedNotifs);
      saveToStorage('spotify_mock_notifications', updatedNotifs);

      return { success: true, message: 'Subscription plans pricing updated and broadcasted to platform listeners!' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to update prices.' };
    }
  };

  // 3. Playlist Operations with Tier Enforcement
    // 3. Playlist Operations (Connected to Django Backend)
  const createPlaylist = async (name: string, description: string, isPublic = true): Promise<{ success: boolean; message: string }> => {
    try {
      const payload = {
        title: name,
        description: description || '',
        visibility: isPublic ? 'public' : 'private'
      };
      
      const newPlaylistRaw = await apiFetch('/api/playlists/', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const newPlaylist = normalizeApiPlaylist(newPlaylistRaw);
      const updatedPlaylists = [newPlaylist, ...playlists];
      setPlaylists(updatedPlaylists);
      saveToStorage('spotify_mock_playlists', updatedPlaylists);

      return { success: true, message: "Playlist created successfully!" };
    } catch (err: any) {
      return { success: false, message: err.message || "Failed to create playlist." };
    }
  };

  const deletePlaylist = async (playlistId: string | number): Promise<void> => {
    try {
      await apiFetch(`/api/playlists/${playlistId}/`, { method: 'DELETE' });
      const updatedPlaylists = playlists.filter(p => p.id !== playlistId);
      setPlaylists(updatedPlaylists);
      saveToStorage('spotify_mock_playlists', updatedPlaylists);
    } catch (err: any) {
      console.error("Failed to delete playlist:", err);
    }
  };

  const renamePlaylist = async (playlistId: string | number, newName: string, newDescription?: string, isPublic?: boolean): Promise<{ success: boolean; message: string }> => {
    try {
      const payload: any = { title: newName };
      if (newDescription !== undefined) payload.description = newDescription;
      if (isPublic !== undefined) payload.visibility = isPublic ? 'public' : 'private';

      const updatedRaw = await apiFetch(`/api/playlists/${playlistId}/`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });

      const updatedPlaylist = normalizeApiPlaylist(updatedRaw);
      const updatedPlaylists = playlists.map(p => p.id === playlistId ? updatedPlaylist : p);
      setPlaylists(updatedPlaylists);
      saveToStorage('spotify_mock_playlists', updatedPlaylists);

      return { success: true, message: "Playlist renamed successfully!" };
    } catch (err: any) {
      return { success: false, message: err.message || "Failed to update playlist." };
    }
  };

  const addTrackToPlaylist = async (playlistId: string | number, songId: string | number): Promise<{ success: boolean; message: string }> => {
    try {
      await apiFetch(`/api/playlists/${playlistId}/tracks/`, {
        method: 'POST',
        body: JSON.stringify({ song_id: songId })
      });

      const songToAdd = songs.find(s => s.id === songId);
      const updatedPlaylists = playlists.map(p => {
        if (p.id === playlistId) {
          return {
            ...p,
            songIds: [...p.songIds, songId],
            songs: [...(p.songs || []), ...(songToAdd ? [songToAdd] : [])]
          };
        }
        return p;
      });
      
      setPlaylists(updatedPlaylists);
      saveToStorage('spotify_mock_playlists', updatedPlaylists);
      
      return { success: true, message: "Song added to playlist!" };
    } catch (err: any) {
      return { success: false, message: err.message || "Failed to add song." };
    }
  };

  const removeTrackFromPlaylist = async (playlistId: string | number, songId: string | number): Promise<void> => {
    try {
      await apiFetch(`/api/playlists/${playlistId}/tracks/${songId}/`, { method: 'DELETE' });
      
      const updatedPlaylists = playlists.map(p => {
        if (p.id === playlistId) {
          return {
            ...p,
            songIds: p.songIds.filter(id => id != songId), // use != to handle string/number mismatch safely
            songs: (p.songs || []).filter(s => s.id != songId)
          };
        }
        return p;
      });
      
      setPlaylists(updatedPlaylists);
      saveToStorage('spotify_mock_playlists', updatedPlaylists);
    } catch (err: any) {
      console.error("Failed to remove track:", err);
    }
  };

  // 4. Social Operations
  const toggleFollowArtist = (artistName: string) => {
    if (!currentUser) return;
    const isFollowing = currentUser.followedArtists.includes(artistName);
    const updatedFollows = isFollowing
      ? currentUser.followedArtists.filter(name => name !== artistName)
      : [...currentUser.followedArtists, artistName];

    const updatedUser = { ...currentUser, followedArtists: updatedFollows };
    setCurrentUser(updatedUser);
    saveToStorage('spotify_mock_current_user', updatedUser);

    const updatedUsers = users.map(u => {
      if (u.id === currentUser.id) {
        return updatedUser;
      }
      return u;
    });
    setUsers(updatedUsers);
    saveToStorage('spotify_mock_users', updatedUsers);
  };

  // 5. Notifications Operations
    
  const markNotificationRead = async (id: string | number) => {
    try {
      await apiFetch(`/api/notifications/${id}/read/`, { method: 'POST' });
      const updated = notifications.map(n => {
        if (n.id === id) return { ...n, read: true };
        return n;
      });
      setNotifications(updated);
      saveToStorage('spotify_mock_notifications', updated);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await apiFetch('/api/notifications/mark-all-read/', { method: 'POST' });
      const updated = notifications.map(n => ({ ...n, read: true }));
      setNotifications(updated);
      saveToStorage('spotify_mock_notifications', updated);
    } catch (error) {
      console.error("Failed to clear all notifications:", error);
    }
  };

  const deleteNotification = async (id: string | number) => {
    try {
      await apiFetch(`/api/notifications/${id}/`, { method: 'DELETE' });
      const updated = notifications.filter(n => n.id !== id);
      setNotifications(updated);
      saveToStorage('spotify_mock_notifications', updated);
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const updateProfile = (name: string, dob: string, gender: string, avatarUrl?: string) => {
    if (!currentUser) return;
    const updatedUser = {
      ...currentUser,
      name,
      dob,
      gender,
      avatarUrl: avatarUrl !== undefined ? avatarUrl : currentUser.avatarUrl
    };
    setCurrentUser(updatedUser);
    saveToStorage('spotify_mock_current_user', updatedUser);

    const updatedUsers = users.map(u => {
      if (u.id === currentUser.id) return updatedUser;
      return u;
    });
    setUsers(updatedUsers);
    saveToStorage('spotify_mock_users', updatedUsers);
  };

  const deleteAccount = async (): Promise<{ success: boolean; message: string }> => {
    try {
      // Call the real DELETE endpoint
      await apiFetch('/api/auth/me/', {
        method: 'DELETE',
      });

      // Clear all local state and storage after successful deletion
      setCurrentUser(null);
      setUsers([]);
      setPlaylists([]);
      setNotifications([]);
      setTickets([]);
      setApplications([]);

      localStorage.removeItem('spotify_mock_current_user');
      localStorage.removeItem('spotify_mock_users');
      localStorage.removeItem('spotify_mock_playlists');
      localStorage.removeItem('spotify_mock_notifications');
      localStorage.removeItem('spotify_mock_tickets');
      localStorage.removeItem('spotify_mock_applications');
      localStorage.removeItem('spotify_mock_config');
      localStorage.removeItem('spotify_mock_songs');
      localStorage.removeItem('spotify_mock_albums');

      return { success: true, message: 'Account deleted successfully.' };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to delete account.',
      };
    }
  };
  // 6. Support Ticket Operations
  const createSupportTicket = async (
    subject: string,
    message: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      if (!currentUser) {
        return { success: false, message: 'You must be logged in to create a ticket.' };
      }

      const newTicketRaw = await apiFetch('/api/support/tickets/', {
        method: 'POST',
        body: JSON.stringify({
          subject,
          message,
          category: 'other',
        }),
      });

      const newTicket = normalizeApiTicket(newTicketRaw);

      const updatedTickets = [newTicket, ...tickets];
      setTickets(updatedTickets);
      saveToStorage('spotify_mock_tickets', updatedTickets);

      return {
        success: true,
        message: 'Support ticket submitted successfully!',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to create support ticket.',
      };
    }
  };

  const replyToSupportTicket = async (
    ticketId: string | number,
    message: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      if (!currentUser) {
        return { success: false, message: 'You must be logged in to reply.' };
      }

      await apiFetch(`/api/support/tickets/${ticketId}/replies/`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      });

      // Refetch the ticket detail so replies and status are fully updated
      const updatedTicketRaw = await apiFetch(`/api/support/tickets/${ticketId}/`);
      const updatedTicket = normalizeApiTicket(updatedTicketRaw);

      const updatedTickets = tickets.map(t =>
        t.id === ticketId ? updatedTicket : t
      );

      setTickets(updatedTickets);
      saveToStorage('spotify_mock_tickets', updatedTickets);

      return {
        success: true,
        message: 'Reply sent successfully.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to send reply.',
      };
    }
  };

  const resolveSupportTicket = async (
    ticketId: string | number
  ): Promise<{ success: boolean; message: string }> => {
    return updateTicketStatus(ticketId, 'resolved');
  };
  
  const updateTicketStatus = async (
    ticketId: string | number,
    status: 'open' | 'pending' | 'resolved'
  ): Promise<{ success: boolean; message: string }> => {
    try {
      if (!currentUser) {
        return { success: false, message: 'You must be logged in.' };
      }

      // Map frontend status names to Django backend status names
      const backendStatus =
        status === 'pending'
          ? 'in_progress'
          : status;

      const updatedTicketRaw = await apiFetch(`/api/support/tickets/${ticketId}/`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: backendStatus,
        }),
      });

      const updatedTicket = normalizeApiTicket(updatedTicketRaw);

      const updatedTickets = tickets.map(t =>
        t.id === ticketId ? updatedTicket : t
      );

      setTickets(updatedTickets);
      saveToStorage('spotify_mock_tickets', updatedTickets);

      return {
        success: true,
        message: `Ticket marked as ${status}.`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to update ticket status.',
      };
    }
  };

  // 7. Artist Application Operations
  const applyForArtist = (artistName: string, bio: string, genre: string) => {
    if (!currentUser) return;
    const newApp: ArtistApplication = {
      id: `app-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      artistName,
      bio,
      genre,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const updatedApps = [newApp, ...applications];
    setApplications(updatedApps);
    saveToStorage('spotify_mock_applications', updatedApps);

    // Notify Admin of application
    const adminNotif: Notification = {
      id: `not-${Date.now()}`,
      userId: 'all',
      role: 'admin',
      title: `New Artist Application`,
      message: `${currentUser.name} requested approval to become an artist under name "${artistName}"`,
      type: 'info',
      read: false,
      createdAt: new Date().toISOString()
    };
    const updatedNotifs = [adminNotif, ...notifications];
    setNotifications(updatedNotifs);
    saveToStorage('spotify_mock_notifications', updatedNotifs);
  };

  const handleArtistApplication = async (appId: string | number, action: 'approve' | 'reject', rejectionReason?: string): Promise<void> => {
    try {
      if (action === 'approve') {
        await apiFetch(`/api/auth/admin/artists/${appId}/approve/`, {
          method: 'POST'
        });
      } else {
        await apiFetch(`/api/auth/admin/artists/${appId}/reject/`, {
          method: 'POST',
          body: JSON.stringify({ reason: rejectionReason || 'Incomplete profile details.' })
        });
      }

      // Refresh the applications list from the server
      const realArtists = await apiFetch('/api/auth/admin/artists/');
      if (Array.isArray(realArtists)) {
        const mappedApps: ArtistApplication[] = realArtists.map((u: any) => ({
          id: u.id,
          userId: u.id,
          userName: u.name,
          userEmail: u.email,
          artistName: u.stage_name || u.name,
          bio: u.bio || 'No biography provided.',
          genre: 'Pending Classification',
          status: u.status as 'pending' | 'approved' | 'rejected',
          rejectionReason: u.rejection_reason,
          createdAt: u.joined_date,
        }));
        setApplications(mappedApps);
        saveToStorage('spotify_mock_applications', mappedApps);
      }

      // If the current user was the one being approved/rejected, refresh their session
      if (currentUser && currentUser.id === appId) {
        const meData = await apiFetch('/api/auth/me/');
        if (meData) {
          const updatedUser = { ...currentUser, role: meData.role, status: meData.status };
          setCurrentUser(updatedUser);
          saveToStorage('spotify_mock_current_user', updatedUser);
        }
      }

    } catch (err: any) {
      console.error("Failed to process artist application:", err);
    }
  };

  const resetRejectedArtistToListener = () => {
    if (!currentUser) return;
    const updatedUsers = users.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, role: 'listener' as const, status: 'active' as const, rejectionReason: undefined };
      }
      return u;
    });
    setUsers(updatedUsers);
    saveToStorage('spotify_mock_users', updatedUsers);

    const updatedCurrent = { ...currentUser, role: 'listener' as const, status: 'active' as const, rejectionReason: undefined };
    setCurrentUser(updatedCurrent);
    saveToStorage('spotify_mock_current_user', updatedCurrent);
  };

  // 8. Stream metrics & Artist uploading (Connected to Django Backend)
  const uploadSong = async (
    title: string, 
    albumName: string, 
    duration: number, 
    lyrics: string, 
    coverUrl?: string, // legacy mock parameter
    extra?: any
  ): Promise<{ success: boolean; message: string }> => {
    try {
      if (!currentUser || currentUser.role !== 'artist') throw new Error("Unauthorized.");

      const formData = new FormData();
      formData.append('title', title);
      formData.append('album_name', albumName);
      formData.append('duration', duration.toString());
      if (lyrics) formData.append('lyrics', lyrics);
      if (extra?.genre) formData.append('genre', extra.genre);
      if (extra?.releaseYear) formData.append('release_year', extra.releaseYear.toString());
      if (extra?.releaseType) formData.append('release_type', extra.releaseType);
      if (extra?.collaborators) formData.append('collaborators', extra.collaborators);
      
      // Attach real files
      if (extra?.audioFile) {
        formData.append('audio_file', extra.audioFile);
      } else {
         return { success: false, message: "Real audio file is required." };
      }
      if (extra?.coverFile) {
        formData.append('cover', extra.coverFile);
      }

      const newSong = await apiFetch('/api/music/songs/', {
        method: 'POST',
        body: formData
      });

      const createdSong = normalizeApiSong(newSong);

      const updatedSongs = [createdSong, ...songs];
      setSongs(updatedSongs);
      saveToStorage('spotify_mock_songs', updatedSongs);

      // Refresh albums because the Django backend auto-generates the album relationship
      const realAlbums = await apiFetch('/api/music/albums/');
      const normalizedAlbums = Array.isArray(realAlbums)
        ? realAlbums.map(normalizeApiAlbum)
        : [];

      setAlbums(normalizedAlbums);
      saveToStorage('spotify_mock_albums', normalizedAlbums);

      return { success: true, message: "Track published successfully!" };
    } catch (err: any) {
      return { success: false, message: err.message || "Failed to upload song." };
    }
  };

  const updateSong = async (songId: string | number, updates: Partial<Song>): Promise<{ success: boolean; message: string }> => {
    try {
      // Map frontend camelCase to backend snake_case
      const payload: any = {};
      if (updates.title) payload.title = updates.title;
      if (updates.albumName) payload.album_name = updates.albumName;
      if (updates.lyrics !== undefined) payload.lyrics = updates.lyrics;
      if (updates.genre) payload.genre = updates.genre;
      if (updates.releaseYear) payload.release_year = updates.releaseYear;
      if (updates.releaseType) payload.release_type = updates.releaseType;
      if (updates.collaborators !== undefined) payload.collaborators = updates.collaborators;

      const rawUpdatedSong = await apiFetch(`/api/music/songs/${songId}/`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });

      const normalizedUpdatedSong = normalizeApiSong(rawUpdatedSong);

      const updatedSongs = songs.map(s => s.id === songId ? normalizedUpdatedSong : s);
      setSongs(updatedSongs);
      saveToStorage('spotify_mock_songs', updatedSongs);

      return { success: true, message: "Song updated successfully." };
    } catch (err: any) {
      return { success: false, message: err.message || "Failed to update song." };
    }
  };

  const deleteSong = async (songId: string | number): Promise<{ success: boolean; message: string }> => {
    try {
      await apiFetch(`/api/music/songs/${songId}/`, {
        method: 'DELETE'
      });

      const updatedSongs = songs.filter(s => s.id !== songId);
      setSongs(updatedSongs);
      saveToStorage('spotify_mock_songs', updatedSongs);

      // Refresh albums in case an empty album was auto-deleted by our Django signal
      // Refresh albums in case an empty album was auto-deleted by our Django signal
      const realAlbums = await apiFetch('/api/music/albums/');
      const normalizedAlbums = Array.isArray(realAlbums)
        ? realAlbums.map(normalizeApiAlbum)
        : [];

      setAlbums(normalizedAlbums);
      saveToStorage('spotify_mock_albums', normalizedAlbums);

      return { success: true, message: "Song deleted successfully." };
    } catch (err: any) {
      return { success: false, message: err.message || "Failed to delete song." };
    }
  };

  const adminPublishSong = (title: string, artistId: string, artistName: string, albumName: string, duration: number, lyrics: string, coverUrl?: string) => {
    let album = albums.find(a => a.title.toLowerCase() === albumName.toLowerCase() && a.artistId === artistId);
    let albumId = album?.id || `alb-${Date.now()}`;

    const newSong: Song = {
      id: `sng-${Date.now()}`,
      title,
      artistId,
      artistName,
      albumId,
      albumName,
      duration,
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
      coverUrl: coverUrl || COVERS.pop || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80",
      lyrics: lyrics || "[No Lyrics Provided]",
      streams: 0,
      releaseDate: new Date().toISOString().split('T')[0],
      approved: true
    };

    const updatedSongs = [...songs, newSong];
    setSongs(updatedSongs);
    saveToStorage('spotify_mock_songs', updatedSongs);

    if (!album) {
      const newAlbum: Album = {
        id: albumId,
        title: albumName,
        artistId,
        artistName,
        coverUrl: coverUrl || COVERS.pop || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80",
        releaseDate: new Date().toISOString().split('T')[0],
        songIds: [newSong.id]
      };
      const updatedAlbums = [...albums, newAlbum];
      setAlbums(updatedAlbums);
      saveToStorage('spotify_mock_albums', updatedAlbums);
    } else {
      const updatedAlbums = albums.map(a => {
        if (a.id === albumId) {
          return { ...a, songIds: [...a.songIds, newSong.id] };
        }
        return a;
      });
      setAlbums(updatedAlbums);
      saveToStorage('spotify_mock_albums', updatedAlbums);
    }

    const successNotif: Notification = {
      id: `not-${Date.now()}`,
      userId: artistId,
      role: 'artist',
      title: 'New Track Published on Your Behalf',
      message: `The administration team has uploaded and published "${title}" to your catalog.`,
      type: 'success',
      read: false,
      createdAt: new Date().toISOString()
    };
    const updatedNotifs = [successNotif, ...notifications];
    setNotifications(updatedNotifs);
    saveToStorage('spotify_mock_notifications', updatedNotifs);
  };

  const incrementSongStreams = (songId: string | number, listenedSeconds: number = 10, durationSeconds: number = 0) => {
    if (!currentUser) return;

    // Fire and forget the tracking event to the Django backend
    apiFetch('/api/tracking/plays/', {
      method: 'POST',
      body: JSON.stringify({
        song: songId,
        listened_seconds: Math.floor(listenedSeconds),
        song_duration_seconds: Math.floor(durationSeconds),
        completed: listenedSeconds >= durationSeconds && durationSeconds > 0
      })
    }).then(data => {
      // If the backend returns the updated song with new streams, update local state
      if (data && data.song_details) {
        const updatedSongs = songs.map(s => 
          String(s.id) === String(songId) ? normalizeApiSong(data.song_details) : s
        );
        setSongs(updatedSongs);
        saveToStorage('spotify_mock_songs', updatedSongs);
      }
    }).catch(err => {
      // If it fails (e.g. daily limit reached), the backend returns 403.
      console.warn("Stream tracking failed:", err.message);
    });

    // Optimistically update local stream count for UI responsiveness
    const updatedCurrentUser = {
      ...currentUser,
      dailyStreamsCount: (currentUser.dailyStreamsCount || 0) + 1
    };
    setCurrentUser(updatedCurrentUser);
    saveToStorage('spotify_mock_current_user', updatedCurrentUser);
  };

  return (
      <MockStateContext.Provider value={{
      currentUser,
      users,
      songs,
      albums,
      playlists,
      notifications,
      tickets,
      applications,
      config,
      authenticateUser,
      registerListener,
      registerArtist,
      logout,
      switchUser,
      initiateSubscriptionPurchase,
      updatePrices,
      createPlaylist,
      deletePlaylist,
      renamePlaylist,
      addTrackToPlaylist,
      removeTrackFromPlaylist,
      toggleFollowArtist,
      markNotificationRead,
      clearAllNotifications,
      deleteNotification,
      updateProfile,
      deleteAccount,
      createSupportTicket,
      replyToSupportTicket,
      resolveSupportTicket,
      updateTicketStatus,
      applyForArtist,
      handleArtistApplication,
      resetRejectedArtistToListener,
      uploadSong,
      updateSong,
      deleteSong,
      adminPublishSong,
      incrementSongStreams,
      adminStats
    }}>
      {children}
    </MockStateContext.Provider>
  );
};

export const useMockState = () => {
  const context = useContext(MockStateContext);
  if (context === undefined) {
    throw new Error('useMockState must be used within a MockStateProvider');
  }
  return context;
};
