import type { SidebarItemsGeneratorArgs, NormalizedSidebarItem } from '@docusaurus/plugin-content-docs/lib/sidebars/types';
import { createStandardSiteConfig } from '@ifla/theme/config';

// Create a custom type that includes the undocumented `defaultSidebarItemsGenerator`
type CustomSidebarItemsGeneratorArgs = SidebarItemsGeneratorArgs & {
  defaultSidebarItemsGenerator: (args: SidebarItemsGeneratorArgs) => Promise<NormalizedSidebarItem[]> | NormalizedSidebarItem[];
};

// Custom sidebar generator for ISBDM
const isbdmSidebarGenerator = async (generatorArgs: SidebarItemsGeneratorArgs) => {
  const { defaultSidebarItemsGenerator, ...args } = generatorArgs as CustomSidebarItemsGeneratorArgs;
  const sidebarItems: NormalizedSidebarItem[] = await defaultSidebarItemsGenerator(args);

  function filterIndexMdx(items: NormalizedSidebarItem[]): NormalizedSidebarItem[] {
    return items
      .filter((item: NormalizedSidebarItem) => {
        if (item.type === 'doc') {
          const docId = item.id || (item as any).docId || '';
          if (docId === 'index' || 
              docId.endsWith('/index') || 
              docId.split('/').pop() === 'index') {
            return false;
          }
        }
        return true;
      })
      .map((item: NormalizedSidebarItem) => {
        if (item.type === 'category' && item.items) {
          return {
            ...item,
            items: filterIndexMdx(item.items as NormalizedSidebarItem[]),
          };
        }
        return item;
      });
  }

  return filterIndexMdx(sidebarItems);
};

const config = createStandardSiteConfig({
  siteKey: 'ISBDM',
  title: 'ISBD for Manifestation',
  tagline: 'International Standard Bibliographic Description for Manifestation',
  projectName: 'ISBDM',
  
  // ISBDM-specific vocabulary configuration
  vocabularyDefaults: {
    prefix: "isbdm",
    numberPrefix: "T",
    profile: "isbdm-values-profile-revised.csv",
    elementDefaults: {
      uri: "https://www.iflastandards.info/ISBDM/elements",
      profile: "isbdm-elements-profile.csv",
    }
  },
  
  // GitHub configuration
  editUrl: 'https://github.com/iflastandards/ISBDM/tree/main/',
  
  // Override settings for ISBDM
  overrides: {
    onBrokenLinks: 'ignore', // Override: ignore generated element links
    onBrokenAnchors: 'ignore', // Override: ignore generated anchor links
  },
  
  // ISBDM-specific navbar items
  navbar: {
    items: [
      {
        type: 'dropdown',
        label: 'Instructions',
        position: 'left',
        items: [
          {
            type: 'doc',
            docId: 'intro/index',
            label: 'Introduction',
          },
          {
            type: 'doc',
            docId: 'assess/index',
            label: 'Assessment',
          },
          {
            type: 'doc',
            docId: 'glossary/index',
            label: 'Glossary',
          },
          {
            type: 'doc',
            docId: 'fullex/index',
            label: 'Examples',
          },
        ],
      },
      {
        type: 'dropdown',
        label: 'Elements',
        position: 'left',
        items: [
          {
            type: 'doc',
            docId: 'statements/index',
            label: 'Statements',
          },
          {
            type: 'doc',
            docId: 'notes/index',
            label: 'Notes',
          },
          {
            type: 'doc',
            docId: 'attributes/index',
            label: 'Attributes',
          },
          {
            type: 'doc',
            docId: 'relationships/index',
            label: 'Relationships',
          },
        ],
      },
      {
        type: 'dropdown',
        position: 'left',
        label: 'Values',
        items: [
          {
            type: 'doc',
            docId: 'ves/index',
            label: 'Value Vocabularies',
          },
          {
            type: 'doc',
            docId: 'ses/index',
            label: 'String Encodings Schemes',
          },
        ]
      },
      {
        type: 'dropdown',
        label: 'About',
        position: 'right',
        items: [
          {
            type: 'doc',
            docId: 'about/index',
            label: 'About ISBDM',
          },
          {
            type: 'doc',
            docId: 'about/docusaurus-for-ifla',
            label: 'Modern Documentation Platform',
          },
        ],
      },
    ],
  },
  
  // Custom redirects for ISBDM
  redirects: {
    redirects: [],
    createRedirects: (existingPath: string) => {
      // Check if this is an element path that needs redirection
      const elementMatch = existingPath.match(/^\/docs\/(attributes|statements|notes|relationships)\/(\d+)$/);
      if (elementMatch) {
        const elementId = elementMatch[2];
        return [`/docs/elements/${elementId}`];
      }
      return undefined;
    },
  },
  
  // Use custom sidebar generator
  customSidebarGenerator: true,
});

// Apply custom sidebar generator to the config
if (config.presets && config.presets[0] && Array.isArray(config.presets[0]) && config.presets[0][1]) {
  const presetOptions = config.presets[0][1] as any;
  if (presetOptions.docs) {
    presetOptions.docs.sidebarItemsGenerator = isbdmSidebarGenerator;
  }
}

export default config;
