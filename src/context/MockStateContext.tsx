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
  
  // Auth Functions

  // Auth Functions (Now Async)
  authenticateUser: (email: string, password: string) => Promise<{ success: boolean; message: string; user?: User }>;
  registerListener: (name: string, email: string, password: string, dob: string, gender: string) => Promise<{ success: boolean; message: string; user?: User }>;
  registerArtist: (stageName: string, email: string, password: string, portfolioFiles?: File[]) => Promise<{ success: boolean; message: string; user?: User }>;
  logout: () => Promise<void>;
  switchUser: (userId: string) => void;
  
  // Subscription / Tier Operations
  upgradeTier: (userId: string, tier: ListenerTier) => void;
  updatePrices: (silver: number, gold: number) => void;
  
  // Playlist Operations (Tier Restricted)
  createPlaylist: (name: string, description: string, isPublic?: boolean) => { success: boolean; message: string };
  deletePlaylist: (playlistId: string) => void;
  renamePlaylist: (playlistId: string, newName: string, newDescription?: string) => { success: boolean; message: string };
  addTrackToPlaylist: (playlistId: string, songId: string) => { success: boolean; message: string };
  removeTrackFromPlaylist: (playlistId: string, songId: string) => void;
  
  // Social Operations
  toggleFollowArtist: (artistName: string) => void;
  
  // Notifications Operations
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  deleteNotification: (id: string) => void;
  
  // Profile & Account Operations
  updateProfile: (name: string, dob: string, gender: string, avatarUrl?: string) => void;
  deleteAccount: (userId: string) => { success: boolean; message: string };
  
  // Ticket / Support Operations
  createSupportTicket: (subject: string, message: string) => void;
  replyToSupportTicket: (ticketId: string, message: string) => void;
  resolveSupportTicket: (ticketId: string) => void;
  updateTicketStatus: (ticketId: string, status: 'open' | 'pending' | 'resolved') => void;
  
  // Artist Application Operations
  applyForArtist: (artistName: string, bio: string, genre: string) => void;
  handleArtistApplication: (appId: string, action: 'approve' | 'reject', rejectionReason?: string) => void;
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
  incrementSongStreams: (songId: string) => void;
}

const MockStateContext = createContext<MockStateContextProps | undefined>(undefined);

