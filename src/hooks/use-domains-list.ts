import { useState, useEffect } from 'react'

interface Domain {
  domain_id: string
  name: string
  domain: string
}

export function useDomainsList() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDomains = async () => {
    setLoading(true)
    setError(null)

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_API
      const url = new URL(`${baseUrl}/domains`)
      url.searchParams.set('limit', '1000') // Get all domains for dropdown

      const response = await fetch(url.toString())
      if (!response.ok) {
        throw new Error('Failed to fetch domains')
      }

      const result = await response.json()
      setDomains(result.domains || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Error fetching domains:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDomains()
  }, [])

  return {
    domains,
    loading,
    error,
    refetch: fetchDomains
  }
}
