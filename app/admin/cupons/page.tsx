"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { Coupon } from '@/lib/types'
import { AdminSidebar, AdminHeader } from '@/components/admin/admin-layout'

export default function CuponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_value: '0',
    max_uses: '',
    valid_from: '',
    valid_until: '',
    is_active: true,
  })
  const [uploading, setUploading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Erro ao buscar cupons:', error)
    } else {
      setCoupons(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    const couponData = {
      code: formData.code.toUpperCase(),
      description: formData.description || null,
      discount_type: formData.discount_type as 'percentage' | 'fixed',
      discount_value: parseFloat(formData.discount_value),
      min_order_value: parseFloat(formData.min_order_value),
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      valid_from: formData.valid_from || new Date().toISOString(),
      valid_until: formData.valid_until || null,
      is_active: formData.is_active,
    }

    if (editingCoupon) {
      const { error } = await supabase
        .from('coupons')
        .update(couponData)
        .eq('id', editingCoupon.id)
      
      if (error) console.error('Erro ao atualizar:', error)
    } else {
      const { error } = await supabase
        .from('coupons')
        .insert([couponData])
      
      if (error) console.error('Erro ao criar:', error)
    }

    setUploading(false)
    setDialogOpen(false)
    resetForm()
    fetchCoupons()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cupom?')) {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id)
      
      if (error) console.error('Erro ao excluir:', error)
      else fetchCoupons()
    }
  }

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      min_order_value: coupon.min_order_value.toString(),
      max_uses: coupon.max_uses?.toString() || '',
      valid_from: coupon.valid_from ? coupon.valid_from.split('T')[0] : '',
      valid_until: coupon.valid_until ? coupon.valid_until.split('T')[0] : '',
      is_active: coupon.is_active,
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEditingCoupon(null)
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      min_order_value: '0',
      max_uses: '',
      valid_from: '',
      valid_until: '',
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
        <main className="p-4 md:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Gerenciar Cupons</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setDialogOpen(true) }} className="bg-[#FF8C00] hover:bg-[#FFC300]">
              <Plus className="w-4 h-4 mr-2" />
              Novo Cupom
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-auto">
            <DialogHeader>
              <DialogTitle>{editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="code">Código</Label>
                <Input
                  id="code"
                  value={formData.code.toUpperCase()}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                  className="bg-muted border-border"
                  placeholder="BEMVINDO10"
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-muted border-border"
                  placeholder="Desconto de boas-vindas para novos clientes"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount_type">Tipo de Desconto</Label>
                  <Select value={formData.discount_type} onValueChange={(value) => setFormData({ ...formData, discount_type: value })}>
                    <SelectTrigger className="bg-muted border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-muted border-border">
                      <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                      <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="discount_value">Valor do Desconto</Label>
                  <Input
                    id="discount_value"
                    type="number"
                    step="0.01"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    required
                    className="bg-muted border-border"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min_order_value">Valor Mínimo do Pedido (R$)</Label>
                  <Input
                    id="min_order_value"
                    type="number"
                    step="0.01"
                    value={formData.min_order_value}
                    onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value })}
                    className="bg-muted border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="max_uses">Máximo de Usos</Label>
                  <Input
                    id="max_uses"
                    type="number"
                    value={formData.max_uses}
                    onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                    className="bg-muted border-border"
                    placeholder="Deixe vazio para ilimitado"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valid_from">Válido a partir de</Label>
                  <Input
                    id="valid_from"
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                    className="bg-muted border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="valid_until">Válido até</Label>
                  <Input
                    id="valid_until"
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    className="bg-muted border-border"
                    placeholder="Deixe vazio para indefinido"
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
        {coupons.map((coupon) => (
          <motion.div
            key={coupon.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-4 md:p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-[#FFC300] mb-2">{coupon.code}</h3>
                {coupon.description && <p className="text-muted-foreground text-sm mb-2">{coupon.description}</p>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => handleEdit(coupon)} className="text-foreground hover:bg-muted">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(coupon.id)} className="text-red-500 hover:bg-red-500/10">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo:</span>
                <span className="text-foreground font-semibold">
                  {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `R$ ${coupon.discount_value.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mínimo:</span>
                <span className="text-foreground">R$ {coupon.min_order_value.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Usos:</span>
                <span className="text-foreground">
                  {coupon.uses_count} / {coupon.max_uses || '∞'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Válido até:</span>
                <span className="text-foreground">
                  {coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString('pt-BR') : 'Indefinido'}
                </span>
              </div>
            </div>
            <div className="mt-4">
              <span className={`px-3 py-1 rounded-full text-xs ${coupon.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {coupon.is_active ? 'Ativo' : 'Inativo'}
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
