import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import {
  getAdminDocsConfig,
  type Environment,
} from '@ifla/theme/config/siteConfig';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)
const DOCS_ENV =
  (process.env.DOCS_ENV as Environment | undefined) ?? 'production';
if (!DOCS_ENV) {
  throw new Error(
    'DOCS_ENV environment variable is required but not set. ' +
      'Valid values: local, preview, production',
  );
}

/* ----------------------------------------------------------------------------
 * 🗺️ 2. Gather per-site configuration
 * -------------------------------------------------------------------------- */

const adminConfig = getAdminDocsConfig(DOCS_ENV);

const config: Config = {
  title: 'IFLA Standards Documentation',
  tagline: 'The complete guide to our platform and architecture.',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
    experimental_faster: true,
  },

  url: adminConfig.url,
  baseUrl: '/',

  organizationName: 'iflastandards',
  projectName: 'portal',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  onBrokenAnchors: 'ignore',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'system-design',
        path: '../../system-design-docs', // Path relative to the docusaurus site
        routeBasePath: 'system-design',
        sidebarPath: './sidebarsSystemDesign.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'user-docs',
        path: '../../docs', // Path to the main docs folder
        routeBasePath: 'docs',
        sidebarPath: './sidebarsUserDocs.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'developer-notes',
        path: '../../developer_notes', // Path to developer notes
        routeBasePath: 'developer-notes',
        sidebarPath: './sidebarsDevNotes.ts',
      },
    ],
    [
      'docusaurus-plugin-redoc',
      {
        id: 'api-specs',
        spec: '../../apps/admin/public/openapi.json', // Generated OpenAPI spec
        route: '/api',
      },
    ],
    [
      'docusaurus-plugin-typedoc',
      {
        id: 'typedoc',
        entryPoints: [
          '../../packages/contracts/schemas/index.ts', // Zod schemas and contracts
          '../../packages/supabase-types/src/database.ts', // Generated Supabase types
          '../../apps/admin/src/providers/dataProvider.ts', // Data provider implementations
          '../../apps/admin/src/lib/supabase/client.ts', // Supabase client utilities
        ],
        tsconfig: '../../apps/admin/tsconfig.json',
        out: 'generated-api', // Output directory within the docs site
        routeBasePath: 'generated-api',
        sidebar: {
          categoryLabel: 'Code Reference',
          position: 1,
        },
        plugin: ['typedoc-plugin-zod'], // Enable the Zod plugin
      },
    ],
  ],
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'My Site',
      logo: {
        alt: 'My Site Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          to: '/docs', // Your main user-facing docs
          label: 'Dev Docs',
          position: 'left',
          activeBaseRegex: `/docs`,
        },
        {
          to: '/system-design',
          label: 'System Design',
          position: 'left',
        },
        {
          to: '/developer-notes',
          label: 'Developer Notes',
          position: 'left',
        },
        {
          to: '/generated-api', // Link to your TypeDoc generated API
          label: 'Code Reference',
          position: 'left',
        },
        {
          to: '/api', // Link to your OpenAPI specs
          label: 'REST API',
          position: 'left',
        },
        { to: '/blog', label: 'Blog', position: 'left' },
        {
          href: 'https://github.com/facebook/docusaurus',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Tutorial',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/docusaurus',
            },
            {
              label: 'Discord',
              href: 'https://discordapp.com/invite/docusaurus',
            },
            {
              label: 'X',
              href: 'https://x.com/docusaurus',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/facebook/docusaurus',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
