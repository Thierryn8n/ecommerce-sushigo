"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { uploadImage } from '@/lib/supabase/storage'
import { Bowl } from '@/lib/types'
import { AdminSidebar, AdminHeader } from '@/components/admin/admin-layout'

export default function VasilhasPage() {
  const [bowls, setBowls] = useState<Bowl[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBowl, setEditingBowl] = useState<Bowl | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ml: '',
    max_weight: '',
    price_addition: '',
    image_url: '',
    bowl_type: '',
    is_active: true,
    display_order: '0',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchBowls()
  }, [])

  const fetchBowls = async () => {
    const { data, error } = await supabase
      .from('bowls')
      .select('*')
      .order('display_order')
    
    if (error) {
      console.error('Erro ao buscar vasilhas:', error)
    } else {
      setBowls(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    let imageUrl = formData.image_url
    if (imageFile) {
      const result = await uploadImage(imageFile, 'bowls', 'bowls')
      if (result.url) {
        imageUrl = result.url
      }
    }

    const bowlData = {
      name: formData.name,
      description: formData.description || null,
      ml: parseInt(formData.ml),
      max_weight: formData.max_weight ? parseInt(formData.max_weight) : null,
      price_addition: parseFloat(formData.price_addition),
      image_url: imageUrl || null,
      bowl_type: formData.bowl_type || null,
      is_active: formData.is_active,
      display_order: parseInt(formData.display_order),
    }

    if (editingBowl) {
      const { error } = await supabase
        .from('bowls')
        .update(bowlData)
        .eq('id', editingBowl.id)
      
      if (error) console.error('Erro ao atualizar:', error)
    } else {
      const { error } = await supabase
        .from('bowls')
        .insert([bowlData])
      
      if (error) console.error('Erro ao criar:', error)
    }

    setUploading(false)
    setDialogOpen(false)
    resetForm()
    fetchBowls()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta vasilha?')) {
      const { error } = await supabase
        .from('bowls')
        .delete()
        .eq('id', id)
      
      if (error) console.error('Erro ao excluir:', error)
      else fetchBowls()
    }
  }

  const handleEdit = (bowl: Bowl) => {
    setEditingBowl(bowl)
    setFormData({
      name: bowl.name,
      description: bowl.description || '',
      ml: bowl.ml.toString(),
      max_weight: bowl.max_weight?.toString() || '',
      price_addition: bowl.price_addition.toString(),
      image_url: bowl.image_url || '',
      bowl_type: bowl.bowl_type || '',
      is_active: bowl.is_active,
      display_order: bowl.display_order.toString(),
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEditingBowl(null)
    setFormData({
      name: '',
      description: '',
      ml: '',
      max_weight: '',
      price_addition: '',
      image_url: '',
      bowl_type: '',
      is_active: true,
      display_order: '0',
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
        <main className="p-4 md:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Gerenciar Vasilhas</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setDialogOpen(true) }} className="bg-[#FF8C00] hover:bg-[#FFC300]">
              <Plus className="w-4 h-4 mr-2" />
              Nova Vasilha
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-auto">
            <DialogHeader>
              <DialogTitle>{editingBowl ? 'Editar Vasilha' : 'Nova Vasilha'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ml">ML</Label>
                  <Input
                    id="ml"
                    type="number"
                    value={formData.ml}
                    onChange={(e) => setFormData({ ...formData, ml: e.target.value })}
                    required
                    className="bg-muted border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="max_weight">Peso Máximo (g)</Label>
                  <Input
                    id="max_weight"
                    type="number"
                    value={formData.max_weight}
                    onChange={(e) => setFormData({ ...formData, max_weight: e.target.value })}
                    className="bg-muted border-border"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price_addition">Preço Adicional (R$)</Label>
                  <Input
                    id="price_addition"
                    type="number"
                    step="0.01"
                    value={formData.price_addition}
                    onChange={(e) => setFormData({ ...formData, price_addition: e.target.value })}
                    required
                    className="bg-muted border-border"
                  />
                </div>
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
              </div>
              <div>
                <Label htmlFor="bowl_type">Tipo</Label>
                <Select value={formData.bowl_type} onValueChange={(value) => setFormData({ ...formData, bowl_type: value })}>
                  <SelectTrigger className="bg-muted border-border">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-muted border-border">
                    <SelectItem value="copo">Copo</SelectItem>
                    <SelectItem value="tigela">Tigela</SelectItem>
                    <SelectItem value="barco">Barco</SelectItem>
                    <SelectItem value="especial">Especial</SelectItem>
                  </SelectContent>
                </Select>
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
                  <img src={formData.image_url} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bowls.map((bowl) => (
          <motion.div
            key={bowl.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-4 md:p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                {bowl.image_url ? (
                  <img src={bowl.image_url} alt={bowl.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-foreground/50" />
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => handleEdit(bowl)} className="text-foreground hover:bg-muted">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(bowl.id)} className="text-red-500 hover:bg-red-500/10">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">{bowl.name}</h3>
            <p className="text-muted-foreground text-sm mb-2">{bowl.description}</p>
            <div className="flex justify-between items-center text-sm">
              <span className="text-foreground/70">{bowl.ml}ml</span>
              <span className="text-[#FFC300] font-semibold">
                {bowl.price_addition > 0 ? `+R$ ${bowl.price_addition.toFixed(2)}` : 'Sem custo adicional'}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs ${bowl.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {bowl.is_active ? 'Ativo' : 'Inativo'}
              </span>
              <span className="px-2 py-1 rounded text-xs bg-muted text-foreground/70">
                {bowl.bowl_type}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
        </main>
      </div>
    </div>
  )
}
