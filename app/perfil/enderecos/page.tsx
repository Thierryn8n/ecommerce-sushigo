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
      console.error('Erro ao buscar endereços:', error)
      toast({ title: 'Erro ao carregar endereços', variant: 'destructive' })
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
        // Update existing
        const { error } = await supabase
          .from('addresses')
          .update(addressData)
          .eq('id', editingId)

        if (error) throw error
        toast({ title: 'Endereço atualizado com sucesso!' })
      } else {
        // Create new
        const { error } = await supabase
          .from('addresses')
          .insert(addressData)

        if (error) throw error
        toast({ title: 'Endereço adicionado com sucesso!' })
      }

      resetForm()
      fetchAddresses()
    } catch (error) {
      console.error('Erro ao salvar endereço:', error)
      toast({ title: 'Erro ao salvar endereço', variant: 'destructive' })
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este endereço?')) return

    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast({ title: 'Endereço removido!' })
      fetchAddresses()
    } catch (error) {
      console.error('Erro ao excluir:', error)
      toast({ title: 'Erro ao excluir endereço', variant: 'destructive' })
    }
  }

  async function setAsDefault(id: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Remove default from all addresses
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id)

      // Set new default
      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', id)

      if (error) throw error
      toast({ title: 'Endereço padrão atualizado!' })
      fetchAddresses()
    } catch (error) {
      console.error('Erro ao definir padrão:', error)
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF8C00]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Meus Endereços</h1>
          <p className="text-gray-400">Gerencie seus endereços de entrega</p>
        </div>
        
        <Button
          onClick={() => setIsAdding(true)}
          className="bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Endereço
        </Button>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-[#1a1a1a] rounded-xl p-6 border border-[#FF8C00]/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                {editingId ? 'Editar Endereço' : 'Adicionar Novo Endereço'}
              </h2>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Label */}
                <div className="space-y-2">
                  <Label className="text-gray-300">Tipo</Label>
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
                            flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-all
                            ${formData.label === option.value
                              ? 'border-[#FF8C00] bg-[#FF8C00]/10 text-[#FF8C00]'
                              : 'border-white/10 text-gray-400 hover:border-white/20'
                            }
                          `}
                        >
                          <Icon className="w-4 h-4" />
                          {option.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* CEP */}
                <div className="space-y-2">
                  <Label className="text-gray-300">CEP</Label>
                  <Input
                    value={formData.zip_code}
                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                    placeholder="00000-000"
                    className="bg-[#0f0f0f] border-white/10 text-white"
                  />
                </div>

                {/* Street */}
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-gray-300">Rua/Avenida</Label>
                  <Input
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    placeholder="Nome da rua"
                    required
                    className="bg-[#0f0f0f] border-white/10 text-white"
                  />
                </div>

                {/* Number & Complement */}
                <div className="space-y-2">
                  <Label className="text-gray-300">Número</Label>
                  <Input
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    placeholder="123"
                    required
                    className="bg-[#0f0f0f] border-white/10 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Complemento</Label>
                  <Input
                    value={formData.complement}
                    onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                    placeholder="Apto 101, Bloco B"
                    className="bg-[#0f0f0f] border-white/10 text-white"
                  />
                </div>

                {/* Neighborhood */}
                <div className="space-y-2">
                  <Label className="text-gray-300">Bairro</Label>
                  <Input
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    placeholder="Bairro"
                    required
                    className="bg-[#0f0f0f] border-white/10 text-white"
                  />
                </div>

                {/* City & State */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Cidade</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Cidade"
                      required
                      className="bg-[#0f0f0f] border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Estado</Label>
                    <Input
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="UF"
                      maxLength={2}
                      required
                      className="bg-[#0f0f0f] border-white/10 text-white uppercase"
                    />
                  </div>
                </div>

                {/* Default Checkbox */}
                <div className="md:col-span-2 flex items-center gap-3 p-4 bg-[#0f0f0f] rounded-lg">
                  <input
                    type="checkbox"
                    id="is_default"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-[#1a1a1a] text-[#FF8C00] focus:ring-[#FF8C00]"
                  />
                  <Label htmlFor="is_default" className="text-gray-300 cursor-pointer">
                    Definir como endereço padrão
                  </Label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="flex-1 border-white/10 text-gray-300 hover:bg-white/5"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-white"
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
                bg-[#1a1a1a] rounded-xl p-5 border transition-all
                ${address.is_default 
                  ? 'border-[#FF8C00]/40 shadow-lg shadow-[#FF8C00]/10' 
                  : 'border-white/10 hover:border-white/20'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`
                    p-2 rounded-lg
                    ${address.is_default ? 'bg-[#FF8C00]/20' : 'bg-[#0f0f0f]'}
                  `}>
                    <AddressIcon className={`w-5 h-5 ${address.is_default ? 'text-[#FF8C00]' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <p className="text-white font-medium capitalize flex items-center gap-2">
                      {address.label}
                      {address.is_default && (
                        <span className="text-xs bg-[#FF8C00]/20 text-[#FF8C00] px-2 py-0.5 rounded-full">
                          Padrão
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-400">{address.street}, {address.number}</p>
                    {address.complement && (
                      <p className="text-xs text-gray-500">{address.complement}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {address.neighborhood}, {address.city} - {address.state}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {!address.is_default && (
                    <button
                      onClick={() => setAsDefault(address.id)}
                      className="p-2 text-gray-400 hover:text-[#FF8C00] hover:bg-[#FF8C00]/10 rounded-lg transition-colors"
                      title="Definir como padrão"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => startEditing(address)}
                    className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
        <div className="text-center py-16 bg-[#1a1a1a] rounded-xl border border-white/10">
          <MapPin className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Nenhum endereço cadastrado</h3>
          <p className="text-gray-400 mb-6">Adicione um endereço para facilitar seus pedidos</p>
          <Button 
            onClick={() => setIsAdding(true)}
            className="bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Endereço
          </Button>
        </div>
      )}

      {/* Quick Tip */}
      <div className="bg-gradient-to-r from-[#FF8C00]/10 to-transparent border border-[#FF8C00]/20 rounded-lg p-4 flex items-center gap-3">
        <Navigation className="w-5 h-5 text-[#FF8C00]" />
        <p className="text-sm text-gray-300">
          <span className="text-[#FF8C00] font-medium">Dica:</span> Defina um endereço como padrão para agilizar suas compras!
        </p>
      </div>
    </div>
  )
}
