'use client'

import { KanbanBoard } from '@/components/admin/KanbanBoard'
import { AdminSidebar, AdminHeader } from '@/components/admin/admin-layout'

export default function KanbanPedidosPage() {
  return (
    <div className="h-screen bg-background overflow-hidden">
      <AdminSidebar />
      <div className="lg:ml-56 h-full flex flex-col">
        <AdminHeader />
        <main className="flex-1 overflow-hidden">
          <KanbanBoard />
        </main>
      </div>
    </div>
  )
}
