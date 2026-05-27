'use client'

import { KanbanBoard } from '@/components/admin/KanbanBoard'
import { AdminSidebar, AdminHeader } from '@/components/admin/admin-layout'

export default function KanbanPedidosPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-auto">
      <AdminSidebar />
      <div className="lg:ml-56 min-h-screen flex flex-col">
        <AdminHeader />
        <main className="flex-1">
          <KanbanBoard />
        </main>
      </div>
    </div>
  )
}
