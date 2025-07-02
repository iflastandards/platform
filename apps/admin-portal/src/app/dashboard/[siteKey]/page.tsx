import { auth } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import SiteManagementClient from "./SiteManagementClient";
import { SignOut } from "@/app/components/sign-out";

// Force dynamic rendering to avoid static generation issues with auth
export const dynamic = 'force-dynamic';

// Define the valid site keys and their display names
const VALID_SITES = {
  'portal': { title: 'IFLA Portal', code: 'PORTAL' },
  'ISBDM': { title: 'ISBD Manifestation', code: 'ISBDM' },
  'LRM': { title: 'Library Reference Model', code: 'LRM' },
  'FRBR': { title: 'Functional Requirements for Bibliographic Records', code: 'FRBR' },
  'isbd': { title: 'International Standard Bibliographic Description', code: 'ISBD' },
  'muldicat': { title: 'Multilingual Dictionary of Cataloguing Terms', code: 'MULDICAT' },
  'unimarc': { title: 'UNIMARC Format', code: 'UNIMARC' },
  'newtest': { title: 'New Test Site', code: 'NEWTEST' },
} as const;

type SiteKey = keyof typeof VALID_SITES;

interface PageProps {
  params: Promise<{
    siteKey: string;
  }>;
}

// Security function to check if user is authorized for the site
function isAuthorizedForSite(userRoles: string[] | undefined, siteKey: string): boolean {
  // If no roles, user is not authorized
  if (!userRoles || userRoles.length === 0) {
    return false;
  }

  // Check for admin roles that can access all sites
  const adminRoles = ['ifla-admin', 'standards-admin', 'site-admin'];
  if (userRoles.some(role => adminRoles.includes(role))) {
    return true;
  }

  // Check for site-specific roles
  const siteSpecificRoles = [
    `${siteKey.toLowerCase()}-admin`,
    `${siteKey.toLowerCase()}-editor`,
    `${siteKey.toLowerCase()}-contributor`
  ];
  
  return userRoles.some(role => siteSpecificRoles.includes(role.toLowerCase()));
}

export default async function SiteManagementPage({ params }: PageProps) {
  // Get the user session
  const session = await auth();

  // Redirect to sign in if not authenticated
  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Await the params in Next.js 15
  const { siteKey: rawSiteKey } = await params;
  
  // Validate the site key
  const siteKey = rawSiteKey as SiteKey;
  if (!VALID_SITES[siteKey]) {
    redirect('/dashboard');
  }

  // Get user roles from session
  const userRoles = session.user.roles as string[] | undefined;

  // Check authorization for this site
  if (!isAuthorizedForSite(userRoles, siteKey)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Access Denied</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You don't have permission to manage the {VALID_SITES[siteKey].title} site.
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Your roles:</strong> {userRoles?.join(', ') || 'None'}
              </p>
            </div>
            <div className="space-y-3">
              <a 
                href="/dashboard" 
                className="block w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Return to Dashboard
              </a>
              <a 
                href="https://github.com/orgs/iflastandards/teams" 
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Request Access
              </a>
              <div className="pt-2">
                <SignOut />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const siteConfig = VALID_SITES[siteKey];

  return (
    <SiteManagementClient
      siteKey={siteKey}
      siteTitle={siteConfig.title}
      siteCode={siteConfig.code}
      githubRepo="iflastandards/standards-dev"
    />
  );
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
    title: `${siteConfig.title} Management | IFLA Admin Portal`,
    description: `Manage content, workflows, and team collaboration for the ${siteConfig.title} standard.`,
  };
}

