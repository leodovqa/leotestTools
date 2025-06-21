import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({
  open,
  onClose,
  homeUrl,
  onSidebarClick,
  userName,
  myTasksUrl,
  onSignOut,
}: {
  open: boolean;
  onClose: () => void;
  homeUrl: string;
  onSidebarClick: (e: React.MouseEvent) => void;
  userName?: string;
  myTasksUrl: string;
  onSignOut: () => void;
}) => {
  if (!open) return null;

  return (
    <>
      <div className="sidebar-overlay" onClick={onClose}></div>
      <div className="sidebar" onClick={onSidebarClick}>
        <div className="sidebar-header">
          <button className="sidebar-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="sidebar-content">
          {userName && (
            <div style={{ color: '#fde047', textAlign: 'center', marginBottom: '1rem' }}>
              Welcome, {userName}
            </div>
          )}
          <Link to={homeUrl} className="sidebar-item" onClick={onClose}>
            <span className="sidebar-item-text">Create Task</span>
          </Link>
          <Link to={myTasksUrl} className="sidebar-item" onClick={onClose}>
            <span className="sidebar-item-text">My Tasks</span>
          </Link>
        </div>
        <div className="sidebar-footer">
          <button className="sidebar-signout-btn" onClick={onSignOut}>
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
