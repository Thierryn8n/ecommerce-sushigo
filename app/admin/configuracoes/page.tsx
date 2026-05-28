"use client"

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Save, Upload, Loader2, X, Check, AlertCircle, ImageIcon } from 'lucide-react'
import { AdminSidebar, AdminHeader } from '@/components/admin/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/lib/store-context'

interface StoreSetting {
  id: string
  key: string
  value: string | null
  description: string | null
  updated_at: string
}

export default function AdminConfiguracoes() {
  const { store } = useStore()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingHero, setUploadingHero] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [heroUploadError, setHeroUploadError] = useState<string | null>(null)
  const [heroUploadSuccess, setHeroUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const heroFileInputRef = useRef<HTMLInputElement>(null)
  const heroLogoFileInputRef = useRef<HTMLInputElement>(null)
  const [settings, setSettings] = useState({
    storeName: '',
    whatsapp: '',
    email: '',
    address: '',
    deliveryFee: '',
    minOrder: '',
    openTime: '',
    closeTime: '',
    instagram: '',
    facebook: '',
    logoUrl: '',
    description: '',
    heroBgUrl: '',
    heroLogoUrl: '',
    heroTitleLine1: '',
    heroTitleLine2: '',
    heroSubtitle: '',
    heroHighlight: '',
    heroDescription: '',
    heroCtaPrimary: '',
    heroCtaSecondary: '',
    heroCtaPrimaryLink: '',
    heroCtaSecondaryLink: '',
  })

  useEffect(() => {
    async function fetchSettings() {
      if (!store?.id) return

      try {
        setLoading(true)
        const { data: settingsData, error } = await supabase
          .from('store_settings')
          .select('*')
          .eq('store_id', store.id)

        if (error) throw error

        // Converter array para objeto
        const settingsObj: Record<string, string> = {}
        settingsData?.forEach((item: StoreSetting) => {
          settingsObj[item.key] = item.value || ''
        })

        // Buscar todos os campos hero de app_settings
        const { data: heroAllData } = await supabase
          .from('app_settings')
          .select('key, value')
          .eq('store_id', store.id)
          .eq('section', 'hero')

        const heroObj: Record<string, string> = {}
        heroAllData?.forEach((item: { key: string; value: string }) => {
          if (item.value) heroObj[item.key] = item.value
        })

        setSettings({
          storeName: settingsObj.store_name || store.name || '',
          whatsapp: settingsObj.whatsapp || store.whatsapp_number || '',
          email: settingsObj.email || store.email || '',
          address: settingsObj.address || store.address || '',
          deliveryFee: settingsObj.delivery_fee || '5.00',
          minOrder: settingsObj.min_order || '15.00',
          openTime: settingsObj.open_time || '10:00',
          closeTime: settingsObj.close_time || '22:00',
          instagram: settingsObj.instagram || store.instagram_url || '',
          facebook: settingsObj.facebook || store.facebook_url || '',
          logoUrl: store.logo_url || '',
          description: store.description || '',
          heroBgUrl: heroObj.background_image || '',
          heroLogoUrl: heroObj.logo_image || '',
          heroTitleLine1: heroObj.title_line1 || '',
          heroTitleLine2: heroObj.title_line2 || '',
          heroSubtitle: heroObj.subtitle || '',
          heroHighlight: heroObj.highlight_text || '',
          heroDescription: heroObj.description || '',
          heroCtaPrimary: heroObj.cta_primary || '',
          heroCtaSecondary: heroObj.cta_secondary || '',
          heroCtaPrimaryLink: heroObj.cta_primary_link || '',
          heroCtaSecondaryLink: heroObj.cta_secondary_link || '',
        })
      } catch (error) {
        console.error('Erro ao buscar configurações:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [store, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!store?.id) return

    try {
      setSaving(true)

      const settingsToSave = [
        { key: 'store_name', value: settings.storeName, description: 'Nome da loja' },
        { key: 'whatsapp', value: settings.whatsapp, description: 'Número do WhatsApp' },
        { key: 'email', value: settings.email, description: 'E-mail de contato' },
        { key: 'address', value: settings.address, description: 'Endereço da loja' },
        { key: 'delivery_fee', value: settings.deliveryFee, description: 'Taxa de entrega' },
        { key: 'min_order', value: settings.minOrder, description: 'Pedido mínimo' },
        { key: 'open_time', value: settings.openTime, description: 'Horário de abertura' },
        { key: 'close_time', value: settings.closeTime, description: 'Horário de fechamento' },
        { key: 'instagram', value: settings.instagram, description: 'Instagram' },
        { key: 'facebook', value: settings.facebook, description: 'Facebook' },
      ]

      // Salvar cada configuração - usando upsert com onConflict
      for (const setting of settingsToSave) {
        console.log(`💾 Salvando: ${setting.key} = ${setting.value}`)
        
        const { error } = await supabase
          .from('store_settings')
          .upsert({
            store_id: store.id,
            key: setting.key,
            value: setting.value,
            description: setting.description,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'store_id,key' })

        if (error) {
          console.error(`❌ Erro ao salvar ${setting.key}:`, error)
          // Não lançar erro, apenas logar
        } else {
          console.log(`✅ ${setting.key} salvo com sucesso`)
        }
      }

      // Salvar todos os campos hero em app_settings
      const heroFields = [
        { key: 'background_image', value: settings.heroBgUrl },
        { key: 'logo_image', value: settings.heroLogoUrl },
        { key: 'title_line1', value: settings.heroTitleLine1 },
        { key: 'title_line2', value: settings.heroTitleLine2 },
        { key: 'subtitle', value: settings.heroSubtitle },
        { key: 'highlight_text', value: settings.heroHighlight },
        { key: 'description', value: settings.heroDescription },
        { key: 'cta_primary', value: settings.heroCtaPrimary },
        { key: 'cta_secondary', value: settings.heroCtaSecondary },
        { key: 'cta_primary_link', value: settings.heroCtaPrimaryLink },
        { key: 'cta_secondary_link', value: settings.heroCtaSecondaryLink },
      ]
      for (const field of heroFields) {
        console.log(`[v0] Salvando hero field: ${field.key} = ${field.value}`)
        const { error: heroError } = await supabase.from('app_settings').upsert({
          store_id: store.id,
          section: 'hero',
          key: field.key,
          value: field.value || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'store_id,section,key' })
        if (heroError) {
          console.error(`[v0] Erro ao salvar hero ${field.key}:`, heroError)
        } else {
          console.log(`[v0] Hero ${field.key} salvo com sucesso`)
        }
      }

      // Atualizar tabela stores com logo e descrição
      if (settings.logoUrl || settings.description) {
        const { error: storeError } = await supabase
          .from('stores')
          .update({
            logo_url: settings.logoUrl || null,
            description: settings.description || null,
          })
          .eq('id', store.id)

        if (storeError) throw storeError
      }

      alert('Configurações salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      alert('Erro ao salvar configurações. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 Selecionando arquivo...')
    
    if (!e.target.files || !e.target.files[0]) {
      console.log('❌ Nenhum arquivo selecionado')
      return
    }
    
    const file = e.target.files[0]
    console.log('📄 Arquivo:', file.name, 'Tamanho:', file.size, 'Tipo:', file.type)
    
    if (!store?.id) {
      console.log('❌ Store não disponível')
      setUploadError('Erro: Loja não carregada')
      return
    }
    
    setUploading(true)
    setUploadError(null)
    setUploadSuccess(false)
    
    try {
      console.log('🚀 Iniciando upload...')
      
      // Upload direto via Supabase client
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${store.id}/${fileName}`
      
      console.log('📤 Enviando para logos/', filePath)
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file, {
          upsert: true,
          cacheControl: '3600',
        })
      
      if (uploadError) {
        console.error('❌ Erro no upload:', uploadError)
        throw new Error(uploadError.message)
      }
      
      console.log('✅ Upload concluído:', uploadData)
      
      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath)
      
      console.log('🔗 URL pública:', publicUrl)
      
      setSettings({ ...settings, logoUrl: publicUrl })
      setUploadSuccess(true)
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setUploadSuccess(false), 3000)
      
    } catch (error: any) {
      console.error('❌ Erro no upload:', error)
      setUploadError(error.message || 'Erro ao fazer upload. Tente novamente.')
    } finally {
      setUploading(false)
      // Limpar input para permitir selecionar mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }
  
  const handleRemoveLogo = () => {
    setSettings({ ...settings, logoUrl: '' })
    setUploadError(null)
    setUploadSuccess(false)
  }

  const handleHeroBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("[v0] handleHeroBgUpload chamado")
    if (!e.target.files || !e.target.files[0] || !store?.id) {
      console.log("[v0] Condição falhou - files:", e.target.files, "store:", store?.id)
      return
    }
    const file = e.target.files[0]
    console.log("[v0] Arquivo selecionado:", file.name, "tamanho:", file.size)
    setUploadingHero(true)
    setHeroUploadError(null)
    setHeroUploadSuccess(false)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `hero-bg-${Date.now()}.${fileExt}`
      const filePath = `${store.id}/${fileName}`
      console.log("[v0] Tentando upload para:", filePath)
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('logos')
        .upload(filePath, file, { upsert: true, cacheControl: '3600' })
      console.log("[v0] Resultado upload:", { uploadError, uploadData })
      if (uploadError) throw new Error(uploadError.message)
      const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(filePath)
      console.log("[v0] URL pública:", publicUrl)
      setSettings(prev => ({ ...prev, heroBgUrl: publicUrl }))
      setHeroUploadSuccess(true)
      setTimeout(() => setHeroUploadSuccess(false), 3000)
    } catch (error: any) {
      console.log("[v0] Erro no upload:", error)
      setHeroUploadError(error.message || 'Erro ao fazer upload.')
    } finally {
      setUploadingHero(false)
      if (heroFileInputRef.current) heroFileInputRef.current.value = ''
    }
  }

  const handleHeroLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !store?.id) return
    const file = e.target.files[0]
    setUploadingHero(true)
    setHeroUploadError(null)
    setHeroUploadSuccess(false)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `hero-logo-${Date.now()}.${fileExt}`
      const filePath = `${store.id}/${fileName}`
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file, { upsert: true, cacheControl: '3600' })
      if (uploadError) throw new Error(uploadError.message)
      const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(filePath)
      setSettings(prev => ({ ...prev, heroLogoUrl: publicUrl }))
      setHeroUploadSuccess(true)
      setTimeout(() => setHeroUploadSuccess(false), 3000)
    } catch (error: any) {
      setHeroUploadError(error.message || 'Erro ao fazer upload.')
    } finally {
      setUploadingHero(false)
      if (heroFileInputRef.current) heroFileInputRef.current.value = ''
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#120018] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#FF8C00] animate-spin" />
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
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">Configuracoes da Loja</h1>

            <form onSubmit={handleSubmit}>
              <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Store Info */}
                <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border">
                  <h2 className="text-base sm:text-lg font-bold text-foreground mb-4 sm:mb-6">Informacoes da Loja</h2>
                  
                  {/* Logo Upload - Melhorado */}
                  <div className="mb-4 sm:mb-6">
                    <label className="text-foreground/70 text-sm mb-2 block">Logo da Loja</label>
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Preview da Logo */}
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-muted overflow-hidden border border-border flex-shrink-0">
                        {settings.logoUrl ? (
                          <>
                            <Image
                              src={settings.logoUrl}
                              alt="Logo"
                              fill
                              className="object-contain p-2"
                            />
                            {/* Botão remover */}
                            <button
                              type="button"
                              onClick={handleRemoveLogo}
                              className="absolute top-1 right-1 w-5 h-5 sm:w-6 sm:h-6 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center text-foreground transition-colors"
                              title="Remover logo"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-foreground/40">
                            <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 mb-1" />
                            <span className="text-[10px] sm:text-xs">Sem logo</span>
                          </div>
                        )}
                        
                        {/* Overlay de loading */}
                        {uploading && (
                          <div className="absolute inset-0 bg-card/80 flex flex-col items-center justify-center">
                            <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF8C00] animate-spin mb-1" />
                            <span className="text-foreground/70 text-[10px] sm:text-xs">Enviando...</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Botões e mensagens */}
                      <div className="flex flex-col gap-2">
                        <input
                          type="file"
                          accept="image/*,.jpg,.jpeg,.png,.gif,.webp"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                          ref={fileInputRef}
                          disabled={uploading}
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          disabled={uploading}
                          onClick={() => fileInputRef.current?.click()}
                          className="border-border text-foreground/70 hover:bg-muted hover:text-foreground cursor-pointer disabled:opacity-50 w-fit"
                        >
                          {uploading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              {settings.logoUrl ? 'Trocar Logo' : 'Enviar Logo'}
                            </>
                          )}
                        </Button>
                        
                        {/* Mensagens de feedback */}
                        {uploadError && (
                          <div className="flex items-center gap-1 text-red-400 text-xs">
                            <AlertCircle className="w-3 h-3" />
                            <span>{uploadError}</span>
                          </div>
                        )}
                        {uploadSuccess && (
                          <div className="flex items-center gap-1 text-green-400 text-xs">
                            <Check className="w-3 h-3" />
                            <span>Logo enviada com sucesso!</span>
                          </div>
                        )}
                        
                        <p className="text-foreground/40 text-xs">
                          Formatos: JPG, PNG, GIF, WebP<br/>
                          Tamanho máximo: 5MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-foreground/70 text-sm mb-2 block">Nome da Loja</label>
                      <Input
                        value={settings.storeName}
                        onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                        className="bg-muted border-border text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-foreground/70 text-sm mb-2 block">Descrição</label>
                      <textarea
                        value={settings.description}
                        onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                        className="w-full bg-muted border-border text-foreground rounded-lg p-3 min-h-[100px]"
                        placeholder="Descrição da loja..."
                      />
                    </div>
                    <div>
                      <label className="text-foreground/70 text-sm mb-2 block">Endereço</label>
                      <Input
                        value={settings.address}
                        onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                        className="bg-muted border-border text-foreground"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h2 className="text-lg font-bold text-foreground mb-6">Contato</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-foreground/70 text-sm mb-2 block">WhatsApp</label>
                      <Input
                        value={settings.whatsapp}
                        onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                        className="bg-muted border-border text-foreground"
                        placeholder="(88) 9 9999-9999"
                      />
                    </div>
                    <div>
                      <label className="text-foreground/70 text-sm mb-2 block">E-mail</label>
                      <Input
                        type="email"
                        value={settings.email}
                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                        className="bg-muted border-border text-foreground"
                        placeholder="contato@loja.com"
                      />
                    </div>
                    <div>
                      <label className="text-foreground/70 text-sm mb-2 block">Instagram</label>
                      <Input
                        value={settings.instagram}
                        onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                        className="bg-muted border-border text-foreground"
                        placeholder="@lojaoficial"
                      />
                    </div>
                    <div>
                      <label className="text-foreground/70 text-sm mb-2 block">Facebook</label>
                      <Input
                        value={settings.facebook}
                        onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
                        className="bg-muted border-border text-foreground"
                        placeholder="facebook.com/loja"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery */}
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h2 className="text-lg font-bold text-foreground mb-6">Entrega</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-foreground/70 text-sm mb-2 block">Taxa de Entrega (R$)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={settings.deliveryFee}
                        onChange={(e) => setSettings({ ...settings, deliveryFee: e.target.value })}
                        className="bg-muted border-border text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-foreground/70 text-sm mb-2 block">Pedido Mínimo (R$)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={settings.minOrder}
                        onChange={(e) => setSettings({ ...settings, minOrder: e.target.value })}
                        className="bg-muted border-border text-foreground"
                      />
                    </div>
                  </div>
                </div>

                {/* Hours */}
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h2 className="text-lg font-bold text-foreground mb-6">Horário de Funcionamento</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-foreground/70 text-sm mb-2 block">Abertura</label>
                      <Input
                        type="time"
                        value={settings.openTime}
                        onChange={(e) => setSettings({ ...settings, openTime: e.target.value })}
                        className="bg-muted border-border text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-foreground/70 text-sm mb-2 block">Fechamento</label>
                      <Input
                        type="time"
                        value={settings.closeTime}
                        onChange={(e) => setSettings({ ...settings, closeTime: e.target.value })}
                        className="bg-muted border-border text-foreground"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Imagem de Fundo do Hero */}
              <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border mt-4 sm:mt-6">
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-1">Imagem de Fundo da Pagina Inicial</h2>
                <p className="text-muted-foreground text-xs sm:text-sm mb-4">Esta imagem aparece na primeira secao da loja, atras do titulo principal.</p>

                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Preview */}
                  <div className="relative w-full sm:w-64 h-36 rounded-xl overflow-hidden border border-border bg-muted flex-shrink-0">
                    {settings.heroBgUrl ? (
                      <>
                        <Image src={settings.heroBgUrl} alt="Fundo Hero" fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => setSettings(prev => ({ ...prev, heroBgUrl: '' }))}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-3 py-1.5 text-xs flex items-center gap-1"
                          >
                            <X className="w-3 h-3" /> Remover
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                        <ImageIcon className="w-8 h-8" />
                        <span className="text-xs">Sem imagem de fundo</span>
                      </div>
                    )}
                    {uploadingHero && (
                      <div className="absolute inset-0 bg-card/80 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                        <span className="text-xs text-muted-foreground">Enviando...</span>
                      </div>
                    )}
                  </div>

                  {/* Acoes */}
                  <div className="flex flex-col gap-2 justify-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleHeroBgUpload}
                      className="hidden"
                      ref={heroFileInputRef}
                      disabled={uploadingHero}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploadingHero}
                      onClick={() => heroFileInputRef.current?.click()}
                      className="border-border text-foreground/70 hover:bg-muted w-fit"
                    >
                      {uploadingHero ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</>
                      ) : (
                        <><Upload className="w-4 h-4 mr-2" />{settings.heroBgUrl ? 'Trocar Imagem' : 'Enviar Imagem'}</>
                      )}
                    </Button>
                    {heroUploadError && (
                      <div className="flex items-center gap-1 text-red-400 text-xs">
                        <AlertCircle className="w-3 h-3" /><span>{heroUploadError}</span>
                      </div>
                    )}
                    {heroUploadSuccess && (
                      <div className="flex items-center gap-1 text-green-400 text-xs">
                        <Check className="w-3 h-3" /><span>Imagem enviada! Clique em Salvar para aplicar.</span>
                      </div>
                    )}
                    <p className="text-muted-foreground text-xs">Formatos: JPG, PNG, WebP. Recomendado: 1920x1080px</p>
                  </div>
                </div>

                {/* Campos de texto */}
                <div className="mt-5 border-t border-border pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Titulo - Linha 1</label>
                    <p className="text-xs text-muted-foreground mb-1.5">Ex: <span className="italic">Açaí</span></p>
                    <input
                      type="text"
                      value={settings.heroTitleLine1}
                      onChange={e => setSettings(prev => ({ ...prev, heroTitleLine1: e.target.value }))}
                      placeholder="Açaí"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Titulo - Linha 2</label>
                    <p className="text-xs text-muted-foreground mb-1.5">Ex: <span className="italic">da Praia</span></p>
                    <input
                      type="text"
                      value={settings.heroTitleLine2}
                      onChange={e => setSettings(prev => ({ ...prev, heroTitleLine2: e.target.value }))}
                      placeholder="da Praia"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Subtitulo</label>
                    <p className="text-xs text-muted-foreground mb-1.5">Ex: <span className="italic">O melhor açaí, com o sabor</span></p>
                    <input
                      type="text"
                      value={settings.heroSubtitle}
                      onChange={e => setSettings(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                      placeholder="O melhor açaí, com o sabor"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Texto em Destaque</label>
                    <p className="text-xs text-muted-foreground mb-1.5">Ex: <span className="italic">do paraíso!</span> (aparece em laranja)</p>
                    <input
                      type="text"
                      value={settings.heroHighlight}
                      onChange={e => setSettings(prev => ({ ...prev, heroHighlight: e.target.value }))}
                      placeholder="do paraíso!"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1">Logo/Imagem do Hero (Grande e Responsiva)</label>
                    <p className="text-xs text-muted-foreground mb-2">Aparece no lugar dos títulos. Use PNG ou SVG com fundo transparente. Recomendado: 300x300px ou maior.</p>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Preview */}
                      <div className="relative w-full sm:w-40 h-40 rounded-xl overflow-hidden border border-border bg-muted flex-shrink-0 flex items-center justify-center">
                        {settings.heroLogoUrl ? (
                          <>
                            <Image src={settings.heroLogoUrl} alt="Logo Hero" fill className="object-contain p-2" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => setSettings(prev => ({ ...prev, heroLogoUrl: '' }))}
                                className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-3 py-1.5 text-xs flex items-center gap-1"
                              >
                                <X className="w-3 h-3" /> Remover
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                            <ImageIcon className="w-8 h-8" />
                            <span className="text-xs">Sem logo</span>
                          </div>
                        )}
                        {uploadingHero && (
                          <div className="absolute inset-0 bg-card/80 flex flex-col items-center justify-center gap-2">
                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                            <span className="text-xs text-muted-foreground">Enviando...</span>
                          </div>
                        )}
                      </div>

                      {/* Acoes */}
                      <div className="flex flex-col gap-2 justify-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleHeroLogoUpload}
                          className="hidden"
                          ref={heroLogoFileInputRef}
                          disabled={uploadingHero}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          disabled={uploadingHero}
                          onClick={() => heroLogoFileInputRef.current?.click()}
                          className="border-border text-foreground/70 hover:bg-muted w-fit"
                        >
                          {uploadingHero ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</>
                          ) : (
                            <><Upload className="w-4 h-4 mr-2" />{settings.heroLogoUrl ? 'Trocar Logo' : 'Enviar Logo'}</>
                          )}
                        </Button>
                        {heroUploadError && (
                          <div className="flex items-center gap-1 text-red-400 text-xs">
                            <AlertCircle className="w-3 h-3" /><span>{heroUploadError}</span>
                          </div>
                        )}
                        {heroUploadSuccess && (
                          <div className="flex items-center gap-1 text-green-400 text-xs">
                            <Check className="w-3 h-3" /><span>Logo enviada! Clique em Salvar.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1">Descricao</label>
                    <p className="text-xs text-muted-foreground mb-1.5">Texto pequeno abaixo do destaque</p>
                    <textarea
                      value={settings.heroDescription}
                      onChange={e => setSettings(prev => ({ ...prev, heroDescription: e.target.value }))}
                      placeholder="Açaí cremoso, ingredientes selecionados e aquele toque especial que só a gente tem!"
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    />
                  </div>
                  <div className="sm:col-span-2 border-t border-border pt-4">
                    <p className="text-sm font-semibold text-foreground mb-3">Botoes de Acao (CTA)</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Botao Principal */}
                      <div className="bg-muted/40 rounded-xl p-4 flex flex-col gap-3 border border-border">
                        <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">Botao Principal</p>
                        <div>
                          <label className="block text-xs font-medium text-foreground mb-1">Texto do botao</label>
                          <input
                            type="text"
                            value={settings.heroCtaPrimary}
                            onChange={e => setSettings(prev => ({ ...prev, heroCtaPrimary: e.target.value }))}
                            placeholder="PEÇA AGORA"
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-foreground mb-1">Link / Pagina de destino</label>
                          <select
                            value={settings.heroCtaPrimaryLink}
                            onChange={e => setSettings(prev => ({ ...prev, heroCtaPrimaryLink: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          >
                            <option value="">-- Selecionar pagina --</option>
                            <optgroup label="Loja">
                              <option value="/">Pagina Inicial</option>
                              <option value="/cardapio">Cardapio</option>
                              <option value="/combos">Combos</option>
                              <option value="/promocoes">Promocoes</option>
                              <option value="/sobre-nos">Sobre Nos</option>
                              <option value="/contato">Contato</option>
                              <option value="/blog">Blog</option>
                            </optgroup>
                            <optgroup label="Conta">
                              <option value="/login">Login</option>
                              <option value="/perfil">Meu Perfil</option>
                              <option value="/meus-pedidos">Meus Pedidos</option>
                              <option value="/checkout">Checkout</option>
                            </optgroup>
                          </select>
                          {settings.heroCtaPrimaryLink && (
                            <p className="text-xs text-muted-foreground mt-1">Destino: <span className="text-primary font-mono">{settings.heroCtaPrimaryLink}</span></p>
                          )}
                        </div>
                      </div>

                      {/* Botao Secundario */}
                      <div className="bg-muted/40 rounded-xl p-4 flex flex-col gap-3 border border-border">
                        <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">Botao Secundario</p>
                        <div>
                          <label className="block text-xs font-medium text-foreground mb-1">Texto do botao</label>
                          <input
                            type="text"
                            value={settings.heroCtaSecondary}
                            onChange={e => setSettings(prev => ({ ...prev, heroCtaSecondary: e.target.value }))}
                            placeholder="VER CARDÁPIO"
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-foreground mb-1">Link / Pagina de destino</label>
                          <select
                            value={settings.heroCtaSecondaryLink}
                            onChange={e => setSettings(prev => ({ ...prev, heroCtaSecondaryLink: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          >
                            <option value="">-- Selecionar pagina --</option>
                            <optgroup label="Loja">
                              <option value="/">Pagina Inicial</option>
                              <option value="/cardapio">Cardapio</option>
                              <option value="/combos">Combos</option>
                              <option value="/promocoes">Promocoes</option>
                              <option value="/sobre-nos">Sobre Nos</option>
                              <option value="/contato">Contato</option>
                              <option value="/blog">Blog</option>
                            </optgroup>
                            <optgroup label="Conta">
                              <option value="/login">Login</option>
                              <option value="/perfil">Meu Perfil</option>
                              <option value="/meus-pedidos">Meus Pedidos</option>
                              <option value="/checkout">Checkout</option>
                            </optgroup>
                          </select>
                          {settings.heroCtaSecondaryLink && (
                            <p className="text-xs text-muted-foreground mt-1">Destino: <span className="text-primary font-mono">{settings.heroCtaSecondaryLink}</span></p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-6 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="bg-[#FF8C00] hover:bg-[#FFC300] text-foreground font-bold px-8"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
