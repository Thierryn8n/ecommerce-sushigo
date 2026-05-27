'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface Notification {
  id: string
  user_id?: string
  store_id?: string
  title: string
  message: string
  type: 'order' | 'system' | 'alert' | 'status_update'
  order_id?: string
  read: boolean
  created_at: string
}

export interface NotificationSettings {
  sound_enabled: boolean
  sound_type: 'default' | 'cat' | 'bell' | 'chime' | 'ding' | 'pop'
  sound_volume: number
  browser_notifications: boolean
  vibrate: boolean
}

// Sons de notificação em base64 (curtos para não pesar)
const NOTIFICATION_SOUNDS: Record<string, string> = {
  default: '/sounds/notification-default.mp3',
  cat: '/sounds/notification-cat.mp3',
  bell: '/sounds/notification-bell.mp3',
  chime: '/sounds/notification-chime.mp3',
  ding: '/sounds/notification-ding.mp3',
  pop: '/sounds/notification-pop.mp3',
}

const DEFAULT_SETTINGS: NotificationSettings = {
  sound_enabled: true,
  sound_type: 'default',
  sound_volume: 0.7,
  browser_notifications: true,
  vibrate: true,
}

export function useNotifications(isAdmin = false) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [hasNewNotification, setHasNewNotification] = useState(false)
  
  const supabase = createClient()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Inicializar áudio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio()
    }
  }, [])

  // Tocar som de notificação
  const playNotificationSound = useCallback(() => {
    if (!settings.sound_enabled || !audioRef.current) return

    try {
      audioRef.current.src = NOTIFICATION_SOUNDS[settings.sound_type] || NOTIFICATION_SOUNDS.default
      audioRef.current.volume = settings.sound_volume
      audioRef.current.play().catch(console.error)
    } catch (error) {
      console.error('Erro ao tocar som:', error)
    }
  }, [settings.sound_enabled, settings.sound_type, settings.sound_volume])

  // Vibrar dispositivo
  const vibrateDevice = useCallback(() => {
    if (!settings.vibrate || typeof navigator === 'undefined' || !navigator.vibrate) return
    navigator.vibrate([200, 100, 200])
  }, [settings.vibrate])

  // Mostrar notificação do navegador
  const showBrowserNotification = useCallback((notification: Notification) => {
    if (!settings.browser_notifications || typeof window === 'undefined') return

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.type === 'order',
      })
    }
  }, [settings.browser_notifications])

  // Solicitar permissão para notificações do navegador
  const requestBrowserPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return false
    
    if (Notification.permission === 'granted') return true
    if (Notification.permission === 'denied') return false
    
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }, [])

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

  // Salvar configurações
  const saveSettings = useCallback(async (newSettings: NotificationSettings) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('admin_notification_settings')
      .upsert({
        user_id: user.id,
        ...newSettings,
        updated_at: new Date().toISOString(),
      })

    if (!error) {
      setSettings(newSettings)
    }

    return !error
  }, [supabase])

  // Buscar notificações
  const fetchNotifications = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    if (isAdmin) {
      // Admins veem todas as notificações da loja
      query = query.is('user_id', null)
    } else if (user) {
      // Clientes veem apenas suas notificações
      query = query.eq('user_id', user.id)
    }

    const { data } = await query

    if (data) {
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.read).length)
    }
    setLoading(false)
  }, [supabase, isAdmin])

  // Marcar como lida
  const markAsRead = useCallback(async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)

    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [supabase])

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
    
    if (unreadIds.length === 0) return

    await supabase
      .from('notifications')
      .update({ read: true })
      .in('id', unreadIds)

    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }, [supabase, notifications])

  // Handler para nova notificação
  const handleNewNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev])
    setUnreadCount(prev => prev + 1)
    setHasNewNotification(true)
    
    // Tocar som, vibrar e mostrar notificação do navegador
    playNotificationSound()
    vibrateDevice()
    showBrowserNotification(notification)

    // Reset animação após 3 segundos
    setTimeout(() => setHasNewNotification(false), 3000)
  }, [playNotificationSound, vibrateDevice, showBrowserNotification])

  // Configurar Realtime
  useEffect(() => {
    fetchSettings()
    fetchNotifications()

    // Configurar canal Realtime
    const channel = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const newNotification = payload.new as Notification
          
          // Verificar se é relevante para este usuário/admin
          if (isAdmin && !newNotification.user_id) {
            handleNewNotification(newNotification)
          } else if (!isAdmin && newNotification.user_id) {
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
  }, [supabase, isAdmin, fetchSettings, fetchNotifications, handleNewNotification])

  // Testar som
  const testSound = useCallback((soundType?: string) => {
    if (!audioRef.current) return
    
    const type = soundType || settings.sound_type
    audioRef.current.src = NOTIFICATION_SOUNDS[type] || NOTIFICATION_SOUNDS.default
    audioRef.current.volume = settings.sound_volume
    audioRef.current.play().catch(console.error)
  }, [settings.sound_type, settings.sound_volume])

  return {
    notifications,
    unreadCount,
    settings,
    loading,
    hasNewNotification,
    markAsRead,
    markAllAsRead,
    saveSettings,
    fetchNotifications,
    requestBrowserPermission,
    testSound,
  }
}

// Hook simplificado para cliente (rastrear pedido em tempo real)
export function useOrderTracking(orderId: string) {
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!orderId) return

    // Buscar pedido inicial
    async function fetchOrder() {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (data) {
        setOrder(data)
      }
      setLoading(false)
    }

    fetchOrder()

    // Configurar Realtime para atualizações do pedido
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          setOrder(payload.new)
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [orderId, supabase])

  return { order, loading }
}
