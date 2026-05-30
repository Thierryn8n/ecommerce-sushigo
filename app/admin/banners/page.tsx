"use client"

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Image as ImageIcon, Monitor, Smartphone, Upload, X, Check, Loader2, AlertCircle, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { Banner } from '@/lib/types'
import { AdminSidebar, AdminHeader } from '@/components/admin/admin-layout'

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image_url: '',
    mobile_image_url: '',
    link_url: '',
    button_text: '',
    display_order: '0',
    is_active: true,
    start_date: '',
    end_date: '',
    background_color: '#8B5CF6',
    floating_image_url: '',
  })

  const [uploadingDesktop, setUploadingDesktop] = useState(false)
  const [uploadingMobile, setUploadingMobile] = useState(false)
  const [uploadDesktopError, setUploadDesktopError] = useState<string | null>(null)
  const [uploadMobileError, setUploadMobileError] = useState<string | null>(null)
  const [uploadDesktopSuccess, setUploadDesktopSuccess] = useState(false)
  const [uploadMobileSuccess, setUploadMobileSuccess] = useState(false)
  const [uploadingFloating, setUploadingFloating] = useState(false)
  const [uploadFloatingError, setUploadFloatingError] = useState<string | null>(null)
  const [uploadFloatingSuccess, setUploadFloatingSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  const desktopFileRef = useRef<HTMLInputElement>(null)
  const mobileFileRef = useRef<HTMLInputElement>(null)
  const floatingFileRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('display_order')
    if (error) console.error('Erro ao buscar banners:', error)
    else setBanners(data || [])
    setLoading(false)
  }

  const uploadImageToStorage = async (
    file: File,
    prefix: string,
  ): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${prefix}-${Date.now()}.${fileExt}`
    const { error, data } = await supabase.storage
      .from('banners')
      .upload(fileName, file, { upsert: true, cacheControl: '3600' })
    if (error) throw new Error(error.message)
    const { data: { publicUrl } } = supabase.storage.from('banners').getPublicUrl(fileName)
    return publicUrl
  }

  const handleDesktopUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    const file = e.target.files[0]
    setUploadingDesktop(true)
    setUploadDesktopError(null)
    setUploadDesktopSuccess(false)
    try {
      const url = await uploadImageToStorage(file, 'desktop')
      setFormData(prev => ({ ...prev, image_url: url }))
      setUploadDesktopSuccess(true)
      setTimeout(() => setUploadDesktopSuccess(false), 3000)
    } catch (err: any) {
      setUploadDesktopError(err.message || 'Erro ao enviar imagem.')
    } finally {
      setUploadingDesktop(false)
      if (desktopFileRef.current) desktopFileRef.current.value = ''
    }
  }

  const handleMobileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    const file = e.target.files[0]
    setUploadingMobile(true)
    setUploadMobileError(null)
    setUploadMobileSuccess(false)
    try {
      const url = await uploadImageToStorage(file, 'mobile')
      setFormData(prev => ({ ...prev, mobile_image_url: url }))
      setUploadMobileSuccess(true)
      setTimeout(() => setUploadMobileSuccess(false), 3000)
    } catch (err: any) {
      setUploadMobileError(err.message || 'Erro ao enviar imagem.')
    } finally {
      setUploadingMobile(false)
      if (mobileFileRef.current) mobileFileRef.current.value = ''
    }
  }

  const handleFloatingUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    const file = e.target.files[0]
    setUploadingFloating(true)
    setUploadFloatingError(null)
    setUploadFloatingSuccess(false)
    try {
      const url = await uploadImageToStorage(file, 'floating')
      setFormData(prev => ({ ...prev, floating_image_url: url }))
      setUploadFloatingSuccess(true)
      setTimeout(() => setUploadFloatingSuccess(false), 3000)
    } catch (err: any) {
      setUploadFloatingError(err.message || 'Erro ao enviar imagem.')
    } finally {
      setUploadingFloating(false)
      if (floatingFileRef.current) floatingFileRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const bannerData = {
      title: formData.title || null,
      subtitle: formData.subtitle || null,
      description: formData.description || null,
      image_url: formData.image_url || null,
      mobile_image_url: formData.mobile_image_url || null,
      link_url: formData.link_url || null,
      button_text: formData.button_text || null,
      display_order: parseInt(formData.display_order),
      is_active: formData.is_active,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      background_color: formData.background_color || null,
      floating_image_url: formData.floating_image_url || null,
    }

    if (editingBanner) {
      const { error } = await supabase.from('banners').update(bannerData).eq('id', editingBanner.id)
      if (error) console.error('Erro ao atualizar:', error)
    } else {
      const { error } = await supabase.from('banners').insert([bannerData])
      if (error) console.error('Erro ao criar:', error)
    }

    setSaving(false)
    setDialogOpen(false)
    resetForm()
    fetchBanners()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este banner?')) {
      const { error } = await supabase.from('banners').delete().eq('id', id)
      if (error) console.error('Erro ao excluir:', error)
      else fetchBanners()
    }
  }

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner)
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      description: banner.description || '',
      image_url: banner.image_url || '',
      mobile_image_url: banner.mobile_image_url || '',
      link_url: banner.link_url || '',
      button_text: banner.button_text || '',
      display_order: banner.display_order.toString(),
      is_active: banner.is_active,
      start_date: banner.start_date ? banner.start_date.split('T')[0] : '',
      end_date: banner.end_date ? banner.end_date.split('T')[0] : '',
      background_color: banner.background_color || '#8B5CF6',
      floating_image_url: banner.floating_image_url || '',
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEditingBanner(null)
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      image_url: '',
      mobile_image_url: '',
      link_url: '',
      button_text: '',
      display_order: '0',
      is_active: true,
      start_date: '',
      end_date: '',
      background_color: '#8B5CF6',
      floating_image_url: '',
    })
    setUploadDesktopError(null)
    setUploadMobileError(null)
    setUploadFloatingError(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="lg:ml-56">
        <AdminHeader />
        <main className="p-3 sm:p-4 md:p-6 lg:p-8 pb-20 lg:pb-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Banners</h1>
              <p className="text-muted-foreground text-sm mt-1">Cada banner pode ter uma versao para PC e outra para celular</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setDialogOpen(true) }} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Banner
                </Button>
              </DialogTrigger>

              <DialogContent className="bg-card border-border text-foreground max-w-3xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-auto">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold">{editingBanner ? 'Editar Banner' : 'Novo Banner'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* Imagens PC e Mobile */}
                  <div className="border border-border rounded-xl overflow-hidden">
                    <div className="bg-muted/50 px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold text-foreground">Imagens do Banner</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Adicione versoes diferentes para PC e celular</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">

                      {/* Desktop */}
                      <div className="p-4 flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-foreground">
                          <Monitor className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">Versao PC</span>
                          <span className="text-xs text-muted-foreground ml-auto">Recomendado: 1200x400px</span>
                        </div>

                        {/* Preview Desktop */}
                        <div className="relative w-full h-36 rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center">
                          {formData.image_url ? (
                            <>
                              <img src={formData.image_url} alt="Preview PC" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                                  className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-3 py-1.5 text-xs flex items-center gap-1"
                                >
                                  <X className="w-3 h-3" /> Remover
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                              <Monitor className="w-8 h-8" />
                              <span className="text-xs">Sem imagem PC</span>
                            </div>
                          )}
                          {uploadingDesktop && (
                            <div className="absolute inset-0 bg-card/80 flex items-center justify-center">
                              <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                          )}
                        </div>

                        <input type="file" accept="image/*" ref={desktopFileRef} onChange={handleDesktopUpload} className="hidden" disabled={uploadingDesktop} />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={uploadingDesktop}
                          onClick={() => desktopFileRef.current?.click()}
                          className="border-border text-foreground/70 hover:bg-muted w-full"
                        >
                          {uploadingDesktop ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</> : <><Upload className="w-4 h-4 mr-2" />{formData.image_url ? 'Trocar Imagem PC' : 'Enviar Imagem PC'}</>}
                        </Button>
                        {uploadDesktopError && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{uploadDesktopError}</p>}
                        {uploadDesktopSuccess && <p className="text-xs text-green-400 flex items-center gap-1"><Check className="w-3 h-3" />Imagem PC enviada!</p>}
                      </div>

                      {/* Mobile */}
                      <div className="p-4 flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-foreground">
                          <Smartphone className="w-4 h-4 text-secondary" />
                          <span className="text-sm font-medium">Versao Celular</span>
                          <span className="text-xs text-muted-foreground ml-auto">Recomendado: 600x400px</span>
                        </div>

                        {/* Preview Mobile */}
                        <div className="relative w-full h-36 rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center">
                          {formData.mobile_image_url ? (
                            <>
                              <img src={formData.mobile_image_url} alt="Preview Mobile" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => setFormData(prev => ({ ...prev, mobile_image_url: '' }))}
                                  className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-3 py-1.5 text-xs flex items-center gap-1"
                                >
                                  <X className="w-3 h-3" /> Remover
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                              <Smartphone className="w-8 h-8" />
                              <span className="text-xs">Sem imagem Celular</span>
                            </div>
                          )}
                          {uploadingMobile && (
                            <div className="absolute inset-0 bg-card/80 flex items-center justify-center">
                              <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                          )}
                        </div>

                        <input type="file" accept="image/*" ref={mobileFileRef} onChange={handleMobileUpload} className="hidden" disabled={uploadingMobile} />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={uploadingMobile}
                          onClick={() => mobileFileRef.current?.click()}
                          className="border-border text-foreground/70 hover:bg-muted w-full"
                        >
                          {uploadingMobile ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</> : <><Upload className="w-4 h-4 mr-2" />{formData.mobile_image_url ? 'Trocar Imagem Celular' : 'Enviar Imagem Celular'}</>}
                        </Button>
                        {uploadMobileError && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{uploadMobileError}</p>}
                        {uploadMobileSuccess && <p className="text-xs text-green-400 flex items-center gap-1"><Check className="w-3 h-3" />Imagem Celular enviada!</p>}
                      </div>

                    </div>
                  </div>

                  {/* Imagem Flutuante */}
                  <div className="border border-border rounded-xl overflow-hidden">
                    <div className="bg-muted/50 px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold text-foreground">Imagem Flutuante</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Produto/personagem que flutua na lateral direita do banner (PNG com fundo transparente ideal)</p>
                    </div>
                    <div className="p-4 flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-foreground">
                        <ImageIcon className="w-4 h-4 text-secondary" />
                        <span className="text-sm font-medium">Imagem Lateral</span>
                        <span className="text-xs text-muted-foreground ml-auto">Recomendado: 400x400px, PNG</span>
                      </div>

                      <div className="relative w-full h-36 rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center">
                        {formData.floating_image_url ? (
                          <>
                            <img src={formData.floating_image_url} alt="Preview Flutuante" className="w-full h-full object-contain" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, floating_image_url: '' }))}
                                className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-3 py-1.5 text-xs flex items-center gap-1"
                              >
                                <X className="w-3 h-3" /> Remover
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <ImageIcon className="w-8 h-8" />
                            <span className="text-xs">Sem imagem flutuante</span>
                          </div>
                        )}
                        {uploadingFloating && (
                          <div className="absolute inset-0 bg-card/80 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          </div>
                        )}
                      </div>

                      <input type="file" accept="image/*" ref={floatingFileRef} onChange={handleFloatingUpload} className="hidden" disabled={uploadingFloating} />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingFloating}
                        onClick={() => floatingFileRef.current?.click()}
                        className="border-border text-foreground/70 hover:bg-muted w-full"
                      >
                        {uploadingFloating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</> : <><Upload className="w-4 h-4 mr-2" />{formData.floating_image_url ? 'Trocar Imagem Flutuante' : 'Enviar Imagem Flutuante'}</>}
                      </Button>
                      {uploadFloatingError && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{uploadFloatingError}</p>}
                      {uploadFloatingSuccess && <p className="text-xs text-green-400 flex items-center gap-1"><Check className="w-3 h-3" />Imagem flutuante enviada!</p>}
                    </div>
                  </div>

                  {/* Textos */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Titulo</Label>
                      <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="bg-muted border-border mt-1" placeholder="Ex: Promocao de verao" />
                    </div>
                    <div>
                      <Label htmlFor="subtitle">Subtitulo</Label>
                      <Input id="subtitle" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} className="bg-muted border-border mt-1" placeholder="Ex: Ate 50% off" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Descricao</Label>
                    <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="bg-muted border-border mt-1 resize-none" rows={2} placeholder="Descricao opcional do banner" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="link_url">Link de destino</Label>
                      <Input id="link_url" value={formData.link_url} onChange={(e) => setFormData({ ...formData, link_url: e.target.value })} className="bg-muted border-border mt-1" placeholder="/cardapio" />
                    </div>
                    <div>
                      <Label htmlFor="button_text">Texto do Botao</Label>
                      <Input id="button_text" value={formData.button_text} onChange={(e) => setFormData({ ...formData, button_text: e.target.value })} className="bg-muted border-border mt-1" placeholder="Ver mais" />
                    </div>
                  </div>

                  {/* Cor de Fundo */}
                  <div>
                    <Label className="flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Cor de Fundo do Banner
                    </Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[
                        '#8B5CF6', '#EC4899', '#F59E0B', '#10B981',
                        '#3B82F6', '#EF4444', '#6366F1', '#14B8A6',
                        '#F97316', '#84CC16', '#111111', '#ffffff',
                      ].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, background_color: color }))}
                          className={`w-8 h-8 rounded-full transition-all border border-border ${
                            formData.background_color === color
                              ? 'ring-2 ring-offset-2 ring-offset-card ring-primary scale-110'
                              : 'hover:scale-110'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                      <Input
                        type="color"
                        value={formData.background_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, background_color: e.target.value }))}
                        className="w-8 h-8 p-0 border-0 cursor-pointer rounded-full overflow-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="display_order">Ordem</Label>
                      <Input id="display_order" type="number" value={formData.display_order} onChange={(e) => setFormData({ ...formData, display_order: e.target.value })} className="bg-muted border-border mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="start_date">Inicio</Label>
                      <Input id="start_date" type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="bg-muted border-border mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="end_date">Fim</Label>
                      <Input id="end_date" type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className="bg-muted border-border mt-1" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-muted/40 px-4 py-3 rounded-lg border border-border">
                    <Switch id="is_active" checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                    <div>
                      <Label htmlFor="is_active" className="cursor-pointer">Banner ativo</Label>
                      <p className="text-xs text-muted-foreground">Desative para esconder sem excluir</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-border">
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : 'Salvar Banner'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Lista de Banners */}
          {banners.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-2xl">
              <ImageIcon className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-foreground font-medium">Nenhum banner cadastrado</p>
              <p className="text-muted-foreground text-sm mt-1">Clique em &quot;Novo Banner&quot; para comecar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {banners.map((banner) => (
                <motion.div
                  key={banner.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-2xl overflow-hidden"
                >
                  {/* Color Bar */}
                  <div
                    className="h-2"
                    style={{ backgroundColor: banner.background_color || '#8B5CF6' }}
                  />
                  {/* Previews PC e Mobile lado a lado */}
                  <div className="grid grid-cols-2 divide-x divide-border">
                    {/* PC */}
                    <div className="relative">
                      <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/60 border-b border-border">
                        <Monitor className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-medium text-foreground">PC</span>
                      </div>
                      <div className="h-32 bg-muted">
                        {banner.image_url ? (
                          <img src={banner.image_url} alt={banner.title || 'Banner PC'} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Monitor className="w-8 h-8 opacity-30" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mobile */}
                    <div className="relative">
                      <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/60 border-b border-border">
                        <Smartphone className="w-3.5 h-3.5 text-secondary" />
                        <span className="text-xs font-medium text-foreground">Celular</span>
                      </div>
                      <div className="h-32 bg-muted">
                        {(banner.mobile_image_url || banner.image_url) ? (
                          <img
                            src={banner.mobile_image_url || banner.image_url || ''}
                            alt={banner.title || 'Banner Mobile'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Smartphone className="w-8 h-8 opacity-30" />
                          </div>
                        )}
                        {!banner.mobile_image_url && banner.image_url && (
                          <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                            usando PC
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${banner.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {banner.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                          {banner.floating_image_url && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary/20 text-secondary flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" /> Flutuante
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">Ordem: {banner.display_order}</span>
                        </div>
                        {banner.title && <h3 className="font-semibold text-foreground truncate">{banner.title}</h3>}
                        {banner.subtitle && <p className="text-sm text-muted-foreground truncate">{banner.subtitle}</p>}
                        {banner.link_url && <p className="text-xs text-primary font-mono truncate mt-1">{banner.link_url}</p>}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(banner)} className="hover:bg-muted text-foreground/70 h-8 w-8 p-0">
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(banner.id)} className="hover:bg-red-500/10 text-red-400 h-8 w-8 p-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
