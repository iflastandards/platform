'use client';

import { useEffect, useRef, useCallback } from 'react';
import { signOut } from 'next-auth/react';

interface UseInactivityLogoutOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
  checkKeepSignedIn?: boolean;
  onWarning?: () => void;
  onLogout?: () => void;
}

export function useInactivityLogout({
  timeoutMinutes = 30,
  warningMinutes = 5,
  checkKeepSignedIn = true,
  onWarning,
  onLogout,
}: UseInactivityLogoutOptions = {}) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const logout = useCallback(async () => {
    try {
      if (onLogout) {
        onLogout();
      }
      await signOut({ callbackUrl: '/signin?reason=inactivity' });
    } catch (error) {
      console.error('Logout failed:', error);
      // Force redirect if signOut fails
      window.location.href = '/signin?reason=inactivity';
    }
  }, [onLogout]);

  const showWarning = useCallback(() => {
    if (onWarning) {
      onWarning();
    }
  }, [onWarning]);

  const shouldCheckInactivity = useCallback(() => {
    if (!checkKeepSignedIn) return true;
    
    const keepSignedIn = localStorage.getItem('auth-keep-signed-in');
    return keepSignedIn !== 'true';
  }, [checkKeepSignedIn]);

  const resetTimer = useCallback(() => {
    // Only reset if we should check for inactivity
    if (!shouldCheckInactivity()) return;

    lastActivityRef.current = Date.now();

    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Set warning timer (warn X minutes before logout)
    const warningTime = (timeoutMinutes - warningMinutes) * 60 * 1000;
    if (warningTime > 0) {
      warningTimeoutRef.current = setTimeout(() => {
        showWarning();
      }, warningTime);
    }

    // Set logout timer
    const logoutTime = timeoutMinutes * 60 * 1000;
    timeoutRef.current = setTimeout(() => {
      logout();
    }, logoutTime);
  }, [timeoutMinutes, warningMinutes, shouldCheckInactivity, showWarning, logout]);

  // Activity event handler
  const handleActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    // Only set up listeners if we should check for inactivity
    if (!shouldCheckInactivity()) {
      return;
    }

    // Events that indicate user activity
    const events = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Throttle activity detection to avoid excessive timer resets
    let throttleTimer: NodeJS.Timeout;
    const throttledHandleActivity = () => {
      if (throttleTimer) return;
      
      throttleTimer = setTimeout(() => {
        handleActivity();
        clearTimeout(throttleTimer);
      }, 1000); // Throttle to once per second
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, throttledHandleActivity, true);
    });

    // Initialize timer
    resetTimer();

    // Cleanup function
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledHandleActivity, true);
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      if (throttleTimer) {
        clearTimeout(throttleTimer);
      }
    };
  }, [handleActivity, resetTimer, shouldCheckInactivity]);

  // Provide manual reset function for external use
  const resetInactivityTimer = useCallback(() => {
    if (shouldCheckInactivity()) {
      resetTimer();
    }
  }, [resetTimer, shouldCheckInactivity]);

  return {
    resetInactivityTimer,
    timeoutMinutes,
    warningMinutes,
  };
}