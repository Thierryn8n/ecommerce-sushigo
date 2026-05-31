"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  Utensils,
  Palette,
  Tag,
  Ticket,
  Columns2,
  User,
  ExternalLink
} from 'lucide-react'
import { useStore } from '@/lib/store-context'
import { ThemeToggle } from '@/components/theme-toggle'
import { createClient } from '@/lib/supabase/client'

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/produtos', label: 'Produtos', icon: Package },
  { href: '/admin/condimentos', label: 'Condimentos', icon: Palette },
  { href: '/admin/molhos', label: 'Molhos', icon: Tag },
  { href: '/admin/banners', label: 'Banners', icon: Bell },
  { href: '/admin/pedidos', label: 'Lista de Pedidos', icon: ShoppingCart },
  { href: '/admin/pedidos/kanban', label: 'Kanban de Pedidos', icon: Columns2 },
  { href: '/admin/cupons', label: 'Cupons', icon: Ticket },
  { href: '/admin/entrega', label: 'Entrega', icon: ChevronDown },
  { href: '/admin/aprovar-admins', label: 'Admins', icon: Users },
  { href: '/admin/configuracoes', label: 'Configuracoes', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { store } = useStore()

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-foreground"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-56 bg-card border-r border-border z-40 transform transition-transform lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <Link href="/admin" className="flex items-center gap-2">
            <Image
              src="/images/logo-sushigo.png"
              alt="SushiGo Delivery"
              width={120}
              height={40}
              className="object-contain"
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-3">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium">Sair</span>
          </Link>
        </div>
      </aside>
    </>
  )
}

interface Notification {
  id: string
  title: string
  message: string
  type: 'order' | 'system' | 'alert'
  read: boolean
  created_at: string
}

export function AdminHeader() {
  const { store } = useStore()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    fetchNotifications()
    // Atualiza a cada 30 segundos
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  async function fetchNotifications() {
    const { data: notifs } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (notifs) {
      setNotifications(notifs)
      setUnreadCount(notifs.filter(n => !n.read).length)
    }
  }

  async function markAsRead(id: string) {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    fetchNotifications()
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login-adm'
  }

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (!target.closest('.notifications-dropdown') && !target.closest('.notifications-btn')) {
        setShowNotifications(false)
      }
      if (!target.closest('.profile-dropdown') && !target.closest('.profile-btn')) {
        setShowProfile(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 lg:pl-[14rem] relative">
      <div className="flex items-center gap-4">
        <h2 className="text-foreground font-semibold hidden sm:block">Painel Admin - SushiGo</h2>
      </div>
      
      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        {/* Notifications Button */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="notifications-btn relative w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
            )}
          </button>
          
          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="notifications-dropdown absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Notificações</h3>
                {unreadCount > 0 && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">Nenhuma notificação</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${!notif.read ? 'bg-primary/5' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          notif.type === 'order' ? 'bg-blue-500' : 
                          notif.type === 'alert' ? 'bg-red-500' : 'bg-green-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{notif.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                          <p className="text-xs text-muted-foreground/60 mt-2">
                            {new Date(notif.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {!notif.read && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Link href="/admin/notificacoes" className="block p-3 text-center text-sm text-primary hover:bg-muted/50 border-t border-border">
                Ver todas
              </Link>
            </div>
          )}
        </div>

        {/* Profile Button */}
        <div className="relative">
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="profile-btn flex items-center gap-3 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              S
            </div>
            <span className="text-foreground font-medium hidden sm:block">SushiGo</span>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showProfile ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Profile Dropdown */}
          {showProfile && (
            <div className="profile-dropdown absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="p-4 border-b border-border">
                <p className="font-semibold text-foreground">SushiGo Delivery</p>
                <p className="text-xs text-muted-foreground">Administrador</p>
              </div>
              <div className="p-2">
                <Link href="/admin/perfil" className="flex items-center gap-3 px-3 py-2 rounded-lg text-foreground hover:bg-muted transition-colors">
                  <User className="w-4 h-4" />
                  <span className="text-sm">Meu Perfil</span>
                </Link>
                <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-foreground hover:bg-muted transition-colors">
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm">Ver Loja</span>
                </Link>
                <Link href="/admin/configuracoes" className="flex items-center gap-3 px-3 py-2 rounded-lg text-foreground hover:bg-muted transition-colors">
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Configurações</span>
                </Link>
              </div>
              <div className="p-2 border-t border-border">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Sair</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
