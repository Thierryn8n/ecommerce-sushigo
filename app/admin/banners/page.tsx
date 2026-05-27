"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { uploadImage } from '@/lib/supabase/storage'
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
    link_url: '',
    button_text: '',
    display_order: '0',
    is_active: true,
    start_date: '',
    end_date: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('display_order')
    
    if (error) {
      console.error('Erro ao buscar banners:', error)
    } else {
      setBanners(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    let imageUrl = formData.image_url
    if (imageFile) {
      const result = await uploadImage(imageFile, 'banners', 'banners')
      if (result.url) {
        imageUrl = result.url
      }
    }

    const bannerData = {
      title: formData.title || null,
      subtitle: formData.subtitle || null,
      description: formData.description || null,
      image_url: imageUrl || null,
      link_url: formData.link_url || null,
      button_text: formData.button_text || null,
      display_order: parseInt(formData.display_order),
      is_active: formData.is_active,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
    }

    if (editingBanner) {
      const { error } = await supabase
        .from('banners')
        .update(bannerData)
        .eq('id', editingBanner.id)
      
      if (error) console.error('Erro ao atualizar:', error)
    } else {
      const { error } = await supabase
        .from('banners')
        .insert([bannerData])
      
      if (error) console.error('Erro ao criar:', error)
    }

    setUploading(false)
    setDialogOpen(false)
    resetForm()
    fetchBanners()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este banner?')) {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id)
      
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
      link_url: banner.link_url || '',
      button_text: banner.button_text || '',
      display_order: banner.display_order.toString(),
      is_active: banner.is_active,
      start_date: banner.start_date ? banner.start_date.split('T')[0] : '',
      end_date: banner.end_date ? banner.end_date.split('T')[0] : '',
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
      link_url: '',
      button_text: '',
      display_order: '0',
      is_active: true,
      start_date: '',
      end_date: '',
    })
    setImageFile(null)
  }

  if (loading) {
    return <div className="p-8">Carregando...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="lg:ml-56">
        <AdminHeader />
        <main className="p-3 sm:p-4 md:p-6 lg:p-8 pb-20 lg:pb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Banners</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setDialogOpen(true) }} className="bg-[#FF8C00] hover:bg-[#FFC300]">
              <Plus className="w-4 h-4 mr-2" />
              Novo Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-auto">
            <DialogHeader>
              <DialogTitle>{editingBanner ? 'Editar Banner' : 'Novo Banner'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-muted border-border"
                />
              </div>
              <div>
                <Label htmlFor="subtitle">Subtítulo</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="bg-muted border-border"
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-muted border-border"
                />
              </div>
              <div>
                <Label htmlFor="link_url">Link URL</Label>
                <Input
                  id="link_url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  className="bg-muted border-border"
                />
              </div>
              <div>
                <Label htmlFor="button_text">Texto do Botão</Label>
                <Input
                  id="button_text"
                  value={formData.button_text}
                  onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                  className="bg-muted border-border"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="display_order">Ordem de Exibição</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                    className="bg-muted border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="start_date">Data Início</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="bg-muted border-border"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="end_date">Data Fim</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="bg-muted border-border"
                />
              </div>
              <div>
                <Label htmlFor="image">Imagem</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="bg-muted border-border"
                />
                {formData.image_url && (
                  <img src={formData.image_url} alt="Preview" className="mt-2 w-full h-48 object-cover rounded" />
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Ativo</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-border text-foreground hover:bg-muted">
                  Cancelar
                </Button>
                <Button type="submit" disabled={uploading} className="bg-[#FF8C00] hover:bg-[#FFC300]">
                  {uploading ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((banner) => (
          <motion.div
            key={banner.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl overflow-hidden"
          >
            <div className="relative h-48 bg-muted">
              {banner.image_url ? (
                <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-foreground/50" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => handleEdit(banner)} className="bg-black/50 text-foreground hover:bg-black/70">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(banner.id)} className="bg-red-500/50 text-white hover:bg-red-500/70">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="absolute top-2 left-2">
                <span className={`px-2 py-1 rounded text-xs ${banner.is_active ? 'bg-green-500' : 'bg-red-500'}`}>
                  {banner.is_active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-xl font-bold text-foreground mb-2">{banner.title}</h3>
              {banner.subtitle && <p className="text-muted-foreground text-sm mb-2">{banner.subtitle}</p>}
              {banner.description && <p className="text-foreground/50 text-sm mb-2">{banner.description}</p>}
              <div className="flex justify-between items-center text-sm">
                <span className="text-foreground/50">Ordem: {banner.display_order}</span>
                {banner.link_url && (
                  <span className="text-[#FFC300] truncate max-w-[200px]">{banner.link_url || ''}</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
        </main>
      </div>
    </div>
  )
}
