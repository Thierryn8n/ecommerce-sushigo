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
import { Topping } from '@/lib/types'
import { AdminSidebar, AdminHeader } from '@/components/admin/admin-layout'

export default function CoberturasPage() {
  const [sauces, setSauces] = useState<Topping[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSauce, setEditingSauce] = useState<Topping | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'cobertura',
    image_url: '',
    is_active: true,
    display_order: '0',
    max_quantity: '2',
    weight_grams: '0',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchSauces()
  }, [])

  const fetchSauces = async () => {
    const { data, error } = await supabase
      .from('toppings')
      .select('*')
      .eq('category', 'cobertura')
      .order('display_order')
    
    if (error) {
      console.error('Erro ao buscar coberturas:', error)
    } else {
      setSauces(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    let imageUrl = formData.image_url
    if (imageFile) {
      const result = await uploadImage(imageFile, 'sauces', 'sauces')
      if (result.url) {
        imageUrl = result.url
      }
    }

    const sauceData = {
      name: formData.name,
      price: parseFloat(formData.price),
      category: 'cobertura',
      image_url: imageUrl || null,
      is_active: formData.is_active,
      display_order: parseInt(formData.display_order),
      max_quantity: parseInt(formData.max_quantity),
      weight_grams: parseInt(formData.weight_grams) || 0,
    }

    if (editingSauce) {
      const { error } = await supabase
        .from('toppings')
        .update(sauceData)
        .eq('id', editingSauce.id)
      
      if (error) console.error('Erro ao atualizar:', error)
    } else {
      const { error } = await supabase
        .from('toppings')
        .insert([sauceData])
      
      if (error) console.error('Erro ao criar:', error)
    }

    setUploading(false)
    setDialogOpen(false)
    resetForm()
    fetchSauces()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta cobertura?')) {
      const { error } = await supabase
        .from('toppings')
        .delete()
        .eq('id', id)
      
      if (error) console.error('Erro ao excluir:', error)
      else fetchSauces()
    }
  }

  const handleEdit = (sauce: Topping) => {
    setEditingSauce(sauce)
    setFormData({
      name: sauce.name,
      price: sauce.price.toString(),
      category: sauce.category || 'cobertura',
      image_url: sauce.image_url || '',
      is_active: sauce.is_active,
      display_order: sauce.display_order.toString(),
      max_quantity: sauce.max_quantity?.toString() || '2',
      weight_grams: sauce.weight_grams?.toString() || '0',
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEditingSauce(null)
    setFormData({
      name: '',
      price: '',
      category: 'cobertura',
      image_url: '',
      is_active: true,
      display_order: '0',
      max_quantity: '2',
      weight_grams: '0',
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
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Gerenciar Coberturas</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setDialogOpen(true) }} className="bg-[#FF8C00] hover:bg-[#FFC300]">
              <Plus className="w-4 h-4 mr-2" />
              Nova Cobertura
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-auto">
            <DialogHeader>
              <DialogTitle>{editingSauce ? 'Editar Cobertura' : 'Nova Cobertura'}</DialogTitle>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="bg-muted border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="max_quantity">Quantidade Máxima</Label>
                  <Input
                    id="max_quantity"
                    type="number"
                    value={formData.max_quantity}
                    onChange={(e) => setFormData({ ...formData, max_quantity: e.target.value })}
                    className="bg-muted border-border"
                  />
                </div>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight_grams">Peso (gramas)</Label>
                  <Input
                    id="weight_grams"
                    type="number"
                    value={formData.weight_grams}
                    onChange={(e) => setFormData({ ...formData, weight_grams: e.target.value })}
                    className="bg-muted border-border"
                    placeholder="Ex: 10"
                  />
                </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sauces.map((sauce) => (
          <motion.div
            key={sauce.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-4 md:p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                {sauce.image_url ? (
                  <img src={sauce.image_url} alt={sauce.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-foreground/50" />
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => handleEdit(sauce)} className="text-foreground hover:bg-muted">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(sauce.id)} className="text-red-500 hover:bg-red-500/10">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">{sauce.name}</h3>
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-[#FFC300] font-semibold">R$ {sauce.price.toFixed(2)}</span>
              <span className="text-foreground/70">Max: {sauce.max_quantity}x | {sauce.weight_grams}g</span>
            </div>
            <div className="mt-2">
              <span className={`px-2 py-1 rounded text-xs ${sauce.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {sauce.is_active ? 'Ativo' : 'Inativo'}
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
