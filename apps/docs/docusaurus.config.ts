import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import { getAdminDocsConfig, type Environment } from '@ifla/contracts';

// Import our custom remark plugin
const remarkJsxSanitizer = require('./src/plugins/remark-jsx-sanitizer');

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

  // Configure markdown processing
  // 'detect' means .md files are CommonMark, .mdx files are MDX
  // This prevents MDX parsing errors in .md files with angle brackets
  // Files can override with frontmatter: format: 'mdx' or format: 'md'
  markdown: {
    format: 'detect',
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        indexBlog: true,
        indexDocs: true,
        indexPages: false,
        docsRouteBasePath: [
          '/intro',
          '/system-design',
          '/developer-notes',
          '/docs',
        ],
        blogRouteBasePath: '/blog',
        language: ['en'],
        highlightSearchTermsOnTargetPage: true,
        searchResultLimits: 8,
        searchResultContextMaxLength: 50,
        docsPluginIdForPreferredVersion: 'intro',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'system-design',
        path: '../../system-design-docs', // Path relative to the docusaurus site
        routeBasePath: 'system-design',
        sidebarPath: './sidebarsSystemDesign.ts',
        remarkPlugins: [remarkJsxSanitizer],
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'main-docs',
        path: '../../docs', // Path to the main docs folder
        routeBasePath: 'docs',
        sidebarPath: './sidebarsUserDocs.ts',
        remarkPlugins: [remarkJsxSanitizer],
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'intro',
        path: './docs', // Local docs folder
        routeBasePath: 'intro',
        sidebarPath: './sidebars.ts',
        remarkPlugins: [remarkJsxSanitizer],
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'developer-notes',
        path: '../../developer_notes', // Path to developer notes
        routeBasePath: 'developer-notes',
        sidebarPath: './sidebarsDevNotes.ts',
        remarkPlugins: [remarkJsxSanitizer],
        // With markdown.format: 'detect' and our sanitizer plugin,
        // we should be able to handle all .md files without exclusions
        exclude: ['**/*.bak', '**/*.tmp'],
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
      '@docusaurus/plugin-content-docs',
      {
        id: 'api-docs',
        path: './static/generated-api',
        routeBasePath: 'api-reference',
        sidebarPath: false,
        remarkPlugins: [remarkJsxSanitizer],
      },
    ],
  ],
  presets: [
    [
      'classic',
      {
        docs: false, // Disable default docs plugin since we're using custom instances
        blog: {
          showReadingTime: true,
          remarkPlugins: [remarkJsxSanitizer],
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

  themes: ['docusaurus-theme-redoc'],

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
          to: '/intro', // Changed from /docs to /intro to match routeBasePath
          label: 'Dev Docs',
          position: 'left',
          activeBaseRegex: `/intro`,
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
          to: '/api-reference', // Link to your TypeDoc generated API
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
        {
          type: 'search',
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
              to: '/intro',
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
