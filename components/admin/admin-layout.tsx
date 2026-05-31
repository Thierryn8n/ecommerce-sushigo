"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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
  IceCream,
  Columns2,
  User,
  ExternalLink,
  Volume2,
  VolumeX,
  Check,
  Monitor
} from 'lucide-react'
import { useStore } from '@/lib/store-context'
import { ThemeToggle } from '@/components/theme-toggle'
import { createClient } from '@/lib/supabase/client'
import { getNotificationSoundGenerator, type SoundType } from '@/lib/notification-sounds'
import type { RealtimeChannel } from '@supabase/supabase-js'

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/produtos', label: 'Produtos', icon: Package },
  { href: '/admin/categorias', label: 'Categorias', icon: Tag },
  { href: '/admin/condimentos', label: 'Condimentos', icon: Palette },
  { href: '/admin/coberturas', label: 'Coberturas', icon: Tag },
  { href: '/admin/tipos-sushi', label: 'Tipos de Sushi', icon: IceCream },
  { href: '/admin/banners', label: 'Banners', icon: Bell },
  { href: '/admin/pedidos', label: 'Lista de Pedidos', icon: ShoppingCart },
  { href: '/admin/pedidos/kanban', label: 'Kanban', icon: Columns2 },
  { href: '/admin/cupons', label: 'Cupons', icon: Ticket },
  { href: '/admin/entrega', label: 'Entrega', icon: ChevronDown },
  { href: '/admin/aprovar-admins', label: 'Admins', icon: Users },
  { href: '/admin/aplicativo', label: 'App Desktop', icon: Monitor },
  { href: '/admin/configuracoes', label: 'Config', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { store } = useStore()

  // Fechar sidebar ao mudar de rota em mobile
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <>
      {/* Mobile Toggle - Fixed Bottom */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-4 left-4 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isOpen ? 90 : 0 }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Bottom Sheet Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl border-t border-border max-h-[85vh] overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Logo */}
            <div className="px-5 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                {store?.logo_url ? (
                  <Image
                    src={store.logo_url}
                    alt={store.name}
                    width={44}
                    height={44}
                    className="rounded-xl object-contain"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                    {store?.name?.charAt(0) || 'A'}
                  </div>
                )}
                <div>
                  <h1 className="text-foreground font-bold">{store?.name || 'Loja'}</h1>
                  <p className="text-muted-foreground text-xs">Painel Admin</p>
                </div>
              </div>
            </div>

            {/* Navigation Grid */}
            <nav className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-3 gap-3">
                {menuItems.map((item, index) => {
                  const isActive = pathname === item.href
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <Link
                        href={item.href}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${
                          isActive 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <item.icon className="w-6 h-6" />
                        <span className="text-xs font-medium text-center leading-tight">{item.label}</span>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>

              {/* Quick Actions */}
              <div className="mt-4 pt-4 border-t border-border flex gap-3">
                <Link
                  href="/"
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm font-medium">Ver Loja</span>
                </Link>
                <button
                  onClick={() => {
                    const supabase = createClient()
                    supabase.auth.signOut()
                    window.location.href = '/login-adm'
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Sair</span>
                </button>
              </div>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed top-0 left-0 h-full w-56 bg-card border-r border-border z-40">
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <Link href="/admin" className="flex items-center gap-2">
            {store?.logo_url ? (
              <Image
                src={store.logo_url}
                alt={store.name}
                width={40}
                height={40}
                className="rounded-lg object-contain"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                {store?.name?.charAt(0) || 'A'}
              </div>
            )}
            <div>
              <h1 className="text-foreground font-bold text-sm">{store?.name || 'Loja'}</h1>
              <p className="text-muted-foreground text-[10px]">Painel Admin</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-3 overflow-y-auto h-[calc(100%-8rem)]">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
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
            <ExternalLink className="w-4 h-4" />
            <span className="font-medium">Ver Loja</span>
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
  type: 'order' | 'system' | 'alert' | 'status_update'
  order_id?: string
  read: boolean
  created_at: string
}

interface NotificationSettings {
  sound_enabled: boolean
  sound_type: SoundType
  sound_volume: number
  browser_notifications: boolean
  vibrate: boolean
}

const DEFAULT_SETTINGS: NotificationSettings = {
  sound_enabled: true,
  sound_type: 'default',
  sound_volume: 0.7,
  browser_notifications: true,
  vibrate: true,
}

export function AdminHeader() {
  const { store } = useStore()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS)
  const [hasNewNotification, setHasNewNotification] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const supabase = createClient()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const soundGenerator = typeof window !== 'undefined' ? getNotificationSoundGenerator() : null

  // Buscar configurações do usuário
  const fetchSettings = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('admin_notification_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (data) {
      setSettings({
        sound_enabled: data.sound_enabled,
        sound_type: data.sound_type,
        sound_volume: Number(data.sound_volume),
        browser_notifications: data.browser_notifications,
        vibrate: data.vibrate,
      })
    }
  }, [supabase])

  // Tocar som de notificação
  const playNotificationSound = useCallback(() => {
    if (!settings.sound_enabled || !soundGenerator) return
    soundGenerator.play(settings.sound_type, settings.sound_volume)
  }, [settings.sound_enabled, settings.sound_type, settings.sound_volume, soundGenerator])

  // Vibrar dispositivo
  const vibrateDevice = useCallback(() => {
    if (!settings.vibrate || typeof navigator === 'undefined' || !navigator.vibrate) return
    navigator.vibrate([200, 100, 200])
  }, [settings.vibrate])

  // Mostrar notificação do navegador
  const showBrowserNotification = useCallback((notification: Notification) => {
    if (!settings.browser_notifications || typeof window === 'undefined') return

    if ('Notification' in window && Notification.permission === 'granted') {
      new window.Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.type === 'order',
      })
    }
  }, [settings.browser_notifications])

  // Handler para nova notificação
  const handleNewNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 19)])
    setUnreadCount(prev => prev + 1)
    setHasNewNotification(true)
    setIsAnimating(true)
    
    playNotificationSound()
    vibrateDevice()
    showBrowserNotification(notification)

    // Reset animação após 3 segundos
    setTimeout(() => {
      setHasNewNotification(false)
      setIsAnimating(false)
    }, 3000)
  }, [playNotificationSound, vibrateDevice, showBrowserNotification])

  useEffect(() => {
    fetchSettings()
    fetchNotifications()

    // Solicitar permissão para notificações do navegador
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    // Configurar Realtime
    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const newNotification = payload.new as Notification
          // Admins recebem notificações sem user_id (são para toda a loja)
          if (!newNotification.user_id) {
            handleNewNotification(newNotification)
          }
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [supabase, fetchSettings, handleNewNotification])

  async function fetchNotifications() {
    const { data: notifs } = await supabase
      .from('notifications')
      .select('*')
      .is('user_id', null) // Notificações de admin não têm user_id
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (notifs) {
      setNotifications(notifs.map(n => ({ ...n, read: n.is_read })))
      setUnreadCount(notifs.filter(n => !n.is_read).length)
    }
  }

  async function markAsRead(id: string) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  async function markAllAsRead() {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
    if (unreadIds.length === 0) return

    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
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
    <header className="h-14 sm:h-16 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 lg:pl-[14.5rem] relative">
      <div className="flex items-center gap-2 sm:gap-4">
        <h2 className="text-foreground font-semibold text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">
          {store?.name || 'Admin'}
        </h2>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        <ThemeToggle />
        
        {/* Notifications Button */}
        <div className="relative">
          <motion.button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="notifications-btn relative w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            animate={isAnimating ? {
              scale: [1, 1.2, 1, 1.1, 1],
              rotate: [0, -10, 10, -10, 0],
            } : {}}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <motion.div
              animate={isAnimating ? {
                y: [0, -3, 0, -2, 0],
              } : {}}
              transition={{ duration: 0.3, repeat: isAnimating ? 2 : 0 }}
            >
              <Bell className="w-5 h-5" />
            </motion.div>
            
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white rounded-full ${
                    hasNewNotification ? 'bg-red-500' : 'bg-primary'
                  }`}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </AnimatePresence>

            {/* Pulse animation for new notifications */}
            <AnimatePresence>
              {hasNewNotification && (
                <motion.span
                  initial={{ scale: 1, opacity: 0.8 }}
                  animate={{ scale: 2, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, repeat: 2 }}
                  className="absolute inset-0 rounded-lg bg-primary"
                />
              )}
            </AnimatePresence>
          </motion.button>
          
          {/* Notifications Dropdown */}
          <AnimatePresence>
          {showNotifications && (
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="notifications-dropdown fixed sm:absolute right-2 sm:right-0 top-14 sm:top-full sm:mt-2 w-[calc(100vw-1rem)] sm:w-80 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Notificacoes</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                      </span>
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        Ler todas
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">Nenhuma notificacao</p>
                  </div>
                ) : (
                  notifications.map((notif, index) => (
                    <motion.div 
                      key={notif.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => markAsRead(notif.id)}
                      className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${!notif.read ? 'bg-primary/5' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          notif.type === 'order' ? 'bg-blue-500' : 
                          notif.type === 'alert' ? 'bg-red-500' : 
                          notif.type === 'status_update' ? 'bg-purple-500' : 'bg-green-500'
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
                    </motion.div>
                  ))
                )}
              </div>
              <div className="p-3 border-t border-border flex items-center justify-between">
                <Link href="/admin/notificacoes" className="text-sm text-primary hover:underline">
                  Ver todas
                </Link>
                <Link href="/admin/configuracoes/notificacoes" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <Settings className="w-3 h-3" />
                  Configurar
                </Link>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>

        {/* Profile Button */}
        <div className="relative">
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="profile-btn flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm sm:text-base">
              {store?.name?.charAt(0) || 'A'}
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showProfile ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Profile Dropdown */}
          <AnimatePresence>
          {showProfile && (
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="profile-dropdown fixed sm:absolute right-2 sm:right-0 top-14 sm:top-full sm:mt-2 w-56 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-border">
                <p className="font-semibold text-foreground">{store?.name || 'Admin'}</p>
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
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
