'use client';

import React from 'react';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import './docusaurus-navbar.css';

interface DocusaurusNavbarProps {
  siteKey?: string;
}

export function DocusaurusNavbar({
  siteKey,
}: DocusaurusNavbarProps): React.JSX.Element {
  const pathname = usePathname();

  // Generate the base path for navigation
  const basePath = siteKey ? `/dashboard/${siteKey}` : '/dashboard';

  // Navigation items
  const navItems = [
    { href: basePath, label: 'Overview' },
    { href: `${basePath}/content`, label: 'Content' },
    { href: `${basePath}/team`, label: 'Team' },
    { href: `${basePath}/workflows`, label: 'Workflows' },
    { href: `${basePath}/settings`, label: 'Settings' },
  ];

  return (
    <nav className="navbar navbar--fixed-top">
      <div className="navbar__inner">
        <div className="navbar__items">
          <Link
            className="navbar__brand"
            href="/dashboard"
            aria-label="IFLA Admin Portal"
          >
            <div className="navbar__logo">
              <img
                src="/img/logo-ifla_black.png"
                alt="IFLA"
                className="themedImage_node_modules-@docusaurus-theme-classic-lib-theme-ThemedImage-styles-module themedImage--light_node_modules-@docusaurus-theme-classic-lib-theme-ThemedImage-styles-module"
              />
            </div>
            <b className="navbar__title text--truncate">Admin Portal</b>
          </Link>
          {siteKey && (
            <>
              <span className="navbar__separator">|</span>
              <span className="navbar__site-title">{siteKey}</span>
            </>
          )}
        </div>

        <div className="navbar__items navbar__items--right">
          {/* Navigation menu items */}
          {siteKey &&
            navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`navbar__item navbar__link ${
                  pathname === item.href ? 'navbar__link--active' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}

          {/* User menu */}
          <div className="navbar__item">
            <UserButton 
              afterSignOutUrl="/admin"
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-8 h-8",
                }
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}