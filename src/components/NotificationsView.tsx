import React, { useState } from 'react';
import { useMockState } from '../context/MockStateContext';
import { 
  Bell, 
  Trash2, 
  Check, 
  CheckCheck, 
  AlertTriangle, 
  Sparkles, 
  MessageSquare, 
  Clock,
  ExternalLink,
  ShieldAlert,
  Info,
  SlidersHorizontal,
  XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ProfileSettings.css';

export const NotificationsView: React.FC = () => {
  const { 
    currentUser, 
    notifications, 
    markNotificationRead, 
    clearAllNotifications, 
    deleteNotification 
  } = useMockState();

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'warning' | 'ticket'>('all');

  if (!currentUser) return null;

  // Filter notifications relevant to current user identity, role, or 'all'
  const relevantNotifs = notifications.filter(n => {
    if (n.userId === currentUser.id) return true;
    if (n.role === currentUser.role) return true;
    if (n.role === 'all') return true;
    return false;
  });

  // Tab Filtering Logic
  const filteredNotifs = relevantNotifs.filter(n => {
    if (activeTab === 'unread') return !n.read;
    if (activeTab === 'warning') return n.type === 'warning';
    if (activeTab === 'ticket') return n.type === 'ticket';
    return true;
  });

  const unreadCount = relevantNotifs.filter(n => !n.read).length;

  const handleNotificationClick = (n: any) => {
    if (!n.read) {
      markNotificationRead(n.id);
    }

    // Direct Navigation according to spec requirement 2.6
    if (n.type === 'ticket') {
      if (currentUser.role === 'support' || currentUser.role === 'admin') {
        navigate('/support');
      } else {
        navigate('/settings');
      }
    } else if (n.title.toLowerCase().includes('artist') || n.title.toLowerCase().includes('approval')) {
      if (currentUser.role === 'artist') {
        navigate('/artist-dashboard');
      }
    } else if (n.message.toLowerCase().includes('track') || n.message.toLowerCase().includes('song')) {
      navigate('/albums');
    }
  };

  const getNotifIcon = (type: string) => {
    if (type === 'warning') return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
    if (type === 'success') return <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />;
    if (type === 'ticket') return <MessageSquare className="w-5 h-5 text-sky-400 shrink-0" />;
    return <Info className="w-5 h-5 text-indigo-400 shrink-0" />;
  };

  const getNotifBorderClass = (type: string, read: boolean) => {
    if (read) return 'border-zinc-900/60 opacity-75';
    if (type === 'warning') return 'border-amber-900/40 ring-1 ring-amber-500/20 bg-amber-950/10';
    if (type === 'success') return 'border-emerald-900/40 ring-1 ring-emerald-500/20 bg-emerald-950/10';
    if (type === 'ticket') return 'border-sky-900/40 ring-1 ring-sky-500/20 bg-sky-950/10';
    return 'border-zinc-800/80 bg-zinc-900/40';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-6xl mx-auto">
      
      {/* View Title Panel */}
      <div className="border-b border-zinc-850 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-emerald-400" />
            <span>Notifications & Alert Center</span>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-xs text-zinc-400 font-medium mt-1">
            Role-tailored telemetry dispatches, billing updates, and support communications.
          </p>
        </div>

        {relevantNotifs.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {unreadCount > 0 && (
              <button
                onClick={clearAllNotifications}
                className="px-3.5 py-2 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/50 text-emerald-400 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-2 shadow-sm"
                title="Mark all notifications as read"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Mark All Read</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filter Tabs Header */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 border-b border-zinc-900">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-850'
            }`}
          >
            <span>All Alerts</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px]">
              {relevantNotifs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('unread')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'unread'
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-850'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 text-[10px]">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('warning')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'warning'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-850'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>System Warnings</span>
          </button>

          <button
            onClick={() => setActiveTab('ticket')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'ticket'
                ? 'bg-sky-500 text-black shadow-lg shadow-sky-500/20'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-850'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Support Tickets</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="capitalize">Role: {currentUser.role}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Dynamic Alerts List (8 columns) */}
        <div className="lg:col-span-8 space-y-4">
          
          {filteredNotifs.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-zinc-850 rounded-2xl bg-zinc-950/30 flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-600">
                <Bell className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-zinc-300">No Notifications in this Category</p>
                <p className="text-xs text-zinc-500 font-medium max-w-sm">
                  {activeTab === 'unread' 
                    ? 'All your notifications are marked as read.' 
                    : 'Your inbox is clear of any new announcements for this filter.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifs.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-4 rounded-xl border flex gap-4 transition items-start group cursor-pointer ${
                    n.read 
                      ? 'bg-zinc-950/40 hover:bg-zinc-900/40' 
                      : 'hover:bg-zinc-900/80'
                  } ${getNotifBorderClass(n.type, n.read)}`}
                >
                  {/* Category icon */}
                  <div className="mt-0.5">
                    {getNotifIcon(n.type)}
                  </div>

                  {/* Body details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <p className={`text-sm font-bold truncate group-hover:text-emerald-400 transition-colors ${
                          n.read ? 'text-zinc-400' : 'text-white'
                        }`}>
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" title="Unread Notice" />
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3 text-zinc-600" />
                        <span>
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </span>
                    </div>

                    <p className={`text-xs leading-relaxed ${n.read ? 'text-zinc-500 font-medium' : 'text-zinc-300 font-medium'}`}>
                      {n.message}
                    </p>

                    <div className="flex items-center gap-3 pt-1 font-mono text-[9px] text-zinc-500">
                      <span className="uppercase font-bold tracking-wider">{n.type} log</span>
                      <span>•</span>
                      <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                      <span className="text-emerald-400 opacity-0 group-hover:opacity-100 transition flex items-center gap-1 ml-auto">
                        <span>Click to view</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </div>

                  {/* Operational actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-center" onClick={(e) => e.stopPropagation()}>
                    {!n.read && (
                      <button
                        onClick={() => markNotificationRead(n.id)}
                        className="p-1.5 rounded-lg bg-zinc-900 hover:bg-emerald-950/60 border border-zinc-800 hover:border-emerald-700/50 text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
                        title="Mark as Read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(n.id)}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/50 border border-zinc-800 hover:border-rose-800/50 text-zinc-500 hover:text-rose-400 transition cursor-pointer"
                      title="Delete Notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>

        {/* Right Side: Role & Telemetry Context Panel (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#121214] border border-zinc-850 p-5 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 font-mono uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span>Role Telemetry Rules</span>
            </h3>
            
            <div className="space-y-3.5 text-xs text-zinc-400 leading-relaxed font-medium">
              <p>
                Alerts are automatically dispatched based on your current account permissions and tier limits.
              </p>
              
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 space-y-2">
                <span className="text-[9px] text-zinc-500 font-mono block uppercase font-bold">Active Role Context</span>
                <ul className="space-y-2 text-[10px] text-zinc-300 font-mono">
                  <li className="flex items-center justify-between border-b border-zinc-900 pb-1">
                    <span className="text-zinc-500">Target Role:</span>
                    <span className="text-emerald-400 capitalize font-bold">{currentUser.role}</span>
                  </li>
                  <li className="flex items-center justify-between border-b border-zinc-900 pb-1">
                    <span className="text-zinc-500">Account Tier:</span>
                    <span className="text-amber-400 uppercase font-bold">{currentUser.tier}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-zinc-500">Unread Count:</span>
                    <span className="text-sky-400 font-bold">{unreadCount} Alerts</span>
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 text-[10px] text-zinc-500 font-mono leading-normal space-y-1">
                <strong className="text-zinc-400 block">Persistence Note:</strong>
                <p>Notifications persist dynamically in your browser's LocalStorage and will survive page refreshes.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};