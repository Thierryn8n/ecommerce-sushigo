'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  MapPin, 
  Plus, 
  Home, 
  Briefcase, 
  Star,
  Trash2,
  Edit2,
  X,
  Check,
  Navigation
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'

interface Address {
  id: string
  label: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zip_code?: string
  is_default: boolean
  lat?: number
  lng?: number
}

export default function EnderecosPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    label: 'casa',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: 'CE',
    zip_code: '',
    is_default: false
  })

  useEffect(() => {
    fetchAddresses()
  }, [])

  async function fetchAddresses() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })

      if (error) throw error
      setAddresses(data || [])
    } catch (error) {
      console.error('Erro ao buscar enderecos:', error)
      toast({ title: 'Erro ao carregar enderecos', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const addressData = {
        ...formData,
        user_id: user.id
      }

      if (editingId) {
        const { error } = await supabase
          .from('addresses')
          .update(addressData)
          .eq('id', editingId)

        if (error) throw error
        toast({ title: 'Endereco atualizado com sucesso!' })
      } else {
        const { error } = await supabase
          .from('addresses')
          .insert(addressData)

        if (error) throw error
        toast({ title: 'Endereco adicionado com sucesso!' })
      }

      resetForm()
      fetchAddresses()
    } catch (error) {
      console.error('Erro ao salvar endereco:', error)
      toast({ title: 'Erro ao salvar endereco', variant: 'destructive' })
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este endereco?')) return

    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast({ title: 'Endereco removido!' })
      fetchAddresses()
    } catch (error) {
      console.error('Erro ao excluir:', error)
      toast({ title: 'Erro ao excluir endereco', variant: 'destructive' })
    }
  }

  async function setAsDefault(id: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id)

      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', id)

      if (error) throw error
      toast({ title: 'Endereco padrao atualizado!' })
      fetchAddresses()
    } catch (error) {
      console.error('Erro ao definir padrao:', error)
      toast({ title: 'Erro ao atualizar', variant: 'destructive' })
    }
  }

  function startEditing(address: Address) {
    setEditingId(address.id)
    setFormData({
      label: address.label,
      street: address.street,
      number: address.number,
      complement: address.complement || '',
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      zip_code: address.zip_code || '',
      is_default: address.is_default
    })
    setIsAdding(true)
  }

  function resetForm() {
    setFormData({
      label: 'casa',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: 'CE',
      zip_code: '',
      is_default: false
    })
    setEditingId(null)
    setIsAdding(false)
  }

  function getAddressIcon(label: string) {
    switch (label) {
      case 'casa': return Home
      case 'trabalho': return Briefcase
      default: return MapPin
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">Meus Enderecos</h1>
          <p className="text-slate-500 dark:text-slate-400">Gerencie seus enderecos de entrega</p>
        </div>
        
        <Button
          onClick={() => setIsAdding(true)}
          className="bg-violet-500 hover:bg-violet-600 text-white w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Endereco
        </Button>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-6 border border-violet-200 dark:border-violet-500/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
                {editingId ? 'Editar Endereco' : 'Adicionar Novo Endereco'}
              </h2>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Label */}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300">Tipo</Label>
                  <div className="flex gap-2">
                    {[
                      { value: 'casa', label: 'Casa', icon: Home },
                      { value: 'trabalho', label: 'Trabalho', icon: Briefcase },
                      { value: 'outro', label: 'Outro', icon: MapPin }
                    ].map((option) => {
                      const Icon = option.icon
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, label: option.value })}
                          className={`
                            flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-all text-sm
                            ${formData.label === option.value
                              ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400'
                              : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                            }
                          `}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="hidden sm:inline">{option.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* CEP */}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300">CEP</Label>
                  <Input
                    value={formData.zip_code}
                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                    placeholder="00000-000"
                    className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Street */}
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300">Rua/Avenida</Label>
                  <Input
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    placeholder="Nome da rua"
                    required
                    className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Number & Complement */}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300">Numero</Label>
                  <Input
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    placeholder="123"
                    required
                    className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300">Complemento</Label>
                  <Input
                    value={formData.complement}
                    onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                    placeholder="Apto 101, Bloco B"
                    className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Neighborhood */}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300">Bairro</Label>
                  <Input
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    placeholder="Bairro"
                    required
                    className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                {/* City & State */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">Cidade</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Cidade"
                      required
                      className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">Estado</Label>
                    <Input
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="UF"
                      maxLength={2}
                      required
                      className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white uppercase"
                    />
                  </div>
                </div>

                {/* Default Checkbox */}
                <div className="md:col-span-2 flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <input
                    type="checkbox"
                    id="is_default"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-violet-500 focus:ring-violet-500"
                  />
                  <Label htmlFor="is_default" className="text-slate-700 dark:text-slate-300 cursor-pointer">
                    Definir como endereco padrao
                  </Label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="flex-1 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-violet-500 hover:bg-violet-600 text-white"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {editingId ? 'Salvar' : 'Adicionar'}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Addresses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((address) => {
          const AddressIcon = getAddressIcon(address.label)
          
          return (
            <motion.div
              key={address.id}
              layout
              className={`
                bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border transition-all
                ${address.is_default 
                  ? 'border-violet-300 dark:border-violet-500/40 shadow-lg shadow-violet-500/10' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`
                    p-2 rounded-lg flex-shrink-0
                    ${address.is_default ? 'bg-violet-100 dark:bg-violet-500/20' : 'bg-slate-100 dark:bg-slate-800'}
                  `}>
                    <AddressIcon className={`w-5 h-5 ${address.is_default ? 'text-violet-500' : 'text-slate-500'}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-900 dark:text-white font-medium capitalize flex items-center gap-2 flex-wrap">
                      {address.label}
                      {address.is_default && (
                        <span className="text-xs bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full">
                          Padrao
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{address.street}, {address.number}</p>
                    {address.complement && (
                      <p className="text-xs text-slate-500 truncate">{address.complement}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      {address.neighborhood}, {address.city} - {address.state}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-1 ml-2">
                  {!address.is_default && (
                    <button
                      onClick={() => setAsDefault(address.id)}
                      className="p-2 text-slate-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-lg transition-colors"
                      title="Definir como padrao"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => startEditing(address)}
                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Empty State */}
      {addresses.length === 0 && !isAdding && (
        <div className="text-center py-12 sm:py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <MapPin className="w-12 sm:w-16 h-12 sm:h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-2">Nenhum endereco cadastrado</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 px-4">Adicione um endereco para facilitar seus pedidos</p>
          <Button 
            onClick={() => setIsAdding(true)}
            className="bg-violet-500 hover:bg-violet-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Endereco
          </Button>
        </div>
      )}

      {/* Quick Tip */}
      <div className="bg-gradient-to-r from-violet-50 to-transparent dark:from-violet-500/10 dark:to-transparent border border-violet-200 dark:border-violet-500/20 rounded-lg p-4 flex items-center gap-3">
        <Navigation className="w-5 h-5 text-violet-500 flex-shrink-0" />
        <p className="text-sm text-slate-600 dark:text-slate-300">
          <span className="text-violet-600 dark:text-violet-400 font-medium">Dica:</span> Defina um endereco como padrao para agilizar suas compras!
        </p>
      </div>
    </div>
  )
}
