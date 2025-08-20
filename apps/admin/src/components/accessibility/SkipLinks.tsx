'use client';

interface SkipLink {
  href: string;
  label: string;
}

interface SkipLinksProps {
  links: SkipLink[];
}

export default function SkipLinks({ links }: SkipLinksProps) {
  return (
    <div
      className="skip-links"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 9999,
      }}
    >
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          style={{
            position: 'absolute',
            left: '-9999px',
            top: 0,
            padding: '8px 16px',
            backgroundColor: '#1890ff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: 4,
            fontWeight: 600,
            fontSize: '14px',
          }}
          onFocus={(e) => {
            const target = e.target as HTMLAnchorElement;
            target.style.left = '8px';
            target.style.top = '8px';
            target.style.outline = 'none';
            target.style.boxShadow = '0 0 0 3px rgba(24, 144, 255, 0.2)';
          }}
          onBlur={(e) => {
            const target = e.target as HTMLAnchorElement;
            target.style.left = '-9999px';
            target.style.boxShadow = 'none';
          }}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}