import { useState, useEffect, useCallback } from 'react'

interface Role {
  id: string
  domain_id: string
  role_name: string
  role_claims: Record<string, any>
  created_at: string
  updated_at: string
}

interface RolesResponse {
  roles: Role[]
  total: number
  page: number
  limit: number
  total_pages: number
}

interface UseRolesReturn {
  data: RolesResponse | null
  loading: boolean
  error: string | null
  refetch: () => void
  createRole: (domainId: string, roleData: { role_name: string; role_claims: Record<string, any> }) => Promise<void>
}

export function useRoles(domainId: string, page: number = 1, limit: number = 10): UseRolesReturn {
  const [data, setData] = useState<RolesResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_API

  const fetchRoles = useCallback(async () => {
    if (!domainId) return

    setLoading(true)
    setError(null)

    try {
      const url = new URL(`${baseUrl}/roles`)
      url.searchParams.set('domainId', domainId)
      url.searchParams.set('page', page.toString())
      url.searchParams.set('limit', limit.toString())

      const response = await fetch(url.toString())
      if (!response.ok) {
        throw new Error(`Failed to fetch roles: ${response.statusText}`)
      }

      const result: RolesResponse = await response.json()
      setData(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching roles'
      setError(errorMessage)
      console.error('Error fetching roles:', err)
    } finally {
      setLoading(false)
    }
  }, [baseUrl, domainId, page, limit])

  const createRole = useCallback(async (domainId: string, roleData: { role_name: string; role_claims: Record<string, any> }) => {
    try {
      const response = await fetch(`${baseUrl}/domains/${domainId}/roles`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roleData),
      })

      if (!response.ok) {
        throw new Error(`Failed to create role: ${response.statusText}`)
      }

      // Refetch roles after successful creation
      await fetchRoles()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create role'
      setError(errorMessage)
      throw err
    }
  }, [baseUrl, fetchRoles])

  useEffect(() => {
    if (domainId) {
      fetchRoles()
    }
  }, [fetchRoles, domainId])

  const refetch = useCallback(() => {
    fetchRoles()
  }, [fetchRoles])

  return {
    data,
    loading,
    error,
    refetch,
    createRole,
  }
}
