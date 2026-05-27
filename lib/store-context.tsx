"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Store {
  id: string
  name: string
  description: string | null
  logo_url: string | null
  banner_url: string | null
  primary_color: string
  secondary_color: string
  accent_color: string
  background_color: string
  whatsapp_number: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  instagram_url: string | null
  facebook_url: string | null
  tiktok_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface StoreContextType {
  store: Store | null
  storeSlug: string | null
  loading: boolean
  error: string | null
  setStoreSlug: (slug: string) => void // Mantido para compatibilidade
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store | null>(null)
  const [storeSlug, setStoreSlug] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Single-instance: não precisa mais de slug
    // Apenas define um slug padrão para compatibilidade
    setStoreSlug('default')
  }, [])

  useEffect(() => {
    async function fetchStore() {
      try {
        setLoading(true)
        setError(null)

        // Single-instance: busca a primeira loja ativa sem filtro de slug
        const { data, error } = await supabase
          .from('stores')
          .select('*')
          .eq('is_active', true)
          .limit(1)
          .single()

        if (error) throw error
        if (!data) throw new Error('Loja não encontrada')

        setStore(data)
        
        // Aplicar cores customizadas ao CSS
        applyStoreColors(data)
      } catch (err) {
        console.error('Erro ao buscar loja:', err)
        setError('Erro ao carregar loja')
      } finally {
        setLoading(false)
      }
    }

    fetchStore()
  }, [supabase])

  const applyStoreColors = (storeData: Store) => {
    // Aplicar cores customizadas via CSS variables
    document.documentElement.style.setProperty('--store-primary', storeData.primary_color)
    document.documentElement.style.setProperty('--store-secondary', storeData.secondary_color)
    document.documentElement.style.setProperty('--store-accent', storeData.accent_color)
    document.documentElement.style.setProperty('--store-background', storeData.background_color)
  }

  return (
    <StoreContext.Provider value={{ store, storeSlug, loading, error, setStoreSlug }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return context
}
