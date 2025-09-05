import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  username: string
  role_id: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (userData: User, token: string) => void
  logout: () => void
  checkAuth: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const login = (userData: User, token: string) => {
    setUser(userData)

    // Save to cookies
    document.cookie = `auth_token=${token}; path=/; max-age=86400; samesite=strict`
    document.cookie = `user_data=${JSON.stringify(userData)}; path=/; max-age=86400; samesite=strict`

    router.push('/')
  }

  const logout = () => {
    setUser(null)

    // Clear cookies
    document.cookie = 'auth_token=; path=/; max-age=0'
    document.cookie = 'user_data=; path=/; max-age=0'

    router.push('/login')
  }

  const checkAuth = (): boolean => {
    // Check if cookies exist
    const cookies = document.cookie.split(';')
    const authToken = cookies.find(cookie => cookie.trim().startsWith('auth_token='))
    const userData = cookies.find(cookie => cookie.trim().startsWith('user_data='))

    if (authToken && userData) {
      try {
        const token = authToken.split('=')[1]
        const user = JSON.parse(userData.split('=')[1])

        if (token && user) {
          setUser(user)
          return true
        }
      } catch (error) {
        console.error('Error parsing auth data from cookies:', error)
        logout() // Clear invalid data
      }
    }

    return false
  }

  useEffect(() => {
    // Check authentication on mount
    const isAuthenticated = checkAuth()
    setIsLoading(false)

    // If not authenticated and not on login page, redirect to login
    if (!isAuthenticated && window.location.pathname !== '/login') {
      router.push('/login')
    }
  }, [router])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
