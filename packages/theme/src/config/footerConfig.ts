import { Environment, getPortalUrl, getAdminPortalConfig, SiteKey } from './siteConfig';

interface FooterOptions {
  rdfPath?: string;
  standardsDocumentUrl?: string;
}

// Site-specific standards document URLs
const STANDARDS_DOCUMENT_URLS: Record<SiteKey, string> = {
  portal: 'https://www.ifla.org/programmes/ifla-standards/',
  ISBDM: 'https://www.ifla.org/wp-content/uploads/2019/05/assets/cataloguing/isbd/isbd-cons_20110321.pdf',
  LRM: 'https://www.ifla.org/files/assets/cataloguing/frbr-lrm/ifla-lrm-august-2017_rev201712.pdf',
  FRBR: 'https://www.ifla.org/files/assets/cataloguing/frbr/frbr_2008.pdf',
  isbd: 'https://www.ifla.org/wp-content/uploads/2019/05/assets/cataloguing/isbd/isbd-cons_20110321.pdf',
  muldicat: 'https://www.ifla.org/programmes/ifla-standards/',
  unimarc: 'https://www.ifla.org/publications/unimarc-formats-and-related-documentation/',
  newtest: 'https://www.ifla.org/programmes/ifla-standards/',
};

export function createStandardFooter(DOCS_ENV: Environment, siteKey: SiteKey, options?: FooterOptions) {
  const adminConfig = getAdminPortalConfig(DOCS_ENV);
  const rdfPath = options?.rdfPath || '/rdf/';
  const standardsUrl = options?.standardsDocumentUrl || STANDARDS_DOCUMENT_URLS[siteKey];

  return {
    style: 'dark' as const,
    links: [
      {
        title: 'Resources',
        items: [
          {
            label: 'RDF Downloads',
            to: rdfPath,
          },
          {
            label: 'Sitemap',
            to: '/sitemap',
          },
          {
            label: 'Management',
            href: `${adminConfig.dashboardUrl}/${siteKey}`,
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
            href: standardsUrl,
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
