'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { SignIn } from './sign-in'

export function SignInWithMock() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mockUser, setMockUser] = useState<{ attributes: { name: string }; roles: string[] } | null>(null)

  useEffect(() => {
    // Handle mock authentication for development
    if (process.env.NODE_ENV === 'development') {
      const mockUserParam = searchParams.get('mockUser')
      const callbackUrl = searchParams.get('callbackUrl')

      if (mockUserParam && callbackUrl) {
        setIsLoading(true)
        
        try {
          const user = JSON.parse(decodeURIComponent(mockUserParam))
          setMockUser(user)
          
          // Auto-sign in with mock credentials
          signIn('credentials', {
            username: user.attributes.name,
            roles: user.roles.join(','),
            redirect: false
          }).then((result) => {
            if (result?.ok) {
              // Redirect to the callback URL
              setTimeout(() => {
                router.push(decodeURIComponent(callbackUrl))
              }, 1500) // Give user a moment to see the mock authentication message
            } else {
              setError('Mock authentication failed')
              setIsLoading(false)
            }
          }).catch(() => {
            setError('Authentication failed')
            setIsLoading(false)
          })
          
        } catch (_err) {
          setError('Invalid mock user data')
          setIsLoading(false)
        }
        
        return
      }
    }
  }, [searchParams, router])

  // Show mock authentication loading state
  if (isLoading && mockUser) {
    return (
      <div className="space-y-6">
        {/* Mock authentication indicator */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Development Mode - Mock Authentication
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Authenticating as: <strong>{mockUser.attributes.name}</strong></p>
                <p>Role: <strong>{mockUser.roles.join(', ')}</strong></p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading spinner */}
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">
            Signing in and redirecting to your management interface...
          </p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Authentication Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Show regular sign-in form
  return (
    <div className="space-y-6">
      <SignIn />
      
      {/* Development mode indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-600 text-center">
            <span className="font-medium">Development Mode:</span> Mock authentication available via URL parameters
          </p>
        </div>
      )}
    </div>
  )
}