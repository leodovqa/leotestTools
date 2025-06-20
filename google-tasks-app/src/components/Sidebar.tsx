import React from 'react';
import { Link } from 'react-router-dom';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  homeUrl?: string;
  onSidebarClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  userName?: string;
  myTasksUrl?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  open,
  onClose,
  homeUrl,
  onSidebarClick,
  userName,
  myTasksUrl,
}) => {
  if (!open) return null;
  // const url =
  //   homeUrl ||
  //   (window.location.hostname === 'localhost'
  //     ? 'http://localhost:3000'
  //     : 'https://leotest-tools.vercel.app');
  return (
    <div className="sidebar" onClick={onSidebarClick}>
      <div className="sidebar-header">
        <span className="text-lg font-bold">{userName ? `Welcome, ${userName}!` : 'Menu'}</span>
        <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
          &times;
        </button>
      </div>
      <div className="sidebar-content">
        <Link className="sidebar-item" to={homeUrl || '/'} onClick={onClose}>
          <span className="sidebar-item-text">Home</span>
        </Link>
        <Link className="sidebar-item" to={myTasksUrl || '/tasks'} onClick={onClose}>
          <span className="sidebar-item-text">My Tasks</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
