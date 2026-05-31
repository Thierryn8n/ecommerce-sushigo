"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, ArrowRight } from 'lucide-react'
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
      <section className="py-12 bg-muted">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-foreground">MAIS PEDIDOS</h2>
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-40 animate-pulse">
                <div className="aspect-square bg-card rounded-xl mb-2" />
                <div className="h-4 bg-card rounded w-3/4 mb-1" />
                <div className="h-3 bg-card rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-muted">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-foreground tracking-wide">MAIS PEDIDOS</h2>
          <Link href="/cardapio">
            <Button variant="outline" className="border-border text-foreground hover:bg-card rounded-lg text-sm gap-2">
              VER CARDAPIO COMPLETO
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="flex-shrink-0 w-40"
            >
              <Link href={`/produto/${product.slug}`}>
                <div className="relative aspect-square bg-card rounded-xl overflow-hidden mb-2 group">
                  <Image
                    src={product.image_url || 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300&q=80'}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
              </Link>
              <h3 className="text-foreground font-bold text-sm mb-0.5 line-clamp-1">{product.name.toUpperCase()}</h3>
              <p className="text-foreground/50 text-xs mb-1">{product.pieces_count} unidades</p>
              <div className="flex items-center justify-between">
                <p className="text-primary font-bold">
                  R$ {Number(product.promotion_price || product.base_price).toFixed(2).replace('.', ',')}
                </p>
                <button
                  onClick={() => handleAddToCart(product)}
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
