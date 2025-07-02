import React, {useState, useEffect, useRef, JSX} from 'react';
import useSWR from 'swr';
import './styles.css';

interface AuthStatusProps {
  siteKey: string;
}

interface User {
  name: string;
  email: string;
  image?: string;
  login: string;
  roles: string[];
}

interface AuthSession {
  user: User;
  expires: string;
}

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url, {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch session');
  }
  return response.json();
};

export default function AuthStatus({ siteKey }: AuthStatusProps): JSX.Element {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Check session status with SWR for real-time updates
  const { data: session, error, mutate } = useSWR<AuthSession>(
    'http://localhost:3007/api/auth/session',
    fetcher,
    {
      refreshInterval: 30000, // Check every 30 seconds
      revalidateOnFocus: true,
      shouldRetryOnError: false,
    }
  );

  // Load keep signed in preference
  useEffect(() => {
    const saved = localStorage.getItem('auth-keep-signed-in');
    setKeepSignedIn(saved === 'true');
  }, []);

  // Handle keep signed in toggle
  const handleKeepSignedInChange = (checked: boolean) => {
    setKeepSignedIn(checked);
    localStorage.setItem('auth-keep-signed-in', checked.toString());
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3007/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
      });
      mutate(undefined); // Clear SWR cache
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Handle manage site click
  const handleManageClick = () => {
    window.open(`http://localhost:3007/dashboard/${siteKey.toLowerCase()}`, '_blank');
    setIsDropdownOpen(false);
  };

  // Loading state
  if (!session && !error) {
    return (
      <div className="auth-status auth-status--loading">
        <span className="auth-status__spinner"></span>
      </div>
    );
  }

  // Not authenticated
  if (error || !session?.user) {
    return (
      <div className="auth-status">
        <a
          href={`http://localhost:3007/api/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`}
          className="auth-status__signin"
        >
          Sign In
        </a>
      </div>
    );
  }

  // Authenticated
  const user = session.user;
  const displayName = user.name || user.login || user.email;

  return (
    <div className="auth-status" ref={dropdownRef}>
      <button
        className="auth-status__user-button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
      >
        {user.image && (
          <img
            src={user.image}
            alt={displayName}
            className="auth-status__avatar"
          />
        )}
        <span className="auth-status__username">{displayName}</span>
        <svg
          className={`auth-status__dropdown-arrow ${isDropdownOpen ? 'auth-status__dropdown-arrow--open' : ''}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.5 4.5L6 8L9.5 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isDropdownOpen && (
        <div className="auth-status__dropdown">
          <div className="auth-status__dropdown-header">
            <div className="auth-status__user-info">
              <div className="auth-status__user-name">{displayName}</div>
              <div className="auth-status__user-email">{user.email}</div>
              {user.roles.length > 0 && (
                <div className="auth-status__user-roles">
                  {user.roles.join(', ')}
                </div>
              )}
            </div>
          </div>

          <div className="auth-status__dropdown-divider"></div>

          <div className="auth-status__dropdown-section">
            <button
              className="auth-status__dropdown-item"
              onClick={handleManageClick}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 2C6.9 2 6 2.9 6 4C6 5.1 6.9 6 8 6C9.1 6 10 5.1 10 4C10 2.9 9.1 2 8 2ZM8 10C6.9 10 6 10.9 6 12C6 13.1 6.9 14 8 14C9.1 14 10 13.1 10 12C10 10.9 9.1 10 8 10ZM12 6C10.9 6 10 6.9 10 8C10 9.1 10.9 10 12 10C13.1 10 14 9.1 14 8C14 6.9 13.1 6 12 6ZM4 6C2.9 6 2 6.9 2 8C2 9.1 2.9 10 4 10C5.1 10 6 9.1 6 8C6 6.9 5.1 6 4 6Z"
                  fill="currentColor"
                />
              </svg>
              Manage {siteKey}
            </button>
          </div>

          <div className="auth-status__dropdown-divider"></div>

          <div className="auth-status__dropdown-section">
            <label className="auth-status__checkbox-item">
              <input
                type="checkbox"
                checked={keepSignedIn}
                onChange={(e) => handleKeepSignedInChange(e.target.checked)}
                className="auth-status__checkbox"
              />
              <span className="auth-status__checkbox-label">Keep me signed in</span>
            </label>
          </div>

          <div className="auth-status__dropdown-divider"></div>

          <div className="auth-status__dropdown-section">
            <button
              className="auth-status__dropdown-item auth-status__dropdown-item--danger"
              onClick={handleLogout}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M6 2H4C3.44772 2 3 2.44772 3 3V13C3 13.5523 3.44772 14 4 14H6M11 5L14 8M14 8L11 11M14 8H6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
