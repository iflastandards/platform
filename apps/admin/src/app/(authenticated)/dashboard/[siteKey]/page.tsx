import { getAuthUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import NamespaceManagementClient from './NamespaceManagementClient';
import { UserButton } from '@clerk/nextjs';
import { getPortalUrl } from '@/lib/get-portal-url';
import { mockNamespaces } from '@/lib/mock-data/namespaces-extended';

// Force dynamic rendering to avoid static generation issues with auth
export const dynamic = 'force-dynamic';

// Define the valid namespace keys and their display names
// Note: Each 'site' is actually a namespace, except portal and newtest which are special cases
interface NamespaceConfig {
  title: string;
  code: string;
  description?: string;
  isSpecialCase?: boolean;
}

const VALID_NAMESPACES: Record<string, NamespaceConfig> = {
  // Special cases - not standard namespaces
  portal: { 
    title: 'IFLA Portal', 
    code: 'PORTAL',
    isSpecialCase: true,
    description: 'Main IFLA standards platform - requires superadmin access'
  },
  newtest: { 
    title: 'Test Environment', 
    code: 'NEWTEST',
    isSpecialCase: true,
    description: 'Development and testing environment - requires superadmin access'
  },
  // Standard namespaces
  isbdm: { 
    title: 'ISBD Manifestation', 
    code: 'ISBDM',
    description: mockNamespaces['isbdm']?.description
  },
  lrm: { 
    title: 'Library Reference Model', 
    code: 'LRM',
    description: mockNamespaces['lrm']?.description
  },
  frbr: {
    title: 'Functional Requirements for Bibliographic Records',
    code: 'FRBR',
    description: mockNamespaces['frbr']?.description
  },
  isbd: {
    title: 'International Standard Bibliographic Description',
    code: 'ISBD',
    description: mockNamespaces['isbd']?.description
  },
  muldicat: {
    title: 'Multilingual Dictionary of Cataloguing Terms',
    code: 'MULDICAT',
    description: mockNamespaces['muldicat']?.description
  },
  unimarc: { 
    title: 'UNIMARC Format', 
    code: 'UNIMARC',
    description: mockNamespaces['unimarc']?.description
  },
};

type NamespaceKey = keyof typeof VALID_NAMESPACES;

interface PageProps {
  params: Promise<{
    siteKey: string;
  }>;
}

// Security function to check if user is authorized for the namespace
function isAuthorizedForNamespace(
  userRoles: string[] | undefined,
  namespaceKey: string,
  isSpecialCase: boolean,
): boolean {
  // If no roles, user is not authorized
  if (!userRoles || userRoles.length === 0) {
    return false;
  }

  // For special cases (portal/newtest), only superadmins have access
  if (isSpecialCase) {
    return userRoles.includes('super-admin');
  }

  // Check for admin roles that can access all namespaces
  const adminRoles = ['super-admin', 'ifla-admin', 'standards-admin', 'admin'];
  if (userRoles.some((role) => adminRoles.includes(role))) {
    return true;
  }

  // Check for namespace-specific roles
  const namespaceSpecificRoles = [
    `${namespaceKey.toLowerCase()}-admin`,
    `${namespaceKey.toLowerCase()}-editor`,
    `${namespaceKey.toLowerCase()}-contributor`,
  ];

  return userRoles.some((role) =>
    namespaceSpecificRoles.includes(role.toLowerCase()),
  );
}

export default async function NamespaceManagementPage({ params }: PageProps) {
  // Get the user from Clerk authentication
  const user = await getAuthUser();

  // Redirect to sign in if not authenticated (though Clerk middleware should handle this)
  if (!user) {
    redirect('/sign-in');
  }

  // Await the params in Next.js 15
  const { siteKey: rawNamespaceKey } = await params;

  // Validate the namespace key (still using siteKey in URL for backwards compatibility)
  const namespaceKey = rawNamespaceKey.toLowerCase() as NamespaceKey;
  if (!VALID_NAMESPACES[namespaceKey]) {
    redirect('/dashboard');
  }

  // Get namespace configuration
  const namespaceConfig = VALID_NAMESPACES[namespaceKey];
  const isSpecialCase = namespaceConfig.isSpecialCase || false;

  // Get user roles
  const userRoles = user.roles;
  const isSuperAdmin = userRoles?.includes('super-admin') || false;

  // Check authorization for this namespace
  if (!isAuthorizedForNamespace(userRoles, namespaceKey, isSpecialCase)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Access Denied
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {isSpecialCase ? (
                <>
                  You don&apos;t have permission to manage {namespaceConfig.title}. 
                  This is a special system area that requires superadmin access.
                </>
              ) : (
                <>
                  You don&apos;t have permission to manage the{' '}
                  {namespaceConfig.title} namespace.
                </>
              )}
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
              <div className="pt-2 flex justify-center">
                <UserButton 
                  afterSignOutUrl={getPortalUrl()}
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-10 h-10",
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <NamespaceManagementClient
      namespaceKey={namespaceKey}
      namespaceTitle={namespaceConfig.title}
      namespaceCode={namespaceConfig.code}
      namespaceDescription={namespaceConfig.description}
      githubRepo="iflastandards/standards-dev"
      isSpecialCase={isSpecialCase}
      isSuperAdmin={isSuperAdmin}
    />
  );
}

// Generate metadata for the page
export async function generateMetadata({ params }: PageProps) {
  const { siteKey: rawNamespaceKey } = await params;
  const namespaceKey = rawNamespaceKey.toLowerCase() as NamespaceKey;
  const namespaceConfig = VALID_NAMESPACES[namespaceKey];

  if (!namespaceConfig) {
    return {
      title: 'Namespace Not Found',
    };
  }

  const titleSuffix = namespaceConfig.isSpecialCase ? 'System' : 'Namespace';

  return {
    title: `${namespaceConfig.title} ${titleSuffix} Management | IFLA Admin Portal`,
    description: namespaceConfig.description || 
      `Manage content, workflows, and team collaboration for the ${namespaceConfig.title} namespace.`,
  };
}
