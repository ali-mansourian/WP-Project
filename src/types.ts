export type UserRole = 'listener' | 'artist' | 'support' | 'admin';
export type ListenerTier = 'free' | 'silver' | 'gold';

export interface UserPreferences {
  theme?: 'dark' | 'light';
  language?: string;
  autoPlay?: boolean;
  highQualityAudio?: boolean;
  emailNotifications?: boolean;
}

export interface User {
  id: string | number;
  name: string;
  email: string;
  role: UserRole;
  tier: ListenerTier;
  avatarUrl: string;
  followedArtists: string[];
  playlistsCount: number;
  joinedDate: string;
  password?: string;
  token?: string;
  status?: 'active' | 'pending' | 'rejected';
  rejectionReason?: string;
  dob?: string;
  gender?: string;
  stage_name?: string;
  stageName?: string;
  bio?: string;
  dailyStreamsCount?: number;
  preferences?: UserPreferences;
}

export interface Song {
  id: string | number;
  title: string;
  artistId: string | number;
  artistName: string;
  albumId?: string | number | null;
  albumName?: string;
  duration: number; // in seconds
  audioUrl: string;
  coverUrl: string;
  lyrics?: string;
  streams: number;
  releaseDate: string;
  approved: boolean;
  releaseType?: 'single' | 'album';
  genre?: string;
  releaseYear?: string;
  collaborators?: string;
  audioFileName?: string;
  coverArtFileName?: string;
}

export interface Album {
  id: string | number;
  title: string;
  artistId: string | number;
  artistName: string;
  coverUrl: string;
  releaseDate: string;
  songIds: (string | number)[];
  songs?: Song[];
}

export interface Playlist {
  id: string | number;
  name: string;
  userId: string | number;
  description: string;
  coverUrl: string;
  songIds: (string | number)[];
  songs?: Song[];
  isPublic: boolean;
  createdAt: string;
}

export interface Notification {
  id: string | number;
  userId: string | number | 'all';
  role: UserRole | 'all';
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success' | 'ticket' | 'payment';
  read: boolean;
  createdAt: string;
}

export interface TicketReply {
  id: string | number;
  senderId: string | number;
  senderName: string;
  message: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string | number;
  userId: string | number;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  status: 'open' | 'pending' | 'resolved';
  createdAt: string;
  replies: TicketReply[];
}

export interface ArtistApplication {
  id: string | number;
  userId: string | number;
  userName: string;
  userEmail: string;
  artistName: string;
  bio: string;
  genre: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  portfolioFiles?: string[];
}

export interface ArtistSettlement {
  id: string | number;
  artist: string | number;
  artist_name?: string;
  artistName?: string;
  period: string;
  total_streams: number;
  totalStreams?: number;
  unique_listeners: number;
  uniqueListeners?: number;
  amount_due: string | number;
  amountDue?: string | number;
  status: 'pending' | 'settled';
  status_label?: string;
  created_at: string;
  settled_at?: string | null;
}

export interface RevenueMetrics {
  totalRevenue: number;
  artistPayoutRate: number; // e.g. 0.70
  platformKeepRate: number; // e.g. 0.30
  totalStreams: number;
  averagePayoutPerStream: number;
}

export interface SystemConfig {
  silverPrice: number;
  goldPrice: number;
  metrics: RevenueMetrics;
}

export interface MockState {
  users: User[];
  songs: Song[];
  albums: Album[];
  playlists: Playlist[];
  notifications: Notification[];
  tickets: SupportTicket[];
  applications: ArtistApplication[];
  config: SystemConfig;
}