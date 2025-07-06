import React, { useEffect, useState } from 'react';
import { getAdminPortalConfigAuto } from '../config/siteConfig';

interface AuthSession {
  user?: {
    name?: string;
    email?: string;
    image?: string;
    roles?: string[];
  };
}

interface AuthStatusState {
  isAuthenticated: boolean;
  username?: string;
  teams?: string[];
  keepMeLoggedIn?: boolean;
  loading: boolean;
}

// Dynamic admin portal configuration based on environment

/**
 * AuthStatus component that tracks authentication state from the admin
 * and synchronizes it with localStorage for use across docusaurus sites
 */
export const AuthStatus: React.FC = () => {
  const [_authState, setAuthState] = useState<AuthStatusState>({
    isAuthenticated: false,
    loading: true,
  });

  // Check session from admin
  const checkSession = async () => {
    try {
      const adminConfig = getAdminPortalConfigAuto();
      const response = await fetch(adminConfig.sessionApiUrl, {
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const session: AuthSession | null = await response.json();

        if (session && session.user) {
          const authStatus = {
            isAuthenticated: true,
            username: session.user.name || session.user.email,
            teams: session.user.roles || [],
            keepMeLoggedIn:
              localStorage.getItem('auth-keep-signed-in') === 'true',
            loading: false,
          };

          setAuthState(authStatus);

          // Update localStorage for other components
          localStorage.setItem('authStatus', JSON.stringify(authStatus));

          // Dispatch storage event for cross-tab communication
          window.dispatchEvent(
            new StorageEvent('storage', {
              key: 'authStatus',
              newValue: JSON.stringify(authStatus),
            }),
          );
        } else {
          // No session found
          const authStatus = {
            isAuthenticated: false,
            loading: false,
          };

          setAuthState(authStatus);
          localStorage.setItem('authStatus', JSON.stringify(authStatus));

          window.dispatchEvent(
            new StorageEvent('storage', {
              key: 'authStatus',
              newValue: JSON.stringify(authStatus),
            }),
          );
        }
      } else {
        // Session check failed
        const authStatus = {
          isAuthenticated: false,
          loading: false,
        };

        setAuthState(authStatus);
        localStorage.setItem('authStatus', JSON.stringify(authStatus));
      }
    } catch (error) {
      console.warn('Failed to check auth session:', error);
      const authStatus = {
        isAuthenticated: false,
        loading: false,
      };

      setAuthState(authStatus);
      localStorage.setItem('authStatus', JSON.stringify(authStatus));
    }
  };

  useEffect(() => {
    // Initial session check
    checkSession();

    // Set up periodic session checking (every 5 minutes)
    const interval = setInterval(checkSession, 5 * 60 * 1000);

    // Listen for focus events to check session when user returns to tab
    const handleFocus = () => checkSession();
    window.addEventListener('focus', handleFocus);

    // Listen for storage events from other tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'authStatus' && e.newValue) {
        try {
          const newAuthState = JSON.parse(e.newValue);
          setAuthState(newAuthState);
        } catch (error) {
          console.warn('Failed to parse auth status from storage:', error);
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // This component doesn't render anything visible
  // It just manages auth state in the background
  return null;
};

export default AuthStatus;
