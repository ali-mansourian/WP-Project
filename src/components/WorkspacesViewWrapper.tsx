import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Dashboard } from './Dashboard';
import { Song } from '../types';

interface OutletContextType {
  currentTrack: Song | null;
  setCurrentTrack: (song: Song | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  onLyricsClick: () => void;
  onAddToPlaylistClick: (songId: string | number) => void;
}

interface WorkspacesViewWrapperProps {
  viewName: 'support-center' | 'artist-dashboard' | 'support-agent-dashboard' | 'admin-dashboard';
}

export const WorkspacesViewWrapper: React.FC<WorkspacesViewWrapperProps> = ({ viewName }) => {
  const { currentTrack, setCurrentTrack, isPlaying, setIsPlaying, onLyricsClick, onAddToPlaylistClick } = useOutletContext<OutletContextType>();
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | number | null>(null);

  return (
    <div className="animate-in fade-in duration-300">
      <Dashboard
        currentView={viewName}
        setView={() => {}}
        currentTrack={currentTrack}
        setCurrentTrack={setCurrentTrack}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        selectedPlaylistId={selectedPlaylistId}
        setSelectedPlaylistId={setSelectedPlaylistId}
        onLyricsClick={onLyricsClick}
        onAddToPlaylistClick={onAddToPlaylistClick}
      />
    </div>
  );
};
