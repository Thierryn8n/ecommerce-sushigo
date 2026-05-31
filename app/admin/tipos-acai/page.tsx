"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Image as ImageIcon, Weight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { uploadImage } from '@/lib/supabase/storage'
import { AcaiType } from '@/lib/types'
import { AdminSidebar, AdminHeader } from '@/components/admin/admin-layout'

export default function TiposAcaiPage() {
  const [types, setTypes] = useState<AcaiType[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingType, setEditingType] = useState<AcaiType | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    weight_addition: '',
    price_per_kg: '',
    image_url: '',
    is_active: true,
    display_order: '0',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchTypes()
  }, [])

  const fetchTypes = async () => {
    const { data, error } = await supabase
      .from('acai_types')
      .select('*')
      .order('display_order')

    if (error) {
      console.error('Erro ao buscar tipos:', error)
    } else {
      setTypes(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    let imageUrl = formData.image_url
    if (imageFile) {
      const result = await uploadImage(imageFile, 'acai-types', 'acai-types')
      if (result.url) imageUrl = result.url
    }

    const typeData = {
      name: formData.name,
      description: formData.description || null,
      weight_addition: parseInt(formData.weight_addition) || 0,
      price_per_kg: parseFloat(formData.price_per_kg) || 0,
      image_url: imageUrl || null,
      is_active: formData.is_active,
      display_order: parseInt(formData.display_order),
    }

    if (editingType) {
      const { error } = await supabase.from('acai_types').update(typeData).eq('id', editingType.id)
      if (error) console.error('Erro ao atualizar:', error)
    } else {
      const { error } = await supabase.from('acai_types').insert([typeData])
      if (error) console.error('Erro ao criar:', error)
    }

    setUploading(false)
    setDialogOpen(false)
    resetForm()
    fetchTypes()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este tipo?')) {
      const { error } = await supabase.from('acai_types').delete().eq('id', id)
      if (error) console.error('Erro ao excluir:', error)
      else fetchTypes()
    }
  }

  const handleEdit = (type: AcaiType) => {
    setEditingType(type)
    setFormData({
      name: type.name,
      description: type.description || '',
      weight_addition: type.weight_addition.toString(),
      price_per_kg: type.price_per_kg?.toString() || '',
      image_url: type.image_url || '',
      is_active: type.is_active,
      display_order: type.display_order.toString(),
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEditingType(null)
    setFormData({
      name: '', description: '', weight_addition: '', price_per_kg: '',
      image_url: '', is_active: true, display_order: '0',
    })
    setImageFile(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="lg:ml-56">
        <AdminHeader />
        <main className="p-3 sm:p-4 md:p-6 lg:p-8 pb-20 lg:pb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Tipos de Acai</h1>
              <p className="text-muted-foreground text-sm mt-1">Gerencie os sabores base e pesos adicionais</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setDialogOpen(true) }} className="bg-[#FF8C00] hover:bg-[#FFC300]">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Tipo
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border text-foreground max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-auto">
                <DialogHeader>
                  <DialogTitle>{editingType ? 'Editar Tipo' : 'Novo Tipo de Acai'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="bg-muted border-border" />
                  </div>
                  <div>
                    <Label htmlFor="description">Descricao</Label>
                    <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="bg-muted border-border" rows={2} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price_per_kg">Preco por Quilo (R$)</Label>
                      <Input id="price_per_kg" type="number" step="0.01" value={formData.price_per_kg} onChange={(e) => setFormData({ ...formData, price_per_kg: e.target.value })} className="bg-muted border-border" />
                    </div>
                    <div>
                      <Label htmlFor="weight_addition">Adicional Peso (g)</Label>
                      <Input id="weight_addition" type="number" value={formData.weight_addition} onChange={(e) => setFormData({ ...formData, weight_addition: e.target.value })} className="bg-muted border-border" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="display_order">Ordem</Label>
                      <Input id="display_order" type="number" value={formData.display_order} onChange={(e) => setFormData({ ...formData, display_order: e.target.value })} className="bg-muted border-border" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="image">Imagem</Label>
                    <Input id="image" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="bg-muted border-border" />
                    {formData.image_url && (
                      <img src={formData.image_url} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="is_active" checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                    <Label htmlFor="is_active">Ativo</Label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-border text-foreground hover:bg-muted">Cancelar</Button>
                    <Button type="submit" disabled={uploading} className="bg-[#FF8C00] hover:bg-[#FFC300]">{uploading ? 'Salvando...' : 'Salvar'}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {types.map((type) => (
              <motion.div key={type.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-4 md:p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                    {type.image_url ? (
                      <img src={type.image_url} alt={type.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-foreground/50" />
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(type)} className="text-foreground hover:bg-muted"><Edit className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(type.id)} className="text-red-500 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1">{type.name}</h3>
                {type.description && <p className="text-muted-foreground text-sm mb-2">{type.description}</p>}
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-[#FFC300] font-semibold">R$ {type.price_per_kg?.toFixed(2) || '0.00'}/kg</span>
                  <span className="text-foreground/70 flex items-center gap-1"><Weight className="w-3 h-3" /> {type.weight_addition}g</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${type.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{type.is_active ? 'Ativo' : 'Inativo'}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
