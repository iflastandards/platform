'use client';

import React from 'react';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { getPortalUrl } from '@/lib/get-portal-url';
import { addBasePath } from '@ifla/theme/utils';
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
    <nav className="docusaurus-navbar">
      <div className="docusaurus-navbar__inner">
        <div className="docusaurus-navbar__left">
          <Link
            className="docusaurus-navbar__brand"
            href="/dashboard"
            aria-label="IFLA Admin Portal"
          >
            <img
              src={addBasePath("/img/logo-ifla_black.png")}
              alt="IFLA"
              className="docusaurus-navbar__logo"
            />
            <span className="docusaurus-navbar__title">Admin Portal</span>
          </Link>
          {siteKey && (
            <>
              <span className="docusaurus-navbar__breadcrumb-separator">›</span>
              <span className="docusaurus-navbar__breadcrumb docusaurus-navbar__breadcrumb--active">{siteKey}</span>
            </>
          )}
        </div>

        <div className="docusaurus-navbar__right">
          {/* Navigation menu items */}
          {siteKey &&
            navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`docusaurus-navbar__breadcrumb ${
                  pathname === item.href ? 'docusaurus-navbar__breadcrumb--active' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}

          {/* User menu */}
          <div className="docusaurus-navbar__user-menu">
            <UserButton 
              afterSignOutUrl={getPortalUrl()}
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