"use client"
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState } from 'react'
import { useDomainsList } from '@/hooks/use-domains-list'
import { useRoles } from '@/hooks/use-roles'
import { ProtectedRoute } from '@/components/protected-route'

const RolePage = () => {
    const [selectedDomain, setSelectedDomain] = useState<string>("")
    const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false)
    const [roleName, setRoleName] = useState("")
    const [roleClaims, setRoleClaims] = useState("")
    const { domains, loading: domainsLoading, error: domainsError } = useDomainsList()
    const { data: rolesData, loading: rolesLoading, error: rolesError, createRole } = useRoles(selectedDomain)

    const handleCreateRole = async () => {
        if (!selectedDomain || !roleName.trim()) return

        try {
            let claimsObj = {}
            if (roleClaims.trim()) {
                try {
                    claimsObj = JSON.parse(roleClaims)
                } catch (e) {
                    alert("Invalid JSON format for role claims")
                    return
                }
            }

            await createRole(selectedDomain, {
                role_name: roleName.trim(),
                role_claims: claimsObj
            })

            // Reset form
            setRoleName("")
            setRoleClaims("")
            setIsCreateRoleOpen(false)
        } catch (error) {
            console.error("Failed to create role:", error)
            alert("Failed to create role. Please try again.")
        }
    }

    return (
        <ProtectedRoute>
            <DashboardLayout breadcrumb={["Domain", "Role Management"]}>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Role Management</h1>
                </div>

                {/* Domain Selection */}
                <div className="space-y-2">
                    <Label htmlFor="domain-select" className="text-sm font-medium">
                        Select Domain
                    </Label>
                    <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                        <SelectTrigger className="w-full max-w-sm">
                            <SelectValue placeholder={
                                domainsLoading
                                    ? "Loading domains..."
                                    : domainsError
                                        ? "Error loading domains"
                                        : "Choose a domain..."
                            } />
                        </SelectTrigger>
                        <SelectContent>
                            {!domainsLoading && !domainsError && domains.length === 0 ? (
                                <SelectItem value="no-domains" disabled>
                                    No domains available
                                </SelectItem>
                            ) : (
                                domains.map((domain) => (
                                    <SelectItem key={domain.domain_id} value={domain.domain_id}>
                                        {domain.name} ({domain.domain})
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                    {selectedDomain && (
                        <p className="text-sm text-muted-foreground">
                            Selected: {domains.find(d => d.domain_id === selectedDomain)?.name}
                        </p>
                    )}
                </div>

                {/* Role Management */}
                <div className="border rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Roles</h2>
                        {selectedDomain && (
                            <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        Create Role
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Create New Role</DialogTitle>
                                        <DialogDescription>
                                            Create a new role for the selected domain.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="role-name" className="text-right">
                                                Role Name
                                            </Label>
                                            <Input
                                                id="role-name"
                                                value={roleName}
                                                onChange={(e) => setRoleName(e.target.value)}
                                                className="col-span-3"
                                                placeholder="e.g., admin, editor, viewer"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="role-claims" className="text-right">
                                                Role Claims
                                            </Label>
                                            <Textarea
                                                id="role-claims"
                                                value={roleClaims}
                                                onChange={(e) => setRoleClaims(e.target.value)}
                                                className="col-span-3"
                                                placeholder='{"access": "*", "read": true, "write": false}'
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" onClick={handleCreateRole}>
                                            Create Role
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>

                    {selectedDomain ? (
                        <>
                            {rolesLoading ? (
                                <div className="text-center py-4">
                                    <p className="text-muted-foreground">Loading roles...</p>
                                </div>
                            ) : rolesError ? (
                                <div className="text-center py-4">
                                    <p className="text-red-500">Error: {rolesError}</p>
                                </div>
                            ) : rolesData && rolesData.roles.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Role Name</TableHead>
                                            <TableHead>Role Claims</TableHead>
                                            <TableHead>Created At</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {rolesData.roles.map((role) => (
                                            <TableRow key={role.id}>
                                                <TableCell className="font-medium">{role.role_name}</TableCell>
                                                <TableCell>
                                                    <code className="text-sm bg-muted px-2 py-1 rounded">
                                                        {JSON.stringify(role.role_claims)}
                                                    </code>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(role.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="outline" size="sm">
                                                        Edit
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-muted-foreground">No roles found for this domain.</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-muted-foreground">
                            <p>Please select a domain to view and manage roles.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
        </ProtectedRoute>
    )
}

export default RolePage
