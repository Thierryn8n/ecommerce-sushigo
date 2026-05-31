"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Plus, Search, Edit, Edit2, Trash2, Eye, EyeOff, Copy } from 'lucide-react'
import { AdminSidebar, AdminHeader } from '@/components/admin/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import ProductModal from './product-modal'

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  image_url: string | null
  banner_url: string | null
  is_active: boolean
  is_featured: boolean
  is_promotion: boolean
  is_combo: boolean
  base_pieces: number
  allow_quantity_change: boolean
  molhos_included: boolean
  display_order: number
  category_id: string | null
  category: { name: string; slug: string; color: string | null } | null
  variants?: { id: string; variant_name: string; price: number; quantity_value: number; is_default: boolean }[]
}

// Helper para formatar preço de forma segura
const formatPrice = (price: any): string => {
  if (price === null || price === undefined || price === '') {
    return '0,00'
  }
  const num = typeof price === 'string' ? parseFloat(price) : Number(price)
  if (isNaN(num)) {
    return '0,00'
  }
  return num.toFixed(2).replace('.', ',')
}

export default function AdminProdutos() {
  const [searchTerm, setSearchTerm] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const openModal = (product?: Product) => {
    setSelectedProduct(product || null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  const handleSaveProduct = (savedProduct: any) => {
    if (selectedProduct) {
      // Atualizar produto existente na lista
      setProducts(prev => prev.map(p => 
        p.id === savedProduct.id ? { ...p, ...savedProduct } : p
      ))
    } else {
      // Adicionar novo produto à lista
      setProducts(prev => [savedProduct, ...prev])
    }
  }

  const duplicateProduct = async (product: Product) => {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: `${product.name} (Cópia)`,
        slug: `${product.slug}-copia-${Date.now()}`,
        description: product.description,
        price: product.price,
        image_url: product.image_url,
        is_active: false,
        is_featured: product.is_featured,
        is_promotion: product.is_promotion,
        is_combo: product.is_combo,
        base_pieces: product.base_pieces,
        allow_quantity_change: product.allow_quantity_change,
        molhos_included: product.molhos_included,
        category_id: product.category_id,
        display_order: product.display_order,
      })
      .select('*, category:categories(name, slug, color), variants:product_variants(*)')
      .single()

    if (!error && data) {
      setProducts(prev => [data, ...prev])
    }
  }

  useEffect(() => {
    async function fetchProducts() {
      const supabase = createClient()
      
      const { data } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name, slug, color),
          variants:product_variants(*)
        `)
        .order('display_order')

      if (data) {
        setProducts(data)
      }
      setLoading(false)
    }

    fetchProducts()
  }, [])

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('products')
      .update({ is_active: !currentStatus })
      .eq('id', productId)

    if (!error) {
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, is_active: !currentStatus } : p
      ))
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return

    const supabase = createClient()
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (!error) {
      setProducts(prev => prev.filter(p => p.id !== productId))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="lg:ml-56">
        <AdminHeader />
        
        <main className="p-3 sm:p-6 pb-20 lg:pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Produtos</h1>
              <Button 
                onClick={() => openModal()}
                className="bg-[#D62828] hover:bg-[#FFC300] text-foreground w-full sm:w-auto"
              >
                <Plus className="w-5 h-5 mr-2" />
                Novo Produto
              </Button>
            </div>

            {/* Search */}
            <div className="bg-card rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-border mb-4 sm:mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-foreground/50" />
                <Input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 sm:pl-10 bg-muted border-border text-foreground text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Products - Mobile Cards / Desktop Table */}
            <div className="block sm:hidden space-y-3">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="bg-card rounded-xl p-4 border border-border animate-pulse">
                    <div className="flex gap-3">
                      <div className="w-16 h-16 bg-muted rounded-lg" />
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    className="bg-card rounded-xl p-4 border border-border"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        <Image
                          src={product.image_url || 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20a%C3%A7a%C3%AD%20da%20praia%20sem%20fundo-f7nqFBR8xSzITFhI7km23gMgUdIh6o.png'}
                          alt={product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-foreground font-medium text-sm truncate">{product.name}</p>
                            <span 
                              className="inline-block px-2 py-0.5 rounded-full text-[10px] mt-1"
                              style={{ 
                                backgroundColor: product.category?.color ? `${product.category.color}20` : '#D6282820',
                                color: product.category?.color || '#D62828'
                              }}
                            >
                              {product.category?.name || 'Sem categoria'}
                            </span>
                          </div>
                          <button
                            onClick={() => toggleProductStatus(product.id, product.is_active)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              product.is_active ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
                            }`}
                          >
                            {product.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-foreground/70 text-sm">{product.base_pieces} peças</span>
                          <div className="flex gap-1">
                            <button onClick={() => openModal(product)} className="p-1.5 rounded-lg hover:bg-muted text-foreground/60">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteProduct(product.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block bg-card rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-left text-foreground/60 text-sm font-medium px-6 py-4">Produto</th>
                      <th className="text-left text-foreground/60 text-sm font-medium px-6 py-4">Categoria</th>
                      <th className="text-left text-foreground/60 text-sm font-medium px-6 py-4">Peso</th>
                      <th className="text-left text-foreground/60 text-sm font-medium px-6 py-4">Status</th>
                      <th className="text-right text-foreground/60 text-sm font-medium px-6 py-4">Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="border-t border-border">
                          <td className="px-6 py-4" colSpan={5}>
                            <div className="animate-pulse flex items-center gap-4">
                              <div className="w-12 h-12 bg-muted rounded-lg"></div>
                              <div className="flex-1">
                                <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                                <div className="h-3 bg-muted rounded w-48"></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      filteredProducts.map((product) => (
                        <tr key={product.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden">
                                <Image
                                  src={product.image_url || 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20a%C3%A7a%C3%AD%20da%20praia%20sem%20fundo-f7nqFBR8xSzITFhI7km23gMgUdIh6o.png'}
                                  alt={product.name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div>
                                <p className="text-foreground font-medium">{product.name}</p>
                                <p className="text-foreground/50 text-sm truncate max-w-[200px]">{product.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span 
                              className="px-3 py-1 rounded-full text-sm"
                              style={{ 
                                backgroundColor: product.category?.color ? `${product.category.color}20` : '#D6282820',
                                color: product.category?.color || '#D62828'
                              }}
                            >
                              {product.category?.name || 'Sem categoria'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-foreground font-medium">{product.base_pieces} peças</p>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => toggleProductStatus(product.id, product.is_active)}
                              className="cursor-pointer"
                            >
                              {product.is_active ? (
                                <span className="flex items-center gap-2 text-green-400">
                                  <Eye className="w-4 h-4" />
                                  Ativo
                                </span>
                              ) : (
                                <span className="flex items-center gap-2 text-red-400">
                                  <EyeOff className="w-4 h-4" />
                                  Inativo
                                </span>
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => openModal(product)}
                                className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-foreground/70 hover:text-[#D62828] transition-colors"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => duplicateProduct(product)}
                                className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-foreground/70 hover:text-[#00BFFF] transition-colors"
                                title="Duplicar"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => deleteProduct(product.id)}
                                className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-foreground/70 hover:text-red-400 transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {!loading && filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-foreground/60">Nenhum produto encontrado</p>
                </div>
              )}
            </div>

            {/* Modal */}
            <ProductModal
              isOpen={isModalOpen}
              onClose={closeModal}
              product={selectedProduct}
              onSave={handleSaveProduct}
            />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
