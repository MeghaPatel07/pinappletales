import type { ReactNode } from 'react'
import { RequireAuth } from '@/admin/auth/RequireAuth'
import { AdminLayout } from '@/admin/components/AdminLayout'

export default function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <AdminLayout>{children}</AdminLayout>
    </RequireAuth>
  )
}
