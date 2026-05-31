"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/contexts/cart-context'

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  base_price: number
  promotion_price: number | null
  image_url: string | null
  pieces_count: number
}

export function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  useEffect(() => {
    async function fetchProducts() {
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('display_order')
        .limit(5)

      if (data) setProducts(data)
      setLoading(false)
    }
    fetchProducts()
  }, [])

  // Dados de exemplo para quando nao houver produtos no banco
  const defaultProducts = [
    { id: '1', name: 'HOT ROLL SALMAO', pieces_count: 10, base_price: 24.90, image_url: '/images/hot-roll-salmao.png', slug: 'hot-roll-salmao' },
    { id: '2', name: 'URAMAKI FILADELFIA', pieces_count: 8, base_price: 22.90, image_url: '/images/uramaki-filadelfia.png', slug: 'uramaki-filadelfia' },
    { id: '3', name: 'SASHIMI SALMAO', pieces_count: 10, base_price: 29.90, image_url: '/images/sashimi-salmao.png', slug: 'sashimi-salmao' },
    { id: '4', name: 'NIGUIRI SALMAO', pieces_count: 2, base_price: 10.90, image_url: '/images/nigiri-salmao.png', slug: 'niguiri-salmao' },
    { id: '5', name: 'JOE SALMAO', pieces_count: 2, base_price: 12.90, image_url: '/images/joe-salmao.png', slug: 'joe-salmao' },
  ]

  const displayProducts = products.length > 0 ? products : defaultProducts

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.promotion_price || product.base_price,
      quantity: 1,
      image: product.image_url || '',
    })
  }

  if (loading) {
    return (
      <section className="py-14 bg-[#1A1A1A]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-xl font-black text-foreground">MAIS PEDIDOS</h2>
            <div className="h-10 w-44 bg-[#2A2A2A] rounded animate-pulse" />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-36 md:w-44 animate-pulse">
                <div className="aspect-square bg-[#2A2A2A] rounded-xl mb-3" />
                <div className="h-4 bg-[#2A2A2A] rounded w-3/4 mb-1" />
                <div className="h-3 bg-[#2A2A2A] rounded w-1/2 mb-2" />
                <div className="h-5 bg-[#2A2A2A] rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-14 bg-[#1A1A1A]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-xl md:text-2xl font-black text-foreground">MAIS PEDIDOS</h2>
          <Link href="/cardapio">
            <Button 
              variant="outline" 
              className="border-[#2A2A2A] bg-transparent text-foreground hover:bg-[#2A2A2A] hover:border-primary rounded-md text-xs md:text-sm px-4 md:px-6"
            >
              VER CARDAPIO COMPLETO
            </Button>
          </Link>
        </div>

        <div className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
          {displayProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="flex-shrink-0 w-36 md:w-44"
            >
              <Link href={`/produto/${product.slug}`}>
                <div className="relative aspect-square bg-[#2A2A2A] rounded-xl overflow-hidden mb-3 group">
                  <Image
                    src={product.image_url || 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300&q=80'}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>
              <h3 className="text-foreground font-bold text-xs md:text-sm mb-0.5 line-clamp-1">{product.name}</h3>
              <p className="text-foreground/50 text-xs mb-2">{product.pieces_count} unidades</p>
              <div className="flex items-center justify-between">
                <p className="text-primary font-bold text-sm md:text-base">
                  R$ {Number(product.promotion_price || product.base_price).toFixed(2).replace('.', ',')}
                </p>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    handleAddToCart(product as Product)
                  }}
                  className="w-8 h-8 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center text-primary-foreground transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
