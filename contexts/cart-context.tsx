"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export interface CartItem {
  id: string
  productId: string
  name: string
  image: string
  totalPrice: number
  quantity: number
  size?: string
  sizeML?: number
  acaiType?: string
  toppings: Array<{ name: string; price: number }>
  sauces: Array<{ name: string; price: number }>
  notes?: string
  weightGrams?: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('acai-cart')
    if (saved) {
      setItems(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('acai-cart', JSON.stringify(items))
  }, [items])

  const addItem = (item: CartItem) => {
    setItems(prev => [...prev, { ...item, id: crypto.randomUUID() }])
    setIsOpen(true)
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity } : item
    ))
  }

  const clearCart = () => {
    setItems([])
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + (item.totalPrice * item.quantity), 0)

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      isOpen,
      setIsOpen
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
