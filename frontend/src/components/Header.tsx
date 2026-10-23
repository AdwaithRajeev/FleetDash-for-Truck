/**
 * Header.tsx
 * Top application bar for FleetDash.
 * Week 1 – Static UI. Search is a controlled input (no API call).
 * Ready for future search integration and notification feed.
 *
 * UI Enhancement v2: Framer Motion entrance, live clock, fleet status,
 * weather placeholder. All existing element IDs, search, notification
 * logic preserved exactly.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// ── Types ──────────────────────────────────────────────────────────────────────

interface HeaderProps {
  title?: string;
  subtitle?: string;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  onLogout?: () => void;
  onRefresh?: () => void;
  alertCount?: number;
}


// ── Helpers ────────────────────────────────────────────────────────────────────

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour:   '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month:   'short',
    day:     'numeric',
  });
}

// ── Component ──────────────────────────────────────────────────────────────────

const Header: React.FC<HeaderProps> = ({
  title = 'Fleet Dashboard',
  subtitle = 'Real-time fleet monitoring & analytics',
  searchQuery = '',
  onSearchChange = () => {},
  onLogout = () => {},
  onRefresh = () => {},
  alertCount = 0,
}) => {
  const notificationCount = alertCount; // TODO: drive from WS events (Week 3)
  const [currentTime, setCurrentTime]   = useState<Date>(new Date());
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  // Live clock — updates every second
  useEffect(() => {
    
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
const handleLogout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.clear();

  window.location.reload();
};

const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
  onSearchChange(e.target.value);
};

 const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
  if (e.key === 'Escape') {
    onSearchChange('');
  }
};

  return (
    <motion.header
      className="header"
      role="banner"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Page Title */}
      <div className="header__title-block">
        <h1 className="header__title">{title}</h1>
        <p className="header__subtitle">{subtitle}</p>
      </div>

      {/* Fleet Status Pill */}
      <motion.div
        className="header__fleet-status"
        role="status"
        aria-label="Fleet online status"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <span className="header__fleet-dot" aria-hidden="true" />
        42 Online
      </motion.div>

      {/* Weather placeholder */}
      <div className="header__weather" aria-label="Weather placeholder" title="Weather data – Week 3">
        <span className="header__weather-icon" aria-hidden="true">⛅</span>
        <span className="header__weather-text">28°C</span>
      </div>

      {/* Search */}
      <div className="header__search" role="search">
        <span className="header__search-icon" aria-hidden="true">🔍</span>
       <input
  id="fleet-search-input"
  type="search"
  className="header__search-input"
  placeholder="Search vehicles, drivers…"
  value={searchQuery}
  onChange={(e) => onSearchChange(e.target.value)}
  onKeyDown={handleSearchKeyDown}
  aria-label="Search vehicles and drivers"
  autoComplete="off"
/>
      </div>

      {/* Action Icons */}
      <div className="header__actions">
        {/* Refresh */}
        <motion.button
          id="header-refresh-btn"
          className="header__icon-btn"
          type="button"
          aria-label="Refresh dashboard data"
          title="Refresh"
          onClick={onRefresh}
          whileHover={{ scale: 1.08, backgroundColor: 'rgba(79,140,255,0.15)' }}
          whileTap={{ scale: 0.92, rotate: 180 }}
          transition={{ duration: 0.15 }}
        >
          🔄
        </motion.button>

        {/* Notifications */}
        <motion.button
          id="header-notifications-btn"
          className="header__icon-btn"
          type="button"
          aria-label={`Notifications – ${notificationCount} unread`}
          title="Notifications"
          whileHover={{ scale: 1.08, backgroundColor: 'rgba(79,140,255,0.15)' }}
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.15 }}
        >
          🔔
          {notificationCount > 0 && (
            <span className="header__notification-dot" aria-hidden="true" />
          )}
        </motion.button>

{/* User Avatar + Logout Menu */}
<div style={{ position: 'relative' }}>
  <motion.div
    id="header-user-avatar"
    className="header__avatar"
    role="button"
    tabIndex={0}
    aria-label="Open user profile menu"
    title="John Dispatch – Fleet Manager"
    onClick={() => setShowUserMenu(!showUserMenu)}
    whileHover={{
      scale: 1.12,
      boxShadow: '0 0 28px rgba(0,212,255,0.55)',
    }}
    whileTap={{ scale: 0.96 }}
    transition={{ type: 'spring', stiffness: 350 }}
  >
    JD
  </motion.div>

  {showUserMenu && (
    <div
      style={{
        position: 'absolute',
        top: '55px',
        right: '0',
        width: '180px',
        padding: '10px',
        background: '#111c30',
        border: '1px solid rgba(79,140,255,0.3)',
        borderRadius: '10px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
        zIndex: 1000,
      }}
    >
      <button
        type="button"
        onClick={() => {
  console.log('LOGOUT CLICKED');
  handleLogout();
}}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: 'none',
          borderRadius: '8px',
          background: 'transparent',
          color: '#fff',
          textAlign: 'left',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        🚪 Logout
      </button>
    </div>
  )}
</div>
      </div>

      {/* Live Clock */}
      <div className="header__clock" aria-label="Current time" aria-live="polite">
        <span className="header__clock-time">{formatTime(currentTime)}</span>
        <span className="header__clock-date">{formatDate(currentTime)}</span>
      </div>
    </motion.header>
  );
};

export default Header;
