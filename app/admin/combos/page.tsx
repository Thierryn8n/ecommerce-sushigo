'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, AlertCircle, Loader2, Package, Check, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { createClient } from '@/lib/supabase/client'
import type { Combo, Product } from '@/lib/types'

interface ComboWithItems extends Combo {
  items?: { product: Product; quantity: number }[]
}

export default function CombosPage() {
  const supabase = createClient()
  const [combos, setCombos] = useState<ComboWithItems[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCombo, setEditingCombo] = useState<ComboWithItems | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: 0,
    total_pieces: 0,
    is_active: true,
    is_featured: false,
    image_url: '',
    display_order: 0,
    items: [] as { product_id: string; quantity: number }[],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchCombos()
    fetchProducts()
  }, [])

  const fetchCombos = async () => {
    setLoading(true)
    const { data: combosData, error: combosError } = await supabase
      .from('combos')
      .select(`
        *,
        items:combo_items(
          quantity,
          product:products(*)
        )
      `)
      .order('display_order')

    if (!combosError && combosData) {
      setCombos(combosData)
    }
    setLoading(false)
  }

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('id, name, price, is_active')
      .eq('is_active', true)
      .order('name')
    
    if (data) {
      setProducts(data)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug é obrigatório'
    }
    if (formData.price <= 0) {
      newErrors.price = 'Preço deve ser maior que zero'
    }
    if (formData.items.length === 0) {
      newErrors.items = 'Adicione pelo menos um item ao combo'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSaving(true)
    try {
      const comboData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        price: formData.price,
        total_pieces: formData.total_pieces,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        image_url: formData.image_url || null,
        display_order: formData.display_order,
      }

      if (editingCombo) {
        const { error } = await supabase
          .from('combos')
          .update(comboData)
          .eq('id', editingCombo.id)
        
        if (error) throw error

        // Delete existing items
        await supabase
          .from('combo_items')
          .delete()
          .eq('combo_id', editingCombo.id)

        // Insert new items
        const { error: itemsError } = await supabase
          .from('combo_items')
          .insert(
            formData.items.map(item => ({
              combo_id: editingCombo.id,
              product_id: item.product_id,
              quantity: item.quantity,
            }))
          )
        
        if (itemsError) throw itemsError
      } else {
        const { data: newCombo, error } = await supabase
          .from('combos')
          .insert(comboData)
          .select()
          .single()
        
        if (error) throw error

        // Insert items
        const { error: itemsError } = await supabase
          .from('combo_items')
          .insert(
            formData.items.map(item => ({
              combo_id: newCombo.id,
              product_id: item.product_id,
              quantity: item.quantity,
            }))
          )
        
        if (itemsError) throw itemsError
      }
      
      await fetchCombos()
      setIsModalOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving combo:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este combo?')) return

    const { error } = await supabase
      .from('combos')
      .delete()
      .eq('id', id)

    if (!error) {
      await fetchCombos()
    }
  }

  const openModal = (combo?: ComboWithItems) => {
    if (combo) {
      setEditingCombo(combo)
      setFormData({
        name: combo.name,
        slug: combo.slug,
        description: combo.description || '',
        price: combo.price,
        total_pieces: combo.total_pieces || 0,
        is_active: combo.is_active,
        is_featured: combo.is_featured,
        image_url: combo.image_url || '',
        display_order: combo.display_order,
        items: combo.items?.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })) || [],
      })
    } else {
      resetForm()
    }
    setIsModalOpen(true)
    setErrors({})
  }

  const resetForm = () => {
    setEditingCombo(null)
    setFormData({
      name: '',
      slug: '',
      description: '',
      price: 0,
      total_pieces: 0,
      is_active: true,
      is_featured: false,
      image_url: '',
      display_order: 0,
      items: [],
    })
    setErrors({})
  }

  const addItem = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { product_id: productId, quantity: 1 }],
    }))
  }

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  const updateItemQuantity = (index: number, quantity: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, quantity } : item
      ),
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Combos</h1>
          <p className="text-muted-foreground">Gerencie os combos de sushi disponíveis</p>
        </div>
        <Button
          onClick={() => openModal()}
          className="bg-[#D62828] hover:bg-[#D62828]/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Combo
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#D62828]" />
        </div>
      ) : combos.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhum combo cadastrado</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {combos.map((combo) => (
            <motion.div
              key={combo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-lg bg-[#D62828]/10 flex items-center justify-center">
                    {combo.image_url ? (
                      <img src={combo.image_url} alt={combo.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Package className="w-8 h-8 text-[#D62828]" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground flex items-center gap-2">
                      {combo.name}
                      {combo.is_active && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Ativo
                        </span>
                      )}
                      {combo.is_featured && (
                        <span className="text-xs bg-[#D4A017]/20 text-[#D4A017] px-2 py-0.5 rounded-full">
                          Destaque
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">{combo.description}</p>
                    <p className="text-sm font-medium text-[#D62828] mt-1">
                      R$ {combo.price.toFixed(2)} • {combo.total_pieces || combo.items?.reduce((acc, item) => acc + (item.quantity * 8), 0)} peças
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {combo.items?.length || 0} itens
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openModal(combo)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(combo.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background rounded-xl shadow-xl w-full max-w-2xl my-8"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {editingCombo ? 'Editar Combo' : 'Novo Combo'}
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                  <span className="text-xl">&times;</span>
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Combo Família"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Slug *</label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="Ex: combo-familia"
                      className={errors.slug ? 'border-red-500' : ''}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: 50 peças variadas"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Preço *</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className={errors.price ? 'border-red-500' : ''}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Total de Peças</label>
                    <Input
                      type="number"
                      value={formData.total_pieces}
                      onChange={(e) => setFormData({ ...formData, total_pieces: parseInt(e.target.value) || 0 })}
                      placeholder="Ex: 50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ordem</label>
                    <Input
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <span className="text-sm">Ativo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                    />
                    <span className="text-sm">Destaque</span>
                  </div>
                </div>

                {/* Items Section */}
                <div className="border-t border-border pt-4">
                  <h3 className="font-medium mb-3">Itens do Combo</h3>
                  
                  {errors.items && (
                    <p className="text-sm text-red-500 mb-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.items}
                    </p>
                  )}

                  {/* Current Items */}
                  {formData.items.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {formData.items.map((item, index) => {
                        const product = products.find(p => p.id === item.product_id)
                        return (
                          <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                            <span className="text-sm">{product?.name || 'Produto'}</span>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                                className="w-20 h-8"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(index)}
                                className="text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Add Item */}
                  <div className="flex items-center gap-2">
                    <select
                      className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      onChange={(e) => {
                        if (e.target.value) {
                          addItem(e.target.value)
                          e.target.value = ''
                        }
                      }}
                    >
                      <option value="">Adicionar item...</option>
                      {products
                        .filter(p => !formData.items.some(i => i.product_id === p.id))
                        .map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#D62828] hover:bg-[#D62828]/90"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Salvar
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
