'use client';

import { Box, Link } from '@mui/material';

interface SkipLink {
  href: string;
  label: string;
}

interface SkipLinksProps {
  links: SkipLink[];
}

export default function SkipLinks({ links }: SkipLinksProps) {
  return (
    <Box
      className="skip-links"
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 9999,
      }}
    >
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          sx={{
            position: 'absolute',
            left: '-9999px',
            top: 0,
            padding: '8px 16px',
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            textDecoration: 'none',
            borderRadius: 1,
            fontWeight: 600,
            fontSize: '0.875rem',
            
            '&:focus': {
              left: 8,
              top: 8,
              outline: 'none',
              boxShadow: '0 0 0 3px rgba(15, 118, 110, 0.2)',
            },
          }}
        >
          {link.label}
        </Link>
      ))}
    </Box>
  );
}