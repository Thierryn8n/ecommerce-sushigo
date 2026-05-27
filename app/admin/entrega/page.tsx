"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, MapPin, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { DeliveryArea } from '@/lib/types'
import { AdminSidebar, AdminHeader } from '@/components/admin/admin-layout'

export default function EntregaPage() {
  const [areas, setAreas] = useState<DeliveryArea[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingArea, setEditingArea] = useState<DeliveryArea | null>(null)
  const [formData, setFormData] = useState({
    neighborhood: '',
    delivery_fee: '',
    estimated_time_min: '',
    estimated_time_max: '',
    is_active: true,
  })
  const [uploading, setUploading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchAreas()
  }, [])

  const fetchAreas = async () => {
    const { data, error } = await supabase
      .from('delivery_areas')
      .select('*')
      .order('neighborhood')
    
    if (error) {
      console.error('Erro ao buscar áreas de entrega:', error)
    } else {
      setAreas(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    const areaData = {
      neighborhood: formData.neighborhood,
      delivery_fee: parseFloat(formData.delivery_fee),
      estimated_time_min: formData.estimated_time_min ? parseInt(formData.estimated_time_min) : null,
      estimated_time_max: formData.estimated_time_max ? parseInt(formData.estimated_time_max) : null,
      is_active: formData.is_active,
    }

    if (editingArea) {
      const { error } = await supabase
        .from('delivery_areas')
        .update(areaData)
        .eq('id', editingArea.id)
      
      if (error) console.error('Erro ao atualizar:', error)
    } else {
      const { error } = await supabase
        .from('delivery_areas')
        .insert([areaData])
      
      if (error) console.error('Erro ao criar:', error)
    }

    setUploading(false)
    setDialogOpen(false)
    resetForm()
    fetchAreas()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta área de entrega?')) {
      const { error } = await supabase
        .from('delivery_areas')
        .delete()
        .eq('id', id)
      
      if (error) console.error('Erro ao excluir:', error)
      else fetchAreas()
    }
  }

  const handleEdit = (area: DeliveryArea) => {
    setEditingArea(area)
    setFormData({
      neighborhood: area.neighborhood,
      delivery_fee: area.delivery_fee.toString(),
      estimated_time_min: area.estimated_time_min?.toString() || '',
      estimated_time_max: area.estimated_time_max?.toString() || '',
      is_active: area.is_active,
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEditingArea(null)
    setFormData({
      neighborhood: '',
      delivery_fee: '',
      estimated_time_min: '',
      estimated_time_max: '',
      is_active: true,
    })
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
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Areas de Entrega</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setDialogOpen(true) }} className="bg-[#FF8C00] hover:bg-[#FFC300]">
              <Plus className="w-4 h-4 mr-2" />
              Nova Área
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground max-w-md w-[95vw] sm:w-auto">
            <DialogHeader>
              <DialogTitle>{editingArea ? 'Editar Área' : 'Nova Área de Entrega'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="neighborhood">Bairro/Região</Label>
                <Input
                  id="neighborhood"
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                  required
                  className="bg-muted border-border"
                  placeholder="Canoa Quebrada"
                />
              </div>
              <div>
                <Label htmlFor="delivery_fee">Taxa de Entrega (R$)</Label>
                <Input
                  id="delivery_fee"
                  type="number"
                  step="0.01"
                  value={formData.delivery_fee}
                  onChange={(e) => setFormData({ ...formData, delivery_fee: e.target.value })}
                  required
                  className="bg-muted border-border"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estimated_time_min">Tempo Mín (min)</Label>
                  <Input
                    id="estimated_time_min"
                    type="number"
                    value={formData.estimated_time_min}
                    onChange={(e) => setFormData({ ...formData, estimated_time_min: e.target.value })}
                    className="bg-muted border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="estimated_time_max">Tempo Máx (min)</Label>
                  <Input
                    id="estimated_time_max"
                    type="number"
                    value={formData.estimated_time_max}
                    onChange={(e) => setFormData({ ...formData, estimated_time_max: e.target.value })}
                    className="bg-muted border-border"
                  />
                </div>
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
        {areas.map((area) => (
          <motion.div
            key={area.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-4 md:p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-[#FFC300]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{area.neighborhood}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${area.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {area.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => handleEdit(area)} className="text-foreground hover:bg-muted">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(area.id)} className="text-red-500 hover:bg-red-500/10">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Taxa de entrega:</span>
                <span className="text-[#FFC300] font-bold text-lg">R$ {area.delivery_fee.toFixed(2)}</span>
              </div>
              {area.estimated_time_min && area.estimated_time_max && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {area.estimated_time_min} - {area.estimated_time_max} minutos
                  </span>
                </div>
              )}
              {area.delivery_fee === 0 && (
                <div className="mt-2">
                  <span className="px-3 py-1 bg-[#FF8C00]/20 text-[#FF8C00] rounded-full text-xs font-semibold">
                    Frete Grátis
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
        </main>
      </div>
    </div>
  )
}
