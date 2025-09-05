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
import { useUsers } from '@/hooks/use-users'
import { ProtectedRoute } from '@/components/protected-route'

const UserPage = () => {
    const [selectedDomain, setSelectedDomain] = useState<string>("")
    const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
    const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false)
    const [selectedUserForReset, setSelectedUserForReset] = useState<string | null>(null)
    const [newPassword, setNewPassword] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [userForm, setUserForm] = useState({
        email: "",
        first_name: "",
        last_name: "",
        password: "",
        username: "",
        role_id: ""
    })
    const { domains, loading: domainsLoading, error: domainsError } = useDomainsList()
    const { data: rolesData, loading: rolesLoading } = useRoles(selectedDomain)
    const { data: usersData, loading: usersLoading, error: usersError, search, setSearch, page, setPage, refetch: refetchUsers } = useUsers(selectedDomain, searchTerm)

    const handleSearch = (value: string) => {
        setSearchTerm(value)
        setSearch(value)
        setPage(1) // Reset to first page when searching
    }

    const handleCreateUser = async () => {
        if (!selectedDomain || !userForm.email.trim() || !userForm.username.trim() || !userForm.password.trim()) {
            alert("Please fill in all required fields")
            return
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/users`, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    domain_id: selectedDomain,
                    email: userForm.email.trim(),
                    first_name: userForm.first_name.trim(),
                    last_name: userForm.last_name.trim(),
                    password: userForm.password.trim(),
                    role_id: userForm.role_id,
                    username: userForm.username.trim()
                }),
            })

            if (!response.ok) {
                throw new Error(`Failed to create user: ${response.statusText}`)
            }

            // Reset form
            setUserForm({
                email: "",
                first_name: "",
                last_name: "",
                password: "",
                username: "",
                role_id: ""
            })
            setIsCreateUserOpen(false)
            alert("User created successfully!")
            refetchUsers() // Refresh the users list
        } catch (error) {
            console.error("Failed to create user:", error)
            alert("Failed to create user. Please try again.")
        }
    }

    const updateUserForm = (field: string, value: string) => {
        setUserForm(prev => ({ ...prev, [field]: value }))
    }

    const handleResetPassword = async () => {
        if (!selectedUserForReset || !newPassword.trim()) {
            alert("Please enter a new password")
            return
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/users/${selectedUserForReset}/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    new_password: newPassword.trim()
                }),
            })

            if (!response.ok) {
                throw new Error(`Failed to reset password: ${response.statusText}`)
            }

            // Reset form
            setNewPassword("")
            setSelectedUserForReset(null)
            setIsResetPasswordOpen(false)
            alert("Password reset successfully!")
        } catch (error) {
            console.error("Failed to reset password:", error)
            alert("Failed to reset password. Please try again.")
        }
    }

    const openResetPasswordModal = (userId: string) => {
        setSelectedUserForReset(userId)
        setIsResetPasswordOpen(true)
    }

    return (
        <ProtectedRoute>
            <DashboardLayout breadcrumb={["Domain", "User Management"]}>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">User Management</h1>
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

                {/* User Management Content */}
                <div className="space-y-4">
                    <div className="border rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Users</h2>
                            {selectedDomain && (
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Search users..."
                                        value={searchTerm}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="w-64"
                                    />
                                </div>
                            )}
                        </div>

                        {selectedDomain ? (
                            <>
                                {usersLoading ? (
                                    <div className="text-center py-4">
                                        <p className="text-muted-foreground">Loading users...</p>
                                    </div>
                                ) : usersError ? (
                                    <div className="text-center py-4">
                                        <p className="text-red-500">Error: {usersError}</p>
                                    </div>
                                ) : usersData && usersData.users.length > 0 ? (
                                    <>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Username</TableHead>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead>Full Name</TableHead>
                                                    <TableHead>Role</TableHead>
                                                    <TableHead>Created At</TableHead>
                                                    <TableHead>Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {usersData.users.map((user) => (
                                                    <TableRow key={user.id}>
                                                        <TableCell className="font-medium">{user.username}</TableCell>
                                                        <TableCell>{user.email}</TableCell>
                                                        <TableCell>{`${user.first_name} ${user.last_name}`}</TableCell>
                                                        <TableCell>
                                                            {rolesData?.roles.find(role => role.id === user.role_id)?.role_name || 'Unknown'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(user.created_at).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex gap-2">
                                                                <Button variant="outline" size="sm">
                                                                    Edit
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => openResetPasswordModal(user.id)}
                                                                >
                                                                    Reset Password
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>

                                        {/* Pagination */}
                                        {usersData.total_pages > 1 && (
                                            <div className="flex justify-between items-center mt-4">
                                                <div className="text-sm text-muted-foreground">
                                                    Showing {((page - 1) * usersData.limit) + 1} to {Math.min(page * usersData.limit, usersData.total)} of {usersData.total} users
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setPage(page - 1)}
                                                        disabled={page <= 1}
                                                    >
                                                        Previous
                                                    </Button>
                                                    <span className="text-sm self-center">
                                                        Page {page} of {usersData.total_pages}
                                                    </span>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setPage(page + 1)}
                                                        disabled={page >= usersData.total_pages}
                                                    >
                                                        Next
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-muted-foreground">No users found for this domain.</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-muted-foreground">
                                <p>Please select a domain to view and manage users.</p>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    {selectedDomain && (
                        <div className="flex gap-2">
                            <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        Add User
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px]">
                                    <DialogHeader>
                                        <DialogTitle>Add New User</DialogTitle>
                                        <DialogDescription>
                                            Create a new user for the selected domain.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="username" className="text-right">
                                                Username *
                                            </Label>
                                            <Input
                                                id="username"
                                                value={userForm.username}
                                                onChange={(e) => updateUserForm('username', e.target.value)}
                                                className="col-span-3"
                                                placeholder="Enter username"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="email" className="text-right">
                                                Email *
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={userForm.email}
                                                onChange={(e) => updateUserForm('email', e.target.value)}
                                                className="col-span-3"
                                                placeholder="Enter email address"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="first_name" className="text-right">
                                                First Name
                                            </Label>
                                            <Input
                                                id="first_name"
                                                value={userForm.first_name}
                                                onChange={(e) => updateUserForm('first_name', e.target.value)}
                                                className="col-span-3"
                                                placeholder="Enter first name"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="last_name" className="text-right">
                                                Last Name
                                            </Label>
                                            <Input
                                                id="last_name"
                                                value={userForm.last_name}
                                                onChange={(e) => updateUserForm('last_name', e.target.value)}
                                                className="col-span-3"
                                                placeholder="Enter last name"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="password" className="text-right">
                                                Password *
                                            </Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={userForm.password}
                                                onChange={(e) => updateUserForm('password', e.target.value)}
                                                className="col-span-3"
                                                placeholder="Enter password"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="role" className="text-right">
                                                Role
                                            </Label>
                                            <Select value={userForm.role_id} onValueChange={(value) => updateUserForm('role_id', value)}>
                                                <SelectTrigger className="col-span-3">
                                                    <SelectValue placeholder={
                                                        rolesLoading
                                                            ? "Loading roles..."
                                                            : "Select a role"
                                                    } />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {rolesData && rolesData.roles.length > 0 ? (
                                                        rolesData.roles.map((role) => (
                                                            <SelectItem key={role.id} value={role.id}>
                                                                {role.role_name}
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <SelectItem value="no-roles" disabled>
                                                            No roles available
                                                        </SelectItem>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" onClick={handleCreateUser}>
                                            Create User
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            {/* Reset Password Modal */}
                            <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Reset Password</DialogTitle>
                                        <DialogDescription>
                                            Enter a new password for the user.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="new-password" className="text-left">
                                                New Password *
                                            </Label>
                                            <Input
                                                id="new-password"
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="col-span-3"
                                                placeholder="Enter new password"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" onClick={handleResetPassword}>
                                            Reset Password
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <Button variant="outline">
                                Import Users
                            </Button>
                            <Button variant="outline">
                                Export Users
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
        </ProtectedRoute>
    )
}

export default UserPage