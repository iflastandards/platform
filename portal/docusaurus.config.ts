/* eslint-disable import/first */
import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import {
  getSiteConfig,
  getSiteConfigMap,
  getAdminPortalConfig,
  type SiteKey,
  type Environment,
  DocsEnv,                        // ⬅️ enum already declared in theme package
} from '@ifla/theme/config/siteConfig';

/* ----------------------------------------------------------------------------
 * 🗺️ 1. Determine current docs environment
 * -------------------------------------------------------------------------- */

const DOCS_ENV = (process.env.DOCS_ENV as Environment | undefined) ?? 'production';
if (!DOCS_ENV) {
  throw new Error(
    'DOCS_ENV environment variable is required but not set. ' +
      'Valid values: local, preview, production',
  );
}
const isLocalBuild = DOCS_ENV === DocsEnv.Localhost;

/* ----------------------------------------------------------------------------
 * 🗺️ 2. Gather per-site configuration
 * -------------------------------------------------------------------------- */

const siteConfig      = getSiteConfig('portal' as SiteKey, DOCS_ENV);
const siteConfigMap   = getSiteConfigMap(DOCS_ENV);
const adminConfig     = getAdminPortalConfig(DOCS_ENV);

/* ----------------------------------------------------------------------------
 * 🏗️ 3. Docusaurus configuration
 * -------------------------------------------------------------------------- */

const config: Config = {
  future: { v4: true, experimental_faster: true },

  title:   'IFLA Standards Portal',
  tagline: 'International Federation of Library Associations and Institutions',
  favicon: 'img/favicon.ico',

  url:      siteConfig.url,
  baseUrl:  siteConfig.baseUrl,

  organizationName: 'iflastandards',
  projectName:      'portal',

  onBrokenLinks:          'warn',
  onBrokenMarkdownLinks:  'warn',
  onBrokenAnchors:        'ignore',

  staticDirectories: ['static', '../packages/theme/static'],

  customFields: {
    // Site configuration map for accessing sister site URLs
    siteConfigMap,
    // Legacy field name for portal components compatibility
    siteConfigs: siteConfigMap,
    // Vocabulary configuration
    vocabularyDefaults: {
      prefix: 'ifla',
      startCounter: 1000,
      uriStyle: 'numeric',
      numberPrefix: 'T', // Prefix for numeric URIs. Can be blank for no prefix.
      caseStyle: 'kebab-case',
      showFilter: true,
      filterPlaceholder: 'Filter vocabulary terms...',
      showTitle: false,
      showURIs: true, // Whether to display URIs in the table, set to false for glossaries
      showCSVErrors: false, // Whether to display CSV validation errors by default
      profile: 'vocabulary-profile.csv',
      profileShapeId: 'Concept',
      RDF: {
        'rdf:type': ['skos:ConceptScheme'],
      },
      // Common defaults for elements and defines the vocabulary properties
      elementDefaults: {
        uri: 'https://www.iflastandards.info/elements',
        classPrefix: 'C', // Class Prefix for numeric URIs. Can be blank for no prefix.
        propertyPrefix: 'P', // Property Prefix for numeric URIs. Can be blank for no prefix.
        profile: 'elements-profile.csv',
        profileShapeId: 'Element',
      },
    },
  },

  i18n: { defaultLocale: 'en', locales: ['en'] },

  /* ---------------------------------------------------------------------- */
  /* 4. Plugins – conditionally include “developer” & OpenAPI docs locally  */
  /* ---------------------------------------------------------------------- */
  plugins: [
    'docusaurus-plugin-sass',

    [
      '@easyops-cn/docusaurus-search-local',
      { hashed: true, indexBlog: true },
    ],

    /* Developer documentation (Markdown) – always enabled */
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'developer',
        path: 'docs/developer',
        routeBasePath: '/',
        sidebarPath: './sidebars.ts',

        /* Public/preview builds exclude private folders */
        exclude: isLocalBuild
          ? []                       // keep every file in local dev
          : ['api/**', 'generated/**', 'guides/internal/**'],
      },
    ],

    /* OpenAPI reference – ONLY generated in local builds */
    isLocalBuild && [
      '@docusaurus/plugin-openapi-docs',
      {
        id: 'api',
        docsPluginId: 'developer',
        config: {
          admin: {
            specPath:  'docs/developer/api/admin.yaml',
            outputDir: 'docs/developer/generated/admin',
            sidebarOptions: { groupPathsBy: 'tag' },
          },
        },
      },
    ],
  ].filter(Boolean),

  /* ---------------------------------------------------------------------- */
  /* 5. Presets (classic) – unchanged except for docs id/version updates    */
  /* ---------------------------------------------------------------------- */
  presets: [
    [
      'classic',
      {
        docs: {
          id: 'legacy',                  // keep classic docs under separate id
          path: 'docs',                  // original portal docs
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/iflastandards/standards-dev/tree/main/portal/',
          showLastUpdateAuthor: false,
          showLastUpdateTime:   true,
          versions: {
            current: { label: 'Latest', path: '' },
          },
          lastVersion:          'current',
          onlyIncludeVersions:  ['current'],
        },
        blog: {
          showReadingTime: true,
          editUrl:
            'https://github.com/iflastandards/standards-dev/tree/main/portal/',
          feedOptions: {
            type:        'all',
            title:       'IFLA Standards Portal Blog',
            description: 'Updates and news about IFLA Standards Portal',
            copyright:   `Copyright © ${new Date().getFullYear()} IFLA.`,
            language:    'en',
          },
        },
        theme: { customCss: './src/css/custom.css' },
      } satisfies Preset.Options,
    ],
  ],

  /* ---------------------------------------------------------------------- */
  /* 6. Theme config – unchanged (navbars, prism, etc.)                     */
  /* ---------------------------------------------------------------------- */
  themeConfig: {
    /* …existing themeConfig stays untouched… */
    docs:           { sidebar: { hideable: true, autoCollapseCategories: true }, versionPersistence: 'localStorage' },
    tableOfContents:{ minHeadingLevel: 2, maxHeadingLevel: 6 },
    image:          'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'IFLA Standards',
      logo: {
        alt: 'IFLA Logo',
        src: 'img/logo-ifla_black.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Documentation',
        },
        {
          to: '/manage',
          label: 'Management',
          position: 'left',
          className: 'navbar__item--management',
        },
        { to: '/blog', label: 'Blog', position: 'right' },
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
          title: 'Resources',
          items: [
            {
              label: 'Admin Dashboard',
              href: adminConfig.dashboardUrl,
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'IFLA Website',
              href: 'https://www.ifla.org/',
            },
            {
              label: 'IFLA Standards',
              href: 'https://www.ifla.org/programmes/ifla-standards/',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Portal',
              href: `${siteConfig.url === siteConfigMap.portal.url ? '/' : siteConfigMap.portal.url + siteConfigMap.portal.baseUrl}`,
            },
            {
              label: 'GitHub',
              href: 'https://github.com/iflastandards/standards-dev',
            },
          ],
        },
      ],
      copyright: `
      Copyright © ${new Date().getFullYear()} International Federation of Library Associations and Institutions (IFLA)<br />
      <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">
        <img src="img/cc0_by.png" alt="CC BY 4.0" style="vertical-align:middle; height:24px;" />
      </a>
      Gordon Dunsire and Mirna Willer (Main design and content editors).
    `,
    },
    prism:  { theme: prismThemes.github, darkTheme: prismThemes.dracula },
  } satisfies Preset.ThemeConfig,
};

export default config;
