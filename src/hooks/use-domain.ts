import { useState, useEffect, useCallback } from 'react'

interface Domain {
  domain_id: string
  name: string
  domain: string
}

interface DomainsResponse {
  domains: Domain[]
  total: number
  page: number
  limit: number
  total_pages: number
}

interface UseDomainsReturn {
  data: DomainsResponse | null
  loading: boolean
  error: string | null
  refetch: () => void
  addDomain: (domainData: Omit<Domain, 'domain_id'>) => Promise<void>
  updateDomain: (domainId: string, domainData: Omit<Domain, 'domain_id'>) => Promise<void>
  deleteDomain: (domainId: string) => Promise<void>
}

export function useDomains(search: string = '', page: number = 1, limit: number = 10): UseDomainsReturn {
  const [data, setData] = useState<DomainsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_API

  const fetchDomains = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const url = new URL(`${baseUrl}/domains`)
      url.searchParams.set('search', search)
      url.searchParams.set('page', page.toString())
      url.searchParams.set('limit', limit.toString())

      const response = await fetch(url.toString())
      if (!response.ok) {
        throw new Error(`Failed to fetch domains: ${response.statusText}`)
      }

      const result: DomainsResponse = await response.json()
      setData(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching domains'
      setError(errorMessage)
      console.error('Error fetching domains:', err)
    } finally {
      setLoading(false)
    }
  }, [baseUrl, search, page, limit])

  const addDomain = useCallback(async (domainData: Omit<Domain, 'domain_id'>) => {
    try {
      const response = await fetch(`${baseUrl}/domains`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(domainData),
      })

      if (!response.ok) {
        throw new Error(`Failed to add domain: ${response.statusText}`)
      }

      // Refetch data after successful addition
      await fetchDomains()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add domain'
      setError(errorMessage)
      throw err
    }
  }, [baseUrl, fetchDomains])

  const updateDomain = useCallback(async (domainId: string, domainData: Omit<Domain, 'domain_id'>) => {
    try {
      const response = await fetch(`${baseUrl}/domains/${domainId}`, {
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(domainData),
      })

      if (!response.ok) {
        throw new Error(`Failed to update domain: ${response.statusText}`)
      }

      // Refetch data after successful update
      await fetchDomains()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update domain'
      setError(errorMessage)
      throw err
    }
  }, [baseUrl, fetchDomains])

  const deleteDomain = useCallback(async (domainId: string) => {
    try {
      const response = await fetch(`${baseUrl}/domains/${domainId}`, {
        method: 'DELETE',
        headers: {
          'accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to delete domain: ${response.statusText}`)
      }

      // Refetch data after successful deletion
      await fetchDomains()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete domain'
      setError(errorMessage)
      throw err
    }
  }, [baseUrl, fetchDomains])

  useEffect(() => {
    fetchDomains()
  }, [fetchDomains])

  const refetch = useCallback(() => {
    fetchDomains()
  }, [fetchDomains])

  return {
    data,
    loading,
    error,
    refetch,
    addDomain,
    updateDomain,
    deleteDomain,
  }
}