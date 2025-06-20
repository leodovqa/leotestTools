import React from 'react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  homeUrl?: string;
  onSidebarClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  userName?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, homeUrl, onSidebarClick, userName }) => {
  if (!open) return null;
  const url =
    homeUrl ||
    (window.location.hostname === 'localhost'
      ? 'http://localhost:3000'
      : 'https://leotest-tools.vercel.app');
  return (
    <div className="sidebar" onClick={onSidebarClick}>
      <div className="sidebar-header">
        <span className="text-lg font-bold">
          {userName ? `Welcome, ${userName}!` : 'Menu'}
        </span>
        <button
          className="sidebar-close-btn"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          &times;
        </button>
      </div>
      <div className="sidebar-content">
        <a className="sidebar-item" href={url} onClick={onClose}>
          <span className="sidebar-item-text">Home</span>
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
