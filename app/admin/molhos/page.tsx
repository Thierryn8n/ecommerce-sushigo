'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, AlertCircle, Loader2, Droplets, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { createClient } from '@/lib/supabase/client'
import type { Sauce } from '@/lib/types'

export default function MolhosPage() {
  const supabase = createClient()
  const [sauces, setSauces] = useState<Sauce[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSauce, setEditingSauce] = useState<Sauce | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
    display_order: 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchSauces()
  }, [])

  const fetchSauces = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('sauces')
      .select('*')
      .order('display_order')

    if (!error && data) {
      setSauces(data)
    }
    setLoading(false)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSaving(true)
    try {
      if (editingSauce) {
        const { error } = await supabase
          .from('sauces')
          .update(formData)
          .eq('id', editingSauce.id)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('sauces')
          .insert(formData)
        
        if (error) throw error
      }
      
      await fetchSauces()
      setIsModalOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving sauce:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este molho?')) return

    const { error } = await supabase
      .from('sauces')
      .delete()
      .eq('id', id)

    if (!error) {
      await fetchSauces()
    }
  }

  const openModal = (sauce?: Sauce) => {
    if (sauce) {
      setEditingSauce(sauce)
      setFormData({
        name: sauce.name,
        description: sauce.description || '',
        is_active: sauce.is_active,
        display_order: sauce.display_order,
      })
    } else {
      resetForm()
    }
    setIsModalOpen(true)
    setErrors({})
  }

  const resetForm = () => {
    setEditingSauce(null)
    setFormData({
      name: '',
      description: '',
      is_active: true,
      display_order: 0,
    })
    setErrors({})
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Molhos</h1>
          <p className="text-muted-foreground">Gerencie os molhos disponíveis (shoyu, wasabi, gengibre)</p>
        </div>
        <Button
          onClick={() => openModal()}
          className="bg-[#D62828] hover:bg-[#D62828]/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Molho
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#D62828]" />
        </div>
      ) : sauces.length === 0 ? (
        <div className="text-center py-12">
          <Droplets className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhum molho cadastrado</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sauces.map((sauce) => (
            <motion.div
              key={sauce.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#D62828]/10 flex items-center justify-center">
                  <Droplets className="w-6 h-6 text-[#D62828]" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground flex items-center gap-2">
                    {sauce.name}
                    {sauce.is_active && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Ativo
                      </span>
                    )}
                  </h3>
                  {sauce.description && (
                    <p className="text-sm text-muted-foreground">{sauce.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Ordem: {sauce.display_order}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openModal(sauce)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(sauce.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {editingSauce ? 'Editar Molho' : 'Novo Molho'}
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                  <span className="text-xl">&times;</span>
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Shoyu"
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
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: Molho de soja tradicional"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Ordem</label>
                    <Input
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                      <span className="text-sm">Ativo</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
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
