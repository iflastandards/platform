import { useEffect, useState } from 'react';
import { getAdminPortalConfigAuto } from '../config/siteConfig';

interface AuthSession {
  isAuthenticated: boolean;
  username?: string;
  teams?: string[];
  keepMeLoggedIn?: boolean;
  loading: boolean;
}

/**
 * Custom hook to manage authentication state from the admin-portal
 * This provides a bridge between the admin-portal session and docusaurus sites
 */
export const useAdminSession = () => {
  const [session, setSession] = useState<AuthSession>({
    isAuthenticated: false,
    loading: true
  });

  // Get stored auth state from localStorage
  const getStoredAuth = (): AuthSession => {
    if (typeof window === "undefined") {
      return { isAuthenticated: false, loading: false };
    }
    
    try {
      const raw = window.localStorage.getItem("authStatus");
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...parsed, loading: false };
      }
    } catch (error) {
      console.warn('Failed to parse stored auth status:', error);
    }
    
    return { isAuthenticated: false, loading: false };
  };

  // Check session from admin-portal
  const checkSession = async (): Promise<AuthSession> => {
    try {
      const adminConfig = getAdminPortalConfigAuto();
      const response = await fetch(adminConfig.sessionApiUrl, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const sessionData = await response.json();
        
        if (sessionData.user) {
          const authStatus: AuthSession = {
            isAuthenticated: true,
            username: sessionData.user.name || sessionData.user.email,
            teams: sessionData.user.roles || [],
            keepMeLoggedIn: localStorage.getItem('auth-keep-signed-in') === 'true',
            loading: false
          };

          // Update localStorage for persistence
          localStorage.setItem('authStatus', JSON.stringify(authStatus));
          
          // Dispatch storage event for cross-tab communication
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'authStatus',
            newValue: JSON.stringify(authStatus)
          }));

          return authStatus;
        }
      }
    } catch (error) {
      console.warn('Failed to check admin session:', error);
    }

    // No session or error occurred
    const authStatus: AuthSession = {
      isAuthenticated: false,
      loading: false
    };
    
    localStorage.setItem('authStatus', JSON.stringify(authStatus));
    return authStatus;
  };

  // Refresh session manually
  const refreshSession = async () => {
    setSession(prev => ({ ...prev, loading: true }));
    const newSession = await checkSession();
    setSession(newSession);
  };

  // Sign out function
  const signOut = async () => {
    try {
      // Call admin-portal signout
      const adminConfig = getAdminPortalConfigAuto();
      await fetch(adminConfig.signoutUrl, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.warn('Failed to sign out from admin-portal:', error);
    }

    // Clear local state regardless
    const authStatus: AuthSession = {
      isAuthenticated: false,
      loading: false
    };
    
    setSession(authStatus);
    localStorage.setItem('authStatus', JSON.stringify(authStatus));
    
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'authStatus',
      newValue: JSON.stringify(authStatus)
    }));
  };

  useEffect(() => {
    // Initialize with stored auth state
    const storedAuth = getStoredAuth();
    setSession(storedAuth);

    // Check session from admin-portal
    checkSession().then(setSession);

    // Set up periodic session checking (every 5 minutes)
    const interval = setInterval(() => {
      checkSession().then(setSession);
    }, 5 * 60 * 1000);

    // Listen for focus events to check session when user returns to tab
    const handleFocus = () => {
      checkSession().then(setSession);
    };
    window.addEventListener('focus', handleFocus);

    // Listen for storage events from other tabs/components
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'authStatus' && e.newValue) {
        try {
          const newAuthState = JSON.parse(e.newValue);
          setSession(newAuthState);
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

  return {
    session,
    refreshSession,
    signOut,
    isAuthenticated: session.isAuthenticated,
    username: session.username,
    teams: session.teams,
    loading: session.loading
  };
};

export default useAdminSession;
