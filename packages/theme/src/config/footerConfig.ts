import { Environment, getPortalUrl } from './siteConfig';

export function createStandardFooter(DOCS_ENV: Environment) {
  return {
    style: 'dark',
    links: [
      {
        title: 'Resources',
        items: [
          {
            label: 'RDF Downloads',
            to: '/rdf/',
          },
          {
            label: 'Sitemap',
            to: '/sitemap',
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
            href: getPortalUrl(DOCS_ENV),
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
  };
}
