'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import './docusaurus-navbar.css';

interface DocusaurusNavbarProps {
  siteKey?: string;
}

export function DocusaurusNavbar({ siteKey }: DocusaurusNavbarProps): JSX.Element {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);

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

  // Handle logout
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/signin' });
    setIsDropdownOpen(false);
  };

  // Get site display name
  const getSiteDisplayName = (key: string) => {
    const siteNames: Record<string, string> = {
      'isbdm': 'ISBDM',
      'lrm': 'LRM', 
      'frbr': 'FRBR',
      'isbd': 'ISBD',
      'muldicat': 'MulDiCat',
      'unimarc': 'UNIMARC',
      'newtest': 'NewTest',
      'portal': 'Portal'
    };
    return siteNames[key] || key.toUpperCase();
  };

  // Get breadcrumb path
  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs = [
      { label: 'Admin Portal', href: '/' }
    ];

    if (segments.length > 0) {
      if (segments[0] === 'dashboard' && segments[1]) {
        breadcrumbs.push({
          label: getSiteDisplayName(segments[1]),
          href: `/dashboard/${segments[1]}`
        });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <nav className="docusaurus-navbar">
      <div className="docusaurus-navbar__inner">
        {/* Left side - Logo and navigation */}
        <div className="docusaurus-navbar__left">
          <Link href="/" className="docusaurus-navbar__brand">
            <img
              src="/img/logo-ifla_black.png"
              alt="IFLA Logo"
              className="docusaurus-navbar__logo"
            />
            <span className="docusaurus-navbar__title">IFLA Admin</span>
          </Link>

          {/* Breadcrumb navigation */}
          <div className="docusaurus-navbar__breadcrumbs">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.href}>
                {index > 0 && (
                  <span className="docusaurus-navbar__breadcrumb-separator">/</span>
                )}
                <Link
                  href={crumb.href}
                  className={`docusaurus-navbar__breadcrumb ${
                    index === breadcrumbs.length - 1 
                      ? 'docusaurus-navbar__breadcrumb--active' 
                      : ''
                  }`}
                >
                  {crumb.label}
                </Link>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Right side - User menu */}
        <div className="docusaurus-navbar__right">
          {status === 'loading' ? (
            <div className="docusaurus-navbar__loading">
              <span className="docusaurus-navbar__spinner"></span>
            </div>
          ) : session?.user ? (
            <div className="docusaurus-navbar__user-menu">
              <button
                className="docusaurus-navbar__user-button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                {session.user.image && (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="docusaurus-navbar__avatar"
                  />
                )}
                <span className="docusaurus-navbar__username">
                  {session.user.name || session.user.email}
                </span>
                <svg
                  className={`docusaurus-navbar__dropdown-arrow ${
                    isDropdownOpen ? 'docusaurus-navbar__dropdown-arrow--open' : ''
                  }`}
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
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
                <>
                  <div 
                    className="docusaurus-navbar__dropdown-backdrop"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="docusaurus-navbar__dropdown">
                    <div className="docusaurus-navbar__dropdown-header">
                      <div className="docusaurus-navbar__user-info">
                        <div className="docusaurus-navbar__user-name">
                          {session.user.name || 'User'}
                        </div>
                        <div className="docusaurus-navbar__user-email">
                          {session.user.email}
                        </div>
                        {session.user.roles && session.user.roles.length > 0 && (
                          <div className="docusaurus-navbar__user-roles">
                            {session.user.roles.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="docusaurus-navbar__dropdown-divider" />

                    <div className="docusaurus-navbar__dropdown-section">
                      {siteKey && (
                        <a
                          href={`http://localhost:3008/${siteKey.toLowerCase()}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="docusaurus-navbar__dropdown-item"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path
                              d="M6.5 2H14V9.5M14 2L7 9M11 14H3V6"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          View {getSiteDisplayName(siteKey)} Site
                        </a>
                      )}

                      <Link
                        href="/"
                        className="docusaurus-navbar__dropdown-item"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M8 2C6.9 2 6 2.9 6 4C6 5.1 6.9 6 8 6C9.1 6 10 5.1 10 4C10 2.9 9.1 2 8 2ZM8 10C6.9 10 6 10.9 6 12C6 13.1 6.9 14 8 14C9.1 14 10 13.1 10 12C10 10.9 9.1 10 8 10ZM12 6C10.9 6 10 6.9 10 8C10 9.1 10.9 10 12 10C13.1 10 14 9.1 14 8C14 6.9 13.1 6 12 6ZM4 6C2.9 6 2 6.9 2 8C2 9.1 2.9 10 4 10C5.1 10 6 9.1 6 8C6 6.9 5.1 6 4 6Z"
                              fill="currentColor"
                            />
                          </svg>
                          Dashboard Home
                      </Link>
                    </div>

                    <div className="docusaurus-navbar__dropdown-divider" />

                    <div className="docusaurus-navbar__dropdown-section">
                      <label className="docusaurus-navbar__checkbox-item">
                        <input
                          type="checkbox"
                          checked={keepSignedIn}
                          onChange={(e) => handleKeepSignedInChange(e.target.checked)}
                          className="docusaurus-navbar__checkbox"
                        />
                        <span className="docusaurus-navbar__checkbox-label">
                          Keep me signed in
                        </span>
                      </label>
                    </div>

                    <div className="docusaurus-navbar__dropdown-divider" />

                    <div className="docusaurus-navbar__dropdown-section">
                      <button
                        className="docusaurus-navbar__dropdown-item docusaurus-navbar__dropdown-item--danger"
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
                </>
              )}
            </div>
          ) : (
            <Link href="/signin" className="docusaurus-navbar__signin">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
