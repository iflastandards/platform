import { redirect } from 'next/navigation';

// Force dynamic rendering to avoid static generation issues with auth
export const dynamic = 'force-dynamic';

// Define the valid site keys (same as dashboard)
const VALID_SITES = {
  portal: { title: 'IFLA Portal', code: 'PORTAL' },
  ISBDM: { title: 'ISBD Manifestation', code: 'ISBDM' },
  LRM: { title: 'Library Reference Model', code: 'LRM' },
  FRBR: {
    title: 'Functional Requirements for Bibliographic Records',
    code: 'FRBR',
  },
  isbd: {
    title: 'International Standard Bibliographic Description',
    code: 'ISBD',
  },
  muldicat: {
    title: 'Multilingual Dictionary of Cataloguing Terms',
    code: 'MULDICAT',
  },
  unimarc: { title: 'UNIMARC Format', code: 'UNIMARC' },
} as const;

type SiteKey = keyof typeof VALID_SITES;

interface PageProps {
  params: Promise<{
    siteKey: string;
  }>;
  searchParams: Promise<{
    returnUrl?: string;
    ref?: string;
  }>;
}

export default async function DirectSiteAccessPage({
  params,
  searchParams,
}: PageProps) {
  const { siteKey: rawSiteKey } = await params;
  const { returnUrl, ref } = await searchParams;

  // Validate the site key
  const siteKey = rawSiteKey as SiteKey;
  if (!VALID_SITES[siteKey]) {
    redirect('/dashboard');
  }

  // Build the redirect URL to the main dashboard with context
  const dashboardUrl = new URL(
    `/dashboard/${siteKey}`,
    'http://localhost:4200',
  );

  // Add context parameters if provided
  if (returnUrl) {
    dashboardUrl.searchParams.set('returnUrl', returnUrl);
  }
  if (ref) {
    dashboardUrl.searchParams.set('ref', ref);
  }

  // Redirect to the main dashboard route
  // Clerk middleware will handle authentication
  redirect(dashboardUrl.toString());
}

// Generate metadata for the page
export async function generateMetadata({ params }: PageProps) {
  const { siteKey: rawSiteKey } = await params;
  const siteKey = rawSiteKey as SiteKey;
  const siteConfig = VALID_SITES[siteKey];

  if (!siteConfig) {
    return {
      title: 'Site Not Found',
    };
  }

  return {
    title: `Accessing ${siteConfig.title} Management | IFLA Admin Portal`,
    description: `Redirecting to ${siteConfig.title} management interface.`,
  };
}