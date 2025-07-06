import { auth } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { SignOut } from '@/app/components/sign-out';

// Force dynamic rendering to avoid static generation issues with auth
export const dynamic = 'force-dynamic';

const SITES = [
  {
    key: 'portal',
    title: 'IFLA Portal',
    description: 'Main portal site with management interface',
  },
  {
    key: 'ISBDM',
    title: 'ISBD Manifestation',
    description: 'ISBD Manifestation standard documentation',
  },
  {
    key: 'LRM',
    title: 'Library Reference Model',
    description: 'IFLA Library Reference Model',
  },
  {
    key: 'FRBR',
    title: 'FRBR',
    description: 'Functional Requirements for Bibliographic Records',
  },
  {
    key: 'isbd',
    title: 'ISBD',
    description: 'International Standard Bibliographic Description',
  },
  {
    key: 'muldicat',
    title: 'MulDiCat',
    description: 'Multilingual Dictionary of Cataloguing Terms',
  },
  {
    key: 'unimarc',
    title: 'UNIMARC',
    description: 'UNIMARC Format documentation',
  },
];

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const userRoles = (session.user.roles as string[]) || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with sign out */}
        <div className="flex justify-between items-center mb-8">
          <div></div>
          <SignOut />
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            IFLA Admin Dashboard
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Welcome, {session.user.name || session.user.email}
          </p>
          <div className="mt-4 inline-block bg-blue-50 dark:bg-blue-900 px-4 py-2 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Your roles:</strong>{' '}
              {userRoles.length > 0 ? userRoles.join(', ') : 'None'}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Manage Sites
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SITES.map((site) => (
              <Link
                key={site.key}
                href={`/dashboard/${site.key}`}
                className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {site.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {site.description}
                </p>
                <div className="mt-4 inline-flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                  Manage Site
                  <svg
                    className="ml-2 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="https://github.com/iflastandards/standards-dev"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                View GitHub Repository
              </span>
            </a>
            <a
              href="https://github.com/iflastandards/standards-dev/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                View Issues
              </span>
            </a>
            <a
              href="https://github.com/orgs/iflastandards/teams"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Manage Teams
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
