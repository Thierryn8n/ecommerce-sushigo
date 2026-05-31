"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X, Upload, Loader2, Check, AlertCircle, ImageIcon, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

interface Category {
  id: string
  name: string
  slug: string
}

interface Product {
  id?: string
  name: string
  slug: string
  description: string | null
  base_weight_grams: number
  image_url: string | null
  banner_url: string | null
  is_active: boolean
  is_featured: boolean
  is_promotion: boolean
  display_order: number
  category_id: string | null
}

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  product?: Product | null
  onSave: (product: Product) => void
}

export default function ProductModal({ isOpen, onClose, product, onSave }: ProductModalProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const imageInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<Product>({
    name: '',
    slug: '',
    description: '',
    base_weight_grams: 200,
    image_url: null,
    banner_url: null,
    is_active: true,
    is_featured: false,
    is_promotion: false,
    display_order: 0,
    category_id: null,
  })

  // Buscar categorias ao abrir
  useEffect(() => {
    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen])

  // Preencher formulário se estiver editando
  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        description: product.description || '',
      })
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        base_weight_grams: 200,
        image_url: null,
        banner_url: null,
        is_active: true,
        is_featured: false,
        is_promotion: false,
        display_order: 0,
        category_id: null,
      })
    }
    setErrors({})
  }, [product, isOpen])

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('display_order')
    
    if (data) {
      setCategories(data)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug é obrigatório'
    }
    if (!formData.category_id) {
      newErrors.category_id = 'Categoria é obrigatória'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)

    try {
      let result

      if (product?.id) {
        // Atualizar produto existente
        const { data, error } = await supabase
          .from('products')
          .update({
            name: formData.name,
            slug: formData.slug,
            description: formData.description || null,
            base_weight_grams: formData.base_weight_grams,
            image_url: formData.image_url,
            banner_url: formData.banner_url,
            is_active: formData.is_active,
            is_featured: formData.is_featured,
            is_promotion: formData.is_promotion,
            display_order: formData.display_order,
            category_id: formData.category_id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', product.id)
          .select()
          .single()

        if (error) throw error
        result = data
      } else {
        // Criar novo produto
        const { data, error } = await supabase
          .from('products')
          .insert({
            name: formData.name,
            slug: formData.slug,
            description: formData.description || null,
            base_weight_grams: formData.base_weight_grams,
            image_url: formData.image_url,
            banner_url: formData.banner_url,
            is_active: formData.is_active,
            is_featured: formData.is_featured,
            is_promotion: formData.is_promotion,
            display_order: formData.display_order,
            category_id: formData.category_id,
          })
          .select()
          .single()

        if (error) throw error
        result = data
      }

      onSave(result)
      onClose()
    } catch (error: any) {
      console.error('Erro ao salvar produto:', error)
      alert('Erro ao salvar produto: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'banner') => {
    const file = e.target.files?.[0]
    if (!file) return

    const setUploading = type === 'image' ? setUploadingImage : setUploadingBanner
    setUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${type}.${fileExt}`
      const filePath = fileName

      console.log(`📤 Enviando ${type} para products/${filePath}`)

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file, {
          upsert: true,
          cacheControl: '3600',
        })

      if (uploadError) {
        console.error('❌ Erro no upload:', uploadError)
        throw new Error(uploadError.message)
      }

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

      console.log('✅ Upload concluído:', publicUrl)

      setFormData(prev => ({
        ...prev,
        [type === 'image' ? 'image_url' : 'banner_url']: publicUrl,
      }))
    } catch (error: any) {
      console.error('❌ Erro:', error)
      alert('Erro ao fazer upload: ' + error.message)
    } finally {
      setUploading(false)
      // Limpar input
      if (type === 'image' && imageInputRef.current) {
        imageInputRef.current.value = ''
      } else if (type === 'banner' && bannerInputRef.current) {
        bannerInputRef.current.value = ''
      }
    }
  }

  const removeImage = (type: 'image' | 'banner') => {
    setFormData(prev => ({
      ...prev,
      [type === 'image' ? 'image_url' : 'banner_url']: null,
    }))
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-[#1a0a25] rounded-2xl border border-[#3a2a45] w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#3a2a45]">
            <h2 className="text-xl font-bold text-white">
              {product?.id ? 'Editar Produto' : 'Novo Produto'}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[#2a1a35] flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Imagens */}
            <div className="grid grid-cols-2 gap-4">
              {/* Imagem Principal */}
              <div>
                <label className="text-white/70 text-sm mb-2 block">Imagem Principal</label>
                <div className="relative aspect-square rounded-xl bg-[#2a1a35] border border-[#3a2a45] overflow-hidden">
                  {formData.image_url ? (
                    <>
                      <Image
                        src={formData.image_url}
                        alt="Preview"
                        fill
                        className="object-contain p-2"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage('image')}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white/40">
                      <ImageIcon className="w-8 h-8 mb-1" />
                      <span className="text-xs">Sem imagem</span>
                    </div>
                  )}
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-[#1a0a25]/80 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-[#FF8C00] animate-spin" />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'image')}
                  ref={imageInputRef}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="mt-2 w-full border-[#3a2a45] text-white/70 hover:bg-[#2a1a35]"
                >
                  {uploadingImage ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  {formData.image_url ? 'Trocar' : 'Enviar'}
                </Button>
              </div>

              {/* Banner */}
              <div>
                <label className="text-white/70 text-sm mb-2 block">Banner (Opcional)</label>
                <div className="relative aspect-square rounded-xl bg-[#2a1a35] border border-[#3a2a45] overflow-hidden">
                  {formData.banner_url ? (
                    <>
                      <Image
                        src={formData.banner_url}
                        alt="Banner"
                        fill
                        className="object-contain p-2"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage('banner')}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white/40">
                      <ImageIcon className="w-8 h-8 mb-1" />
                      <span className="text-xs">Sem banner</span>
                    </div>
                  )}
                  {uploadingBanner && (
                    <div className="absolute inset-0 bg-[#1a0a25]/80 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-[#FF8C00] animate-spin" />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'banner')}
                  ref={bannerInputRef}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => bannerInputRef.current?.click()}
                  disabled={uploadingBanner}
                  className="mt-2 w-full border-[#3a2a45] text-white/70 hover:bg-[#2a1a35]"
                >
                  {uploadingBanner ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  {formData.banner_url ? 'Trocar' : 'Enviar'}
                </Button>
              </div>
            </div>

            {/* Nome e Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 text-sm mb-2 block">Nome *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: Açaí 500g"
                  className="bg-[#2a1a35] border-[#3a2a45] text-white"
                />
                {errors.name && (
                  <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="text-white/70 text-sm mb-2 block">Slug *</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="acai-500g"
                  className="bg-[#2a1a35] border-[#3a2a45] text-white"
                />
                {errors.slug && (
                  <p className="text-red-400 text-xs mt-1">{errors.slug}</p>
                )}
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label className="text-white/70 text-sm mb-2 block">Descrição</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do produto..."
                rows={3}
                className="w-full px-3 py-2 bg-[#2a1a35] border border-[#3a2a45] rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
              />
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">Peso Base (g)</label>
              <Input
                type="number"
                min="0"
                value={formData.base_weight_grams}
                onChange={(e) => setFormData({ ...formData, base_weight_grams: parseInt(e.target.value) || 0 })}
                placeholder="200"
                className="bg-[#2a1a35] border-[#3a2a45] text-white"
              />
            </div>

            {/* Categoria e Ordem */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 text-sm mb-2 block">Categoria *</label>
                <select
                  value={formData.category_id || ''}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value || null })}
                  className="w-full px-3 py-2 bg-[#2a1a35] border border-[#3a2a45] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
                >
                  <option value="">Selecione...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <p className="text-red-400 text-xs mt-1">{errors.category_id}</p>
                )}
              </div>

              <div>
                <label className="text-white/70 text-sm mb-2 block">Ordem de Exibição</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="bg-[#2a1a35] border-[#3a2a45] text-white"
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-[#3a2a45] bg-[#2a1a35] text-[#FF8C00] focus:ring-[#FF8C00]"
                />
                <span className="text-white text-sm">Ativo</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-4 h-4 rounded border-[#3a2a45] bg-[#2a1a35] text-[#FF8C00] focus:ring-[#FF8C00]"
                />
                <span className="text-white text-sm">Destaque</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_promotion}
                  onChange={(e) => setFormData({ ...formData, is_promotion: e.target.checked })}
                  className="w-4 h-4 rounded border-[#3a2a45] bg-[#2a1a35] text-[#FF8C00] focus:ring-[#FF8C00]"
                />
                <span className="text-white text-sm">Promoção</span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[#3a2a45]">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="border-[#3a2a45] text-white/70 hover:bg-[#2a1a35]"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#FF8C00] hover:bg-[#FFC300] text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {product?.id ? 'Salvar' : 'Criar'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