export const MockStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [applications, setApplications] = useState<ArtistApplication[]>([]);
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);

  // Initialize data from LocalStorage or seed defaults
  // Initialize data from Django Backend
  useEffect(() => {
    // 1. Initialize user from storage instantly to prevent UI flashing
    const storedCurrentUser = localStorage.getItem('spotify_mock_current_user');
    if (storedCurrentUser) {
      setCurrentUser(JSON.parse(storedCurrentUser));
    } else {
      setCurrentUser(null);
    }

    // 2. Fetch live data from Django
    const fetchRealData = async () => {
      try {
        // Fetch Real Songs
        const realSongs = await apiFetch('/api/music/songs/');
        if (Array.isArray(realSongs)) {
          setSongs(realSongs);
          localStorage.setItem('spotify_mock_songs', JSON.stringify(realSongs));
        }

        // Fetch Real Albums
        const realAlbums = await apiFetch('/api/music/albums/');
        if (Array.isArray(realAlbums)) {
          setAlbums(realAlbums);
          localStorage.setItem('spotify_mock_albums', JSON.stringify(realAlbums));
        }

        // Fetch Real Playlists (Only if authenticated, as it requires a token)
        if (storedCurrentUser) {
          const realPlaylists = await apiFetch('/api/playlists/');
          if (Array.isArray(realPlaylists)) {
            setPlaylists(realPlaylists);
            localStorage.setItem('spotify_mock_playlists', JSON.stringify(realPlaylists));
          }
        }
      } catch (error) {
        console.error("Failed to load data from Django:", error);
      }
    };

    fetchRealData();
    
    // 3. Keep mock data for features we haven't wired up to Django yet (Support, Config, Notifications)
    const storedNotifications = localStorage.getItem('spotify_mock_notifications');
    if (storedNotifications) setNotifications(JSON.parse(storedNotifications));
    else setNotifications(DEFAULT_NOTIFICATIONS);

    const storedTickets = localStorage.getItem('spotify_mock_tickets');
    if (storedTickets) setTickets(JSON.parse(storedTickets));
    else setTickets(DEFAULT_TICKETS);
    
    const storedConfig = localStorage.getItem('spotify_mock_config');
    if (storedConfig) setConfig(JSON.parse(storedConfig));
    else setConfig(DEFAULT_CONFIG);
    
  }, []);

  // Sync state helpers to LocalStorage
  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
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
  const upgradeTier = (userId: string, tier: ListenerTier) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return { ...u, tier };
      }
      return u;
    });
    setUsers(updatedUsers);
    saveToStorage('spotify_mock_users', updatedUsers);

    if (currentUser && currentUser.id === userId) {
      const updatedCurrent = { ...currentUser, tier };
      setCurrentUser(updatedCurrent);
      saveToStorage('spotify_mock_current_user', updatedCurrent);
    }

    // Dynamic Financial Metric Calculations
    // Upgrades bring in revenue! Silver adds $4.99, Gold adds $9.99
    const price = tier === 'silver' ? config.silverPrice : tier === 'gold' ? config.goldPrice : 0;
    if (price > 0) {
      const updatedConfig = {
        ...config,
        metrics: {
          ...config.metrics,
          totalRevenue: Number((config.metrics.totalRevenue + price).toFixed(2))
        }
      };
      setConfig(updatedConfig);
      saveToStorage('spotify_mock_config', updatedConfig);
    }

    // Send a success notification
    const newNotif: Notification = {
      id: `not-${Date.now()}`,
      userId,
      role: 'listener',
      title: `Welcome to ${tier.toUpperCase()} Tier!`,
      message: `Your account was successfully upgraded to ${tier}. Enjoy your premium audio fidelity and extended features!`,
      type: 'success',
      read: false,
      createdAt: new Date().toISOString()
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    saveToStorage('spotify_mock_notifications', updatedNotifs);
  };

  const updatePrices = (silver: number, gold: number) => {
    const updatedConfig = {
      ...config,
      silverPrice: Number(silver.toFixed(2)),
      goldPrice: Number(gold.toFixed(2))
    };
    setConfig(updatedConfig);
    saveToStorage('spotify_mock_config', updatedConfig);

    // Send a system-wide notification to listeners
    const systemNotif: Notification = {
      id: `not-${Date.now()}`,
      userId: 'all',
      role: 'listener',
      title: 'Subscription Pricing Update',
      message: `We have updated our premium rates: Silver plan is now $${silver}/mo, and Gold is $${gold}/mo. Premium listeners continue to enjoy ad-free tracks!`,
      type: 'info',
      read: false,
      createdAt: new Date().toISOString()
    };
    const updatedNotifs = [systemNotif, ...notifications];
    setNotifications(updatedNotifs);
    saveToStorage('spotify_mock_notifications', updatedNotifs);
  };

  // 3. Playlist Operations with Tier Enforcement
  const createPlaylist = (name: string, description: string, isPublic = true): { success: boolean; message: string } => {
    if (!currentUser) return { success: false, message: "User not found." };

    const userPlaylistsCount = playlists.filter(p => p.userId === currentUser.id).length;
    
    if (currentUser.role === 'listener') {
      if (currentUser.tier === 'free' && userPlaylistsCount >= 6) {
        return {
          success: false,
          message: "Free tier limit: Basic accounts can create a maximum of 6 playlists."
        };
      }
      if (currentUser.tier === 'silver' && userPlaylistsCount >= 100) {
        return {
          success: false,
          message: "Silver tier limit: Maximum of 100 playlists allowed. Upgrade to Gold for unlimited creations."
        };
      }
    }

    const newPlaylist: Playlist = {
      id: `pl-${Date.now()}`,
      name,
      userId: currentUser.id,
      description: description || "No description provided.",
      coverUrl: COVERS.acoustic,
      songIds: [],
      isPublic,
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updatedPlaylists = [newPlaylist, ...playlists];
    setPlaylists(updatedPlaylists);
    saveToStorage('spotify_mock_playlists', updatedPlaylists);

    return { success: true, message: "Playlist created successfully!" };
  };

  

  const deletePlaylist = (playlistId: string) => {
    const updatedPlaylists = playlists.filter(p => p.id !== playlistId);
    setPlaylists(updatedPlaylists);
    saveToStorage('spotify_mock_playlists', updatedPlaylists);

    if (currentUser) {
      const updatedUsers = users.map(u => {
        if (u.id === currentUser.id) {
          return { ...u, playlistsCount: Math.max(0, u.playlistsCount - 1) };
        }
        return u;
      });
      setUsers(updatedUsers);
      saveToStorage('spotify_mock_users', updatedUsers);
      setCurrentUser({ ...currentUser, playlistsCount: Math.max(0, currentUser.playlistsCount - 1) });
    }
  };

  const renamePlaylist = (playlistId: string, newName: string, newDescription?: string): { success: boolean; message: string } => {
    if (!newName.trim()) {
      return { success: false, message: "Playlist name cannot be empty." };
    }
    const updatedPlaylists = playlists.map(p => {
      if (p.id === playlistId) {
        return { 
          ...p, 
          name: newName, 
          description: newDescription !== undefined ? newDescription : p.description 
        };
      }
      return p;
    });
    setPlaylists(updatedPlaylists);
    saveToStorage('spotify_mock_playlists', updatedPlaylists);
    return { success: true, message: "Playlist renamed successfully!" };
  };

  const addTrackToPlaylist = (playlistId: string, songId: string): { success: boolean; message: string } => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return { success: false, message: "Playlist not found." };
    if (playlist.songIds.includes(songId)) {
      return { success: false, message: "This song is already in the playlist." };
    }

    const updatedPlaylists = playlists.map(p => {
      if (p.id === playlistId) {
        return { ...p, songIds: [...p.songIds, songId] };
      }
      return p;
    });
    setPlaylists(updatedPlaylists);
    saveToStorage('spotify_mock_playlists', updatedPlaylists);
    return { success: true, message: "Song added to playlist!" };
  };

  const removeTrackFromPlaylist = (playlistId: string, songId: string) => {
    const updatedPlaylists = playlists.map(p => {
      if (p.id === playlistId) {
        return { ...p, songIds: p.songIds.filter(id => id !== songId) };
      }
      return p;
    });
    setPlaylists(updatedPlaylists);
    saveToStorage('spotify_mock_playlists', updatedPlaylists);
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
  const markNotificationRead = (id: string) => {
    const updated = notifications.map(n => {
      if (n.id === id) return { ...n, read: true };
      return n;
    });
    setNotifications(updated);
    saveToStorage('spotify_mock_notifications', updated);
  };

  const clearAllNotifications = () => {
    if (!currentUser) return;
    const updated = notifications.map(n => {
      if (n.userId === currentUser.id || n.role === currentUser.role || n.role === 'all') {
        return { ...n, read: true };
      }
      return n;
    });
    setNotifications(updated);
    saveToStorage('spotify_mock_notifications', updated);
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    saveToStorage('spotify_mock_notifications', updated);
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

  const deleteAccount = (userId: string): { success: boolean; message: string } => {
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    saveToStorage('spotify_mock_users', updatedUsers);
    
    const updatedPlaylists = playlists.filter(p => p.userId !== userId);
    setPlaylists(updatedPlaylists);
    saveToStorage('spotify_mock_playlists', updatedPlaylists);
    
    if (currentUser && currentUser.id === userId) {
      logout();
    }
    return { success: true, message: "Account deleted successfully." };
  };

  // 6. Support Ticket Operations
  const createSupportTicket = (subject: string, message: string) => {
    if (!currentUser) return;
    const newTicket: SupportTicket = {
      id: `tkt-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      subject,
      message,
      status: 'open',
      createdAt: new Date().toISOString(),
      replies: []
    };

    const updatedTickets = [newTicket, ...tickets];
    setTickets(updatedTickets);
    saveToStorage('spotify_mock_tickets', updatedTickets);

    // Add notification to Support Staff
    const staffNotif: Notification = {
      id: `not-${Date.now()}`,
      userId: 'all',
      role: 'support',
      title: `New Support Ticket: ${subject}`,
      message: `User ${currentUser.name} has submitted a support ticket about: "${subject}"`,
      type: 'ticket',
      read: false,
      createdAt: new Date().toISOString()
    };
    const updatedNotifs = [staffNotif, ...notifications];
    setNotifications(updatedNotifs);
    saveToStorage('spotify_mock_notifications', updatedNotifs);
  };

  const replyToSupportTicket = (ticketId: string, message: string) => {
    if (!currentUser) return;
    const updatedTickets = tickets.map(t => {
      if (t.id === ticketId) {
        const reply = {
          id: `rep-${Date.now()}`,
          senderId: currentUser.id,
          senderName: currentUser.name,
          message,
          createdAt: new Date().toISOString()
        };
        // If support staff replies, status becomes 'pending', if user replies, back to 'open'
        const newStatus = currentUser.role === 'support' ? 'pending' as const : 'open' as const;
        return {
          ...t,
          status: newStatus,
          replies: [...t.replies, reply]
        };
      }
      return t;
    });
    setTickets(updatedTickets);
    saveToStorage('spotify_mock_tickets', updatedTickets);

    // Notify the receiver
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      const isAgent = currentUser.role === 'support';
      const receiverId = isAgent ? ticket.userId : 'all';
      const receiverRole = isAgent ? 'listener' as const : 'support' as const;

      const replyNotif: Notification = {
        id: `not-${Date.now()}`,
        userId: receiverId,
        role: receiverRole,
        title: `Reply on ticket: ${ticket.subject}`,
        message: `${currentUser.name} replied: "${message.substring(0, 45)}..."`,
        type: 'ticket',
        read: false,
        createdAt: new Date().toISOString()
      };
      const updatedNotifs = [replyNotif, ...notifications];
      setNotifications(updatedNotifs);
      saveToStorage('spotify_mock_notifications', updatedNotifs);
    }
  };

  const resolveSupportTicket = (ticketId: string) => {
    const updatedTickets = tickets.map(t => {
      if (t.id === ticketId) {
        return { ...t, status: 'resolved' as const };
      }
      return t;
    });
    setTickets(updatedTickets);
    saveToStorage('spotify_mock_tickets', updatedTickets);
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

  const handleArtistApplication = (appId: string, action: 'approve' | 'reject', rejectionReason?: string) => {
    const application = applications.find(a => a.id === appId);
    if (!application) return;

    const updatedApps = applications.map(a => {
      if (a.id === appId) {
        return { 
          ...a, 
          status: (action === 'approve' ? 'approved' : 'rejected') as any,
          rejectionReason: rejectionReason || undefined
        };
      }
      return a;
    });
    setApplications(updatedApps);
    saveToStorage('spotify_mock_applications', updatedApps);

    if (action === 'approve') {
      // Upgrade user's role to artist!
      const updatedUsers = users.map(u => {
        if (u.id === application.userId) {
          return { ...u, role: 'artist' as const, name: application.artistName, status: 'active' as const };
        }
        return u;
      });
      setUsers(updatedUsers);
      saveToStorage('spotify_mock_users', updatedUsers);

      // If active user is the applicant, update active user state immediately
      if (currentUser && currentUser.id === application.userId) {
        const updatedCurrent = { ...currentUser, role: 'artist' as const, name: application.artistName, status: 'active' as const };
        setCurrentUser(updatedCurrent);
        saveToStorage('spotify_mock_current_user', updatedCurrent);
      }

      // Notify the User of successful approval
      const successNotif: Notification = {
        id: `not-${Date.now()}`,
        userId: application.userId,
        role: 'artist',
        title: `Artist Profile Approved!`,
        message: `Congratulations! Your request to become an artist has been approved. You can now publish tracks as "${application.artistName}".`,
        type: 'success',
        read: false,
        createdAt: new Date().toISOString()
      };
      const updatedNotifs = [successNotif, ...notifications];
      setNotifications(updatedNotifs);
      saveToStorage('spotify_mock_notifications', updatedNotifs);
    } else {
      // Update applicant user's status to 'rejected'
      const updatedUsers = users.map(u => {
        if (u.id === application.userId) {
          return { ...u, status: 'rejected' as const, rejectionReason: rejectionReason || "Incomplete profile details" };
        }
        return u;
      });
      setUsers(updatedUsers);
      saveToStorage('spotify_mock_users', updatedUsers);

      // If active user is the applicant, update active user state immediately
      if (currentUser && currentUser.id === application.userId) {
        const updatedCurrent = { ...currentUser, status: 'rejected' as const, rejectionReason: rejectionReason || "Incomplete profile details" };
        setCurrentUser(updatedCurrent);
        saveToStorage('spotify_mock_current_user', updatedCurrent);
      }

      // Notify of rejection with reason
      const failNotif: Notification = {
        id: `not-${Date.now()}`,
        userId: application.userId,
        role: 'listener',
        title: `Artist Application Rejected`,
        message: `Your artist request for "${application.artistName}" was reviewed and declined. Reason: ${rejectionReason || 'Incomplete profile details.'}`,
        type: 'warning',
        read: false,
        createdAt: new Date().toISOString()
      };
      const updatedNotifs = [failNotif, ...notifications];
      setNotifications(updatedNotifs);
      saveToStorage('spotify_mock_notifications', updatedNotifs);
    }
  };

  const updateTicketStatus = (ticketId: string, status: 'open' | 'pending' | 'resolved') => {
    const updatedTickets = tickets.map(t => {
      if (t.id === ticketId) {
        return { ...t, status };
      }
      return t;
    });
    setTickets(updatedTickets);
    saveToStorage('spotify_mock_tickets', updatedTickets);

    // Notify user of status change
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      const statusNotif: Notification = {
        id: `not-${Date.now()}`,
        userId: ticket.userId,
        role: 'listener',
        title: `Support Ticket Updated`,
        message: `Your ticket regarding "${ticket.subject}" has been marked as ${status.toUpperCase()} by the support team.`,
        type: 'info',
        read: false,
        createdAt: new Date().toISOString()
      };
      const updatedNotifs = [statusNotif, ...notifications];
      setNotifications(updatedNotifs);
      saveToStorage('spotify_mock_notifications', updatedNotifs);
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
        formData.append('cover_image', extra.coverFile);
      }

      const newSong = await apiFetch('/api/music/songs/', {
        method: 'POST',
        body: formData // Let the browser set Content-Type for FormData
      });

      const updatedSongs = [...songs, newSong];
      setSongs(updatedSongs);
      saveToStorage('spotify_mock_songs', updatedSongs);

      // Refresh albums because the Django backend auto-generates the album relationship
      const realAlbums = await apiFetch('/api/music/albums/');
      setAlbums(realAlbums);
      saveToStorage('spotify_mock_albums', realAlbums);

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

      const updatedSong = await apiFetch(`/api/music/songs/${songId}/`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });

      const updatedSongs = songs.map(s => s.id === songId ? updatedSong : s);
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
      const realAlbums = await apiFetch('/api/music/albums/');
      setAlbums(realAlbums);
      saveToStorage('spotify_mock_albums', realAlbums);

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

  const incrementSongStreams = (songId: string) => {
    if (!currentUser) return;

    const currentDailyCount = currentUser.dailyStreamsCount || 0;

    if (currentUser.role === 'listener') {
      if (currentUser.tier === 'free' && currentDailyCount >= 6) {
        alert("Daily stream limit reached: Free tier accounts are limited to 6 streams per day.");
        return;
      }
      if (currentUser.tier === 'silver' && currentDailyCount >= 60) {
        alert("Daily stream limit reached: Silver tier accounts are limited to 60 streams per day.");
        return;
      }
    }

    const updatedSongs = songs.map(s => {
      if (s.id === songId) {
        return { ...s, streams: s.streams + 1 };
      }
      return s;
    });
    setSongs(updatedSongs);
    saveToStorage('spotify_mock_songs', updatedSongs);

    const updatedCurrentUser = {
      ...currentUser,
      dailyStreamsCount: currentDailyCount + 1
    };
    setCurrentUser(updatedCurrentUser);
    saveToStorage('spotify_mock_current_user', updatedCurrentUser);

    const updatedUsers = users.map(u => {
      if (u.id === currentUser.id) {
        return updatedCurrentUser;
      }
      return u;
    });
    setUsers(updatedUsers);
    saveToStorage('spotify_mock_users', updatedUsers);

    const payoutInc = config.metrics.averagePayoutPerStream;
    const revenueInc = payoutInc / config.metrics.artistPayoutRate;

    const updatedConfig = {
      ...config,
      metrics: {
        ...config.metrics,
        totalStreams: config.metrics.totalStreams + 1,
        totalRevenue: Number((config.metrics.totalRevenue + revenueInc).toFixed(4))
      }
    };
    setConfig(updatedConfig);
    saveToStorage('spotify_mock_config', updatedConfig);
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
      upgradeTier,
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
      incrementSongStreams
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
