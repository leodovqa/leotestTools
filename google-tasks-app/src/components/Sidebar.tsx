import React from 'react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  homeUrl?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, homeUrl }) => {
  if (!open) return null;
  const url =
    homeUrl ||
    (window.location.hostname === 'localhost'
      ? 'http://localhost:3000'
      : 'https://leotest-tools.vercel.app');
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <span className="text-lg font-bold">Menu</span>
        <button
          className="text-white text-2xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          &times;
        </button>
      </div>
      <div className="sidebar-content">
        <a className="sidebar-item" href={url} onClick={onClose}>
          Home
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
