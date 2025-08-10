export interface Breadcrumb {
  label: string;
  href: string;
}

export function generateBreadcrumbs(pathname: string): Breadcrumb[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: Breadcrumb[] = [
    { label: 'Dashboard', href: '/dashboard' },
  ];

  let currentPath = '/dashboard';

  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;

    // Map segments to user-friendly labels
    const label = getBreadcrumbLabel(segment, segments.slice(0, i + 1));
    breadcrumbs.push({ label, href: currentPath });
  }

  return breadcrumbs;
}

function getBreadcrumbLabel(segment: string, fullPath: string[]): string {
  const labelMap: Record<string, string> = {
    // Dashboard types
    author: 'Author',
    editor: 'Editor',
    admin: 'Admin',
    rg: 'Review Group',
    
    // Site management sections
    content: 'Content',
    vocabularies: 'Vocabularies',
    elements: 'Elements',
    rdf: 'RDF & Vocabularies',
    workflow: 'Review & Workflow',
    team: 'Team',
    releases: 'Releases',
    quality: 'Quality',
    github: 'GitHub',
    settings: 'Settings',
    
    // Actions
    edit: 'Edit',
    new: 'New',
    create: 'Create',
    
    // Common terms
    projects: 'Projects',
    namespaces: 'Namespaces',
    tasks: 'Tasks',
    review: 'Review Queue',
    translation: 'Translation',
    tools: 'Tools & Resources',
  };

  // Handle site keys (they should be uppercase)
  if (fullPath.length >= 2 && fullPath[0] === 'dashboard' && !labelMap[segment]) {
    return segment.toUpperCase();
  }

  return labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
}