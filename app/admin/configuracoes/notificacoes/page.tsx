'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Save, 
  Loader2,
  Play,
  Cat,
  BellRing,
  Music,
  Sparkles,
  Circle
} from 'lucide-react'
import { AdminSidebar, AdminHeader } from '@/components/admin/admin-layout'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { getNotificationSoundGenerator, SOUND_OPTIONS, type SoundType } from '@/lib/notification-sounds'

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

const SOUND_ICONS: Record<SoundType, typeof Bell> = {
  default: BellRing,
  cat: Cat,
  bell: Bell,
  chime: Music,
  ding: Sparkles,
  pop: Circle,
}

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default')
  const supabase = createClient()
  const soundGenerator = typeof window !== 'undefined' ? getNotificationSoundGenerator() : null

  useEffect(() => {
    fetchSettings()
    
    // Verificar permissão de notificações do navegador
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission)
    }
  }, [])

  async function fetchSettings() {
    try {
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
    } catch (error) {
      console.error('Erro ao buscar configuracoes:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('admin_notification_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error
      alert('Configuracoes salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar configuracoes')
    } finally {
      setSaving(false)
    }
  }

  function testSound(type: SoundType) {
    if (soundGenerator) {
      soundGenerator.play(type, settings.sound_volume)
    }
  }

  async function requestBrowserPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    
    const permission = await Notification.requestPermission()
    setBrowserPermission(permission)
    
    if (permission === 'granted') {
      new window.Notification('Notificacoes Ativadas!', {
        body: 'Voce recebera notificacoes de novos pedidos.',
        icon: '/favicon.ico',
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="lg:ml-56">
        <AdminHeader />
        
        <main className="p-3 sm:p-6 pb-20 lg:pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">Notificacoes</h1>
                <p className="text-muted-foreground text-xs sm:text-sm">Alertas de novos pedidos</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Som de Notificação */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-primary" />
                    Som de Notificacao
                  </h2>
                  <button
                    onClick={() => setSettings({ ...settings, sound_enabled: !settings.sound_enabled })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.sound_enabled ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <motion.div
                      className="w-5 h-5 bg-white rounded-full shadow"
                      animate={{ x: settings.sound_enabled ? 26 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>

                {settings.sound_enabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4"
                  >
                    {/* Seletor de Som */}
                    <div>
                      <label className="text-muted-foreground text-sm mb-3 block">Escolha o som</label>
                      <div className="grid grid-cols-2 gap-2">
                        {SOUND_OPTIONS.map((option) => {
                          const Icon = SOUND_ICONS[option.value]
                          return (
                            <button
                              key={option.value}
                              onClick={() => {
                                setSettings({ ...settings, sound_type: option.value })
                                testSound(option.value)
                              }}
                              className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${
                                settings.sound_type === option.value
                                  ? 'border-primary bg-primary/10 text-foreground'
                                  : 'border-border text-muted-foreground hover:border-primary/50 hover:bg-muted'
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                              <div className="text-left flex-1">
                                <p className="text-sm font-medium">{option.label}</p>
                                <p className="text-xs opacity-70">{option.description}</p>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Volume */}
                    <div>
                      <label className="text-muted-foreground text-sm mb-3 block flex items-center justify-between">
                        <span>Volume</span>
                        <span className="text-foreground font-medium">{Math.round(settings.sound_volume * 100)}%</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={settings.sound_volume}
                        onChange={(e) => setSettings({ ...settings, sound_volume: Number(e.target.value) })}
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <VolumeX className="w-4 h-4" />
                        <Volume2 className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Testar Som */}
                    <Button
                      variant="outline"
                      onClick={() => testSound(settings.sound_type)}
                      className="w-full border-border text-foreground"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Testar Som
                    </Button>
                  </motion.div>
                )}

                {!settings.sound_enabled && (
                  <div className="text-center py-8 text-muted-foreground">
                    <VolumeX className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Som desativado</p>
                  </div>
                )}
              </div>

              {/* Outras Configurações */}
              <div className="space-y-6">
                {/* Notificações do Navegador */}
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-primary" />
                      <div>
                        <h3 className="font-semibold text-foreground">Notificacoes do Navegador</h3>
                        <p className="text-xs text-muted-foreground">Receba alertas mesmo com a aba minimizada</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, browser_notifications: !settings.browser_notifications })}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings.browser_notifications ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <motion.div
                        className="w-5 h-5 bg-white rounded-full shadow"
                        animate={{ x: settings.browser_notifications ? 26 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>

                  {settings.browser_notifications && browserPermission !== 'granted' && (
                    <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <p className="text-yellow-500 text-sm mb-2">
                        Permissao necessaria para receber notificacoes
                      </p>
                      <Button
                        size="sm"
                        onClick={requestBrowserPermission}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black"
                      >
                        Permitir Notificacoes
                      </Button>
                    </div>
                  )}

                  {browserPermission === 'granted' && (
                    <div className="mt-2 flex items-center gap-2 text-green-500 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      Notificacoes permitidas
                    </div>
                  )}
                </div>

                {/* Vibração */}
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-primary" />
                      <div>
                        <h3 className="font-semibold text-foreground">Vibracao</h3>
                        <p className="text-xs text-muted-foreground">Vibrar dispositivo ao receber notificacao</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const newVibrate = !settings.vibrate
                        setSettings({ ...settings, vibrate: newVibrate })
                        if (newVibrate && navigator.vibrate) {
                          navigator.vibrate([100, 50, 100])
                        }
                      }}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings.vibrate ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <motion.div
                        className="w-5 h-5 bg-white rounded-full shadow"
                        animate={{ x: settings.vibrate ? 26 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>
                </div>

                {/* Informação */}
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
                  <p className="text-sm text-foreground/80">
                    <strong>Dica:</strong> Para nao perder nenhum pedido, mantenha o som e as notificacoes do navegador ativados. O sistema ira alertar voce em tempo real quando um novo pedido chegar.
                  </p>
                </div>
              </div>
            </div>

            {/* Botão Salvar */}
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Salvar Configuracoes
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
