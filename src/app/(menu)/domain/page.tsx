"use client"
import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useDomains } from "@/hooks/use-domain"
import { ChevronLeft, ChevronRight, Search, Eye, Edit } from "lucide-react"

interface Domain {
  domain_id: string
  name: string
  domain: string
}

export default function Page() {
  const [name, setName] = useState("")
  const [domain, setDomain] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null)
  const [editName, setEditName] = useState("")
  const [editDomainValue, setEditDomainValue] = useState("")

  const { data, loading, error, refetch, addDomain, updateDomain } = useDomains(search, currentPage, pageSize)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await addDomain({
        name: name,
        domain: domain,
      })

      // Success - close modal and reset form
      setName("")
      setDomain("")
      setIsOpen(false)
    } catch (error) {
      console.error('Error adding domain:', error)
      alert('Failed to add domain. Please try again.')
    }
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleView = (domainData: Domain) => {
    setSelectedDomain(domainData)
    setViewModalOpen(true)
  }

  const handleEdit = (domainData: Domain) => {
    setSelectedDomain(domainData)
    setEditName(domainData.name)
    setEditDomainValue(domainData.domain)
    setEditModalOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDomain) return

    try {
      await updateDomain(selectedDomain.domain_id, {
        name: editName,
        domain: editDomainValue,
      })

      // Success - close modal and reset
      setEditModalOpen(false)
      setSelectedDomain(null)
    } catch (error) {
      console.error('Error updating domain:', error)
      alert('Failed to update domain. Please try again.')
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout breadcrumb={["Domain"]}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Domain Management</h1>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button>Add Domain</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Add New Domain</SheetTitle>
                <SheetDescription>
                  Enter the details for the new domain.
                </SheetDescription>
              </SheetHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4 mx-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter domain name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain">Domain</Label>
                  <Input
                    id="domain"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="Enter domain URL"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Domain</Button>
                </div>
              </form>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search domains..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-red-500">
                    Error: {error}
                  </TableCell>
                </TableRow>
              ) : data?.domains?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    No domains found
                  </TableCell>
                </TableRow>
              ) : (
                data?.domains?.map((domain) => (
                  <TableRow key={domain.domain_id}>
                    <TableCell className="font-medium">{domain.name}</TableCell>
                    <TableCell>{domain.domain}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(domain)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(domain)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {data && data.total_pages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, data.total)} of {data.total} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, data.total_pages) }, (_, i) => {
                  const pageNumber = Math.max(1, Math.min(data.total_pages - 4, currentPage - 2)) + i
                  if (pageNumber > data.total_pages) return null
                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  )
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === data.total_pages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Domain Details</DialogTitle>
              <DialogDescription>
                View domain information
              </DialogDescription>
            </DialogHeader>
            {selectedDomain && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Domain ID</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedDomain.domain_id}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Name</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedDomain.name}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Domain</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedDomain.domain}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Domain</DialogTitle>
              <DialogDescription>
                Update domain information
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter domain name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-domain">Domain</Label>
                <Input
                  id="edit-domain"
                  value={editDomainValue}
                  onChange={(e) => setEditDomainValue(e.target.value)}
                  placeholder="Enter domain URL"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Domain</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
    </ProtectedRoute>
  )
}
