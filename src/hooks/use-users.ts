import { useState, useEffect, useCallback } from 'react'

interface User {
  id: string
  domain_id: string
  role_id: string
  first_name: string
  last_name: string
  username: string
  email: string
  created_at: string
  updated_at: string
}

interface UsersResponse {
  users: User[]
  total: number
  page: number
  limit: number
  total_pages: number
}

interface UseUsersReturn {
  data: UsersResponse | null
  loading: boolean
  error: string | null
  refetch: () => void
  search: string
  setSearch: (search: string) => void
  page: number
  setPage: (page: number) => void
  limit: number
  setLimit: (limit: number) => void
}

export function useUsers(domainId: string, initialSearch: string = "", initialPage: number = 1, initialLimit: number = 10): UseUsersReturn {
  const [data, setData] = useState<UsersResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState(initialSearch)
  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_API

  const fetchUsers = useCallback(async () => {
    if (!domainId) return

    setLoading(true)
    setError(null)

    try {
      const url = new URL(`${baseUrl}/users`)
      url.searchParams.set('domainId', domainId)
      url.searchParams.set('search', search)
      url.searchParams.set('page', page.toString())
      url.searchParams.set('limit', limit.toString())

      const response = await fetch(url.toString())
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`)
      }

      const result: UsersResponse = await response.json()
      setData(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching users'
      setError(errorMessage)
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }, [baseUrl, domainId, search, page, limit])

  useEffect(() => {
    if (domainId) {
      fetchUsers()
    }
  }, [fetchUsers, domainId])

  const refetch = useCallback(() => {
    fetchUsers()
  }, [fetchUsers])

  return {
    data,
    loading,
    error,
    refetch,
    search,
    setSearch,
    page,
    setPage,
    limit,
    setLimit,
  }
}
