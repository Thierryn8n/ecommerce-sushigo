"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Download, Monitor, Printer, Bell, Settings, CheckCircle, Copy, Smartphone } from 'lucide-react'
import Link from 'next/link'
import { usePwaInstall } from '@/hooks/use-pwa-install'

export default function AplicativoPage() {
  const [store, setStore] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const supabase = createClient()
  const { isInstallable, isInstalled, install } = usePwaInstall()

  useEffect(() => {
    async function loadStore() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      // Busca a primeira loja (sistema single-tenant)
      const { data: storeData } = await supabase
        .from('stores')
        .select('*')
        .limit(1)
        .single()

      if (storeData) {
        setStore(storeData)
      }
      setLoading(false)
    }

    loadStore()
  }, [supabase])

  const copyStoreId = () => {
    if (store?.id) {
      navigator.clipboard.writeText(store.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const features = [
    {
      icon: Bell,
      title: 'Alertas em Tempo Real',
      description: 'Receba notificacoes instantaneas quando novos pedidos chegarem'
    },
    {
      icon: Printer,
      title: 'Impressao Automatica',
      description: 'Imprima pedidos automaticamente em impressoras termicas 80mm'
    },
    {
      icon: Monitor,
      title: 'Painel de Pedidos',
      description: 'Visualize todos os pedidos em uma interface moderna e intuitiva'
    },
    {
      icon: Settings,
      title: 'Configuravel',
      description: 'Escolha a impressora, ative/desative impressao automatica'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Aplicativo Desktop</h1>
              <p className="text-muted-foreground text-sm">Sistema de impressao automatica de pedidos</p>
            </div>
            <Link href="/admin">
              <Button variant="outline">Voltar ao Painel</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/20 via-card to-secondary/20 rounded-3xl p-8 md:p-12 mb-8 border border-border">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Acai Printer
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Aplicativo desktop para Windows que conecta sua loja com impressao automatica de pedidos em tempo real.
                Nunca mais perca um pedido!
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                  onClick={() => {
                    window.location.href = '/api/download-desktop-app'
                  }}
                >
                  <Download className="w-5 h-5" />
                  Baixar para Windows (.exe)
                </Button>

                {isInstallable && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 border-primary/50 text-primary hover:bg-primary/10"
                    onClick={install}
                  >
                    <Smartphone className="w-5 h-5" />
                    Instalar App PWA
                  </Button>
                )}
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                Instalador pronto para Windows. Execute e siga as instrucoes na tela.
              </p>
            </div>
            
            <div className="relative">
              <div className="bg-card rounded-2xl border border-border p-4 shadow-2xl">
                <div className="bg-[#1a0a25] rounded-xl p-4 aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <Monitor className="w-16 h-16 text-primary mx-auto mb-4" />
                    <p className="text-white/60 text-sm">Preview do Aplicativo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ID da Loja */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-2">Seu ID da Loja</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Use este ID no aplicativo para conectar sua loja e receber os pedidos
          </p>
          
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-background border border-border rounded-xl px-4 py-3 font-mono text-sm">
              {store?.id || 'Carregando...'}
            </div>
            <Button 
              variant="outline" 
              onClick={copyStoreId}
              className="gap-2"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-6">Recursos</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-colors"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Instrucoes */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Como Usar</h3>
          <ol className="space-y-4">
            <li className="flex gap-4">
              <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold shrink-0">1</span>
              <div>
                <p className="font-medium text-foreground">Baixe e instale o aplicativo</p>
                <p className="text-sm text-muted-foreground">Clique no botao "Baixar para Windows" e execute o instalador</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold shrink-0">2</span>
              <div>
                <p className="font-medium text-foreground">Configure o ID da Loja</p>
                <p className="text-sm text-muted-foreground">Copie o ID acima e cole no campo "ID do Admin" no aplicativo</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold shrink-0">3</span>
              <div>
                <p className="font-medium text-foreground">Selecione sua impressora</p>
                <p className="text-sm text-muted-foreground">Escolha a impressora termica 80mm conectada ao seu computador</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold shrink-0">4</span>
              <div>
                <p className="font-medium text-foreground">Pronto!</p>
                <p className="text-sm text-muted-foreground">Os pedidos serao impressos automaticamente conforme chegarem</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
