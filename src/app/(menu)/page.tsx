import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/protected-route"

export default function Page() {
  return (
    <ProtectedRoute>
      <DashboardLayout breadcrumb={["Dashboard"]}>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Dashboard</h1>
          </div>

          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="bg-muted/50 aspect-video rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">Domain Management</h3>
              <p className="text-sm text-muted-foreground">Manage your domains and their configurations</p>
            </div>
            <div className="bg-muted/50 aspect-video rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">User Management</h3>
              <p className="text-sm text-muted-foreground">Manage users, roles, and permissions</p>
            </div>
            <div className="bg-muted/50 aspect-video rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">API Documentation</h3>
              <p className="text-sm text-muted-foreground">Test and explore API endpoints</p>
            </div>
          </div>

          <div className="bg-muted/50 min-h-[400px] rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Welcome to Nusarithm IAM</h3>
            <p className="text-muted-foreground">
              This is your Identity and Access Management dashboard. Use the navigation menu to access different features.
            </p>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
