"use client"
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Copy, Play, Check } from "lucide-react"
import { useState } from 'react'

interface ApiEndpoint {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  description: string
  summary: string
  tags: string[]
  parameters: Array<{
    name: string
    in: 'header' | 'body' | 'query' | 'path'
    type?: string
    description: string
    required: boolean
    schema?: any
  }>
  responses: Record<string, {
    description: string
    schema?: any
  }>
}

const ApiPage = () => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, any>>({})
  const [testInputs, setTestInputs] = useState<Record<string, any>>({})

  const baseUrl = process.env.NEXT_PUBLIC_BASE_API || 'http://localhost:8080'

  const endpoints: ApiEndpoint[] = [
    {
      path: '/auth/login',
      method: 'POST',
      description: 'Authenticate user and return JWT token',
      summary: 'User login',
      tags: ['auth'],
      parameters: [
        {
          name: 'X-NRM-DID',
          in: 'header',
          type: 'string',
          description: 'Domain ID',
          required: true
        },
        {
          name: 'credentials',
          in: 'body',
          description: 'Login credentials',
          required: true,
          schema: {
              username: "",
              password: ""
          }
        }
      ],
      responses: {
        '200': {
          description: 'OK',
          schema: {
            type: 'object',
            properties: {
              token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
              user: { type: 'object', additionalProperties: true }
            }
          }
        },
        '400': {
          description: 'Bad Request',
          schema: {
            type: 'object',
            additionalProperties: { type: 'string' }
          }
        },
        '401': {
          description: 'Unauthorized',
          schema: {
            type: 'object',
            additionalProperties: { type: 'string' }
          }
        },
        '500': {
          description: 'Internal Server Error',
          schema: {
            type: 'object',
            additionalProperties: { type: 'string' }
          }
        }
      }
    },
    {
      path: '/auth/profile',
      method: 'GET',
      description: 'Get authenticated user\'s profile information',
      summary: 'Get user profile',
      tags: ['auth'],
      parameters: [
        {
          name: 'Authorization',
          in: 'header',
          type: 'string',
          description: 'Bearer token',
          required: true
        }
      ],
      responses: {
        '200': {
          description: 'OK',
          schema: {
            type: 'object',
            additionalProperties: true
          }
        },
        '401': {
          description: 'Unauthorized',
          schema: {
            type: 'object',
            additionalProperties: { type: 'string' }
          }
        },
        '500': {
          description: 'Internal Server Error',
          schema: {
            type: 'object',
            additionalProperties: { type: 'string' }
          }
        }
      }
    },
    {
      path: '/auth/validate',
      method: 'POST',
      description: 'Validate JWT token and return user information',
      summary: 'Validate JWT token',
      tags: ['auth'],
      parameters: [
        {
          name: 'Authorization',
          in: 'header',
          type: 'string',
          description: 'Bearer token',
          required: true
        }
      ],
      responses: {
        '200': {
          description: 'OK',
          schema: {
            type: 'object',
            additionalProperties: true
          }
        },
        '401': {
          description: 'Unauthorized',
          schema: {
            type: 'object',
            additionalProperties: { type: 'string' }
          }
        },
        '500': {
          description: 'Internal Server Error',
          schema: {
            type: 'object',
            additionalProperties: { type: 'string' }
          }
        }
      }
    }
  ]

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedUrl(type)
      setTimeout(() => setCopiedUrl(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const testEndpoint = async (endpoint: ApiEndpoint) => {
    const endpointKey = `${endpoint.method}-${endpoint.path}`
    const inputs = testInputs[endpointKey] || {}

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      // Add headers from inputs
      endpoint.parameters.forEach(param => {
        if (param.in === 'header' && inputs[param.name]) {
          headers[param.name] = inputs[param.name]
        }
      })

      let body = undefined
      if (endpoint.method !== 'GET' && inputs.body) {
        body = inputs.body
      }

      console.log(`🚀 Making ${endpoint.method} request to: ${baseUrl}${endpoint.path}`)
      console.log('📋 Headers:', headers)
      if (body) console.log('📦 Body:', body)

      const response = await fetch(`${baseUrl}${endpoint.path}`, {
        method: endpoint.method,
        headers,
        body,
        mode: 'cors', // Explicitly set CORS mode
        credentials: 'include' // Include credentials if needed
      })

      console.log(`✅ Response Status: ${response.status} ${response.statusText}`)

      const responseData = await response.json().catch(() => ({}))

      setTestResults(prev => ({
        ...prev,
        [endpointKey]: {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
          headers: Object.fromEntries(response.headers.entries()),
          requestDetails: {
            method: endpoint.method,
            url: `${baseUrl}${endpoint.path}`,
            headers: headers,
            body: body
          }
        }
      }))
    } catch (error) {
      console.error('❌ Request failed:', error)
      setTestResults(prev => ({
        ...prev,
        [endpointKey]: {
          error: error instanceof Error ? error.message : 'Unknown error',
          corsError: error instanceof Error && error.message.includes('CORS')
        }
      }))
    }
  }

  const updateTestInput = (endpointKey: string, field: string, value: string) => {
    setTestInputs(prev => ({
      ...prev,
      [endpointKey]: {
        ...prev[endpointKey],
        [field]: value
      }
    }))
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-500'
      case 'POST': return 'bg-blue-500'
      case 'PUT': return 'bg-yellow-500'
      case 'DELETE': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <DashboardLayout breadcrumb={["API", "Documentation"]}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">API Documentation</h1>
          <div className="text-sm text-muted-foreground">
            Base URL: {baseUrl}
          </div>
        </div>

        {/* OPTIONS vs POST Explanation */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <span>🔄 OPTIONS vs POST Requests</span>
            </CardTitle>
            <CardDescription className="text-blue-700">
              Understanding CORS preflight requests and why browsers send OPTIONS before POST.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-blue-800">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold mb-2">Why OPTIONS Requests?</h4>
                <p className="text-sm mb-2">
                  When your frontend makes a cross-origin request with custom headers or JSON body, browsers automatically send an OPTIONS request first. This is called a "preflight" request.
                </p>
                <div className="bg-blue-100 p-3 rounded text-sm">
                  <p><strong>OPTIONS Request:</strong> Browser asks "Can I make this POST request?"</p>
                  <p><strong>POST Request:</strong> Browser makes the actual request (only if OPTIONS succeeds)</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Backend Response to OPTIONS:</h4>
                <pre className="bg-blue-100 p-3 rounded text-sm overflow-x-auto">
{`HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-NRM-DID
Access-Control-Max-Age: 86400`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Go/Gin Example:</h4>
                <pre className="bg-blue-100 p-3 rounded text-sm overflow-x-auto">
{`// Handle OPTIONS requests for all routes
router.OPTIONS("/*any", func(c *gin.Context) {
    c.Header("Access-Control-Allow-Origin", "http://localhost:3000")
    c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-NRM-DID")
    c.Header("Access-Control-Max-Age", "86400")
    c.Status(200)
})`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {endpoints.map((endpoint, index) => {
            const endpointKey = `${endpoint.method}-${endpoint.path}`
            const testResult = testResults[endpointKey]

            return (
              <Card key={index} className="w-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={`${getMethodColor(endpoint.method)} text-white`}>
                        {endpoint.method}
                      </Badge>
                      <CardTitle className="text-lg">{endpoint.path}</CardTitle>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(`${baseUrl}${endpoint.path}`, endpoint.path)}
                    >
                      {copiedUrl === endpoint.path ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <CardDescription>{endpoint.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="test">Test</TabsTrigger>
                      <TabsTrigger value="response">Response</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Summary</h4>
                        <p className="text-sm text-muted-foreground">{endpoint.summary}</p>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-semibold mb-2">Parameters</h4>
                        <div className="space-y-2">
                          {endpoint.parameters.map((param, paramIndex) => (
                            <div key={paramIndex} className="border rounded p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">{param.in}</Badge>
                                <code className="text-sm">{param.name}</code>
                                {param.required && <Badge variant="destructive">Required</Badge>}
                              </div>
                              <p className="text-sm text-muted-foreground">{param.description}</p>
                              {param.schema && (
                                <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-x-auto">
                                  {JSON.stringify(param.schema, null, 2)}
                                </pre>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-semibold mb-2">Responses</h4>
                        <div className="space-y-2">
                          {Object.entries(endpoint.responses).map(([status, response]) => (
                            <div key={status} className="border rounded p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant={status.startsWith('2') ? 'default' : 'destructive'}>
                                  {status}
                                </Badge>
                                <span className="text-sm">{response.description}</span>
                              </div>
                              {response.schema && (
                                <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-x-auto">
                                  {JSON.stringify(response.schema, null, 2)}
                                </pre>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="test" className="space-y-4">
                      <div className="space-y-4">
                        {endpoint.parameters.map((param, paramIndex) => (
                          <div key={paramIndex}>
                            <Label htmlFor={`${endpointKey}-${param.name}`}>
                              {param.name} {param.required && <span className="text-red-500">*</span>}
                            </Label>
                            {param.in === 'header' ? (
                              <Input
                                id={`${endpointKey}-${param.name}`}
                                placeholder={`Enter ${param.name}`}
                                value={testInputs[endpointKey]?.[param.name] || ''}
                                onChange={(e) => updateTestInput(endpointKey, param.name, e.target.value)}
                              />
                            ) : param.in === 'body' ? (
                              <Textarea
                                id={`${endpointKey}-${param.name}`}
                                placeholder="Enter JSON body"
                                value={testInputs[endpointKey]?.body || ''}
                                onChange={(e) => updateTestInput(endpointKey, 'body', e.target.value)}
                                rows={4}
                              />
                            ) : (
                              <Input
                                id={`${endpointKey}-${param.name}`}
                                placeholder={`Enter ${param.name}`}
                                value={testInputs[endpointKey]?.[param.name] || ''}
                                onChange={(e) => updateTestInput(endpointKey, param.name, e.target.value)}
                              />
                            )}
                          </div>
                        ))}

                        <Button onClick={() => testEndpoint(endpoint)} className="w-full">
                          <Play className="h-4 w-4 mr-2" />
                          Test {endpoint.method} {endpoint.path}
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="response" className="space-y-4">
                      {testResult ? (
                        <div className="space-y-4">
                          {testResult.error ? (
                            <div className={`border p-4 rounded ${testResult.corsError ? 'border-orange-200 bg-orange-50' : 'border-red-200 bg-red-50'}`}>
                              <h4 className={`font-semibold mb-2 ${testResult.corsError ? 'text-orange-800' : 'text-red-800'}`}>
                                {testResult.corsError ? 'CORS Error' : 'Error'}
                              </h4>
                              <p className={testResult.corsError ? 'text-orange-700' : 'text-red-700'}>
                                {testResult.error}
                              </p>
                              {testResult.corsError && (
                                <div className="mt-3 p-3 bg-orange-100 rounded text-sm">
                                  <p className="font-medium mb-1">CORS Troubleshooting:</p>
                                  <ul className="list-disc list-inside space-y-1 text-orange-800">
                                    <li>Check if your backend server has CORS enabled for all endpoints</li>
                                    <li>Verify the backend allows your frontend origin</li>
                                    <li>Ensure all required headers are allowed</li>
                                    <li>Check if preflight OPTIONS requests are handled</li>
                                  </ul>
                                </div>
                              )}
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <Badge variant={testResult.status >= 200 && testResult.status < 300 ? 'default' : 'destructive'}>
                                  {testResult.status}
                                </Badge>
                                <span className="text-sm">{testResult.statusText}</span>
                              </div>

                              {testResult.requestDetails && (
                                <div>
                                  <h4 className="font-semibold mb-2">Request Details</h4>
                                  <div className="bg-gray-50 p-3 rounded text-sm">
                                    <p><strong>Method:</strong> {testResult.requestDetails.method}</p>
                                    <p><strong>URL:</strong> {testResult.requestDetails.url}</p>
                                    <p><strong>Headers:</strong></p>
                                    <pre className="text-xs bg-white p-2 rounded mt-1 overflow-x-auto">
                                      {JSON.stringify(testResult.requestDetails.headers, null, 2)}
                                    </pre>
                                    {testResult.requestDetails.body && (
                                      <>
                                        <p className="mt-2"><strong>Body:</strong></p>
                                        <pre className="text-xs bg-white p-2 rounded mt-1 overflow-x-auto">
                                          {JSON.stringify(JSON.parse(testResult.requestDetails.body), null, 2)}
                                        </pre>
                                      </>
                                    )}
                                  </div>
                                </div>
                              )}

                              <div>
                                <h4 className="font-semibold mb-2">Response Headers</h4>
                                <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                  {JSON.stringify(testResult.headers, null, 2)}
                                </pre>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-2">Response Body</h4>
                                <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                  {JSON.stringify(testResult.data, null, 2)}
                                </pre>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No test results yet. Switch to the "Test" tab to test this endpoint.</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ApiPage
