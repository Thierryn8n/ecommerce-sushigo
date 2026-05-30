"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Download, Monitor, Printer, Bell, Settings, CheckCircle, Copy, Smartphone, Home } from 'lucide-react'
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
      icon: Home,
      title: 'Pagina Inicial',
      description: 'Acesse o cardapio e faca pedidos diretamente pelo app'
    },
    {
      icon: Bell,
      title: 'Alertas em Tempo Real',
      description: 'Receba notificacoes de status do pedido no seu celular'
    },
    {
      icon: Smartphone,
      title: 'Experiencia Nativa',
      description: 'Interface otimizada para mobile, funciona como app nativo'
    },
    {
      icon: Settings,
      title: 'Sem Download',
      description: 'Instale direto pelo navegador, sem ir a Play Store ou App Store'
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
              <h1 className="text-2xl font-bold text-foreground">Aplicativo</h1>
              <p className="text-muted-foreground text-sm">Instale o app PWA no celular dos seus clientes</p>
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
                Acaí da Praia App
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Seus clientes podem instalar o app diretamente no celular pelo navegador.
                Rápido, prático e sem precisar de loja de aplicativos!
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                {isInstalled ? (
                  <Button
                    size="lg"
                    variant="outline"
                    disabled
                    className="gap-2 border-green-500/50 text-green-400"
                  >
                    <CheckCircle className="w-5 h-5" />
                    App já instalado
                  </Button>
                ) : isInstallable ? (
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                    onClick={install}
                  >
                    <Download className="w-5 h-5" />
                    Instalar Aplicativo
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="outline"
                    disabled
                    className="gap-2"
                  >
                    <Smartphone className="w-5 h-5" />
                    Abra no celular para instalar
                  </Button>
                )}
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                Compatível com Android e iOS. Basta abrir o site no navegador e tocar em "Adicionar à Tela Inicial".
              </p>
            </div>
            
            <div className="relative">
              <div className="bg-card rounded-2xl border border-border p-4 shadow-2xl">
                <div className="bg-[#1a0a25] rounded-xl p-4 aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <Smartphone className="w-16 h-16 text-primary mx-auto mb-4" />
                    <p className="text-white/60 text-sm">Preview do App Mobile</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ID da Loja */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-2">ID da Loja (Desktop)</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Use este ID no aplicativo desktop de impressao para conectar sua loja
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
                <p className="font-medium text-foreground">Abra o site no celular</p>
                <p className="text-sm text-muted-foreground">Compartilhe o link do site com seus clientes</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold shrink-0">2</span>
              <div>
                <p className="font-medium text-foreground">Toque em "Instalar"</p>
                <p className="text-sm text-muted-foreground">Aparecera um banner ou opcao no menu para adicionar a tela inicial</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold shrink-0">3</span>
              <div>
                <p className="font-medium text-foreground">Confirme a instalacao</p>
                <p className="text-sm text-muted-foreground">O app sera adicionado automaticamente na tela inicial do celular</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold shrink-0">4</span>
              <div>
                <p className="font-medium text-foreground">Pronto!</p>
                <p className="text-sm text-muted-foreground">O cliente abre o app direto da tela inicial, como um app nativo</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
