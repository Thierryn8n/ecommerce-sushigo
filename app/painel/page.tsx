"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Home, ShoppingBag, Heart, MapPin, CreditCard, Tag,
  Star, Settings, LogOut, Bell, ChevronDown, ChevronRight,
  Plus, Truck, Clock, Check, Gift, Bike, Fish, Award, ShieldCheck
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Order {
  id: string
  order_number: number
  status: string
  total: number
  created_at: string
  items?: { product_name: string; quantity: number }[]
}

interface Product {
  id: string
  name: string
  slug: string
  base_price: number
  promotion_price: number | null
  image_url: string | null
  description: string | null
}

const NAV_ITEMS = [
  { id: 'inicio', label: 'Inicio', icon: Home },
  { id: 'pedidos', label: 'Meus pedidos', icon: ShoppingBag },
  { id: 'favoritos', label: 'Favoritos', icon: Heart },
  { id: 'enderecos', label: 'Enderecos', icon: MapPin },
  { id: 'pagamento', label: 'Formas de pagamento', icon: CreditCard },
  { id: 'cupons', label: 'Cupons e promocoes', icon: Tag },
  { id: 'avaliacoes', label: 'Avaliacoes', icon: Star },
  { id: 'configuracoes', label: 'Configuracoes', icon: Settings },
]

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  entregue: { label: 'Entregue', color: 'text-green-400', bg: 'bg-green-900/40' },
  em_preparo: { label: 'Em preparo', color: 'text-yellow-400', bg: 'bg-yellow-900/40' },
  pendente: { label: 'Pendente', color: 'text-orange-400', bg: 'bg-orange-900/40' },
  cancelado: { label: 'Cancelado', color: 'text-red-400', bg: 'bg-red-900/40' },
  saiu_entrega: { label: 'A caminho', color: 'text-blue-400', bg: 'bg-blue-900/40' },
}

const MOCK_ORDERS: Order[] = [
  { id: '1', order_number: 12548, status: 'entregue', total: 79.90, created_at: '2024-05-02T19:30:00Z', items: [{ product_name: 'Combo 2 Pessoas - 40 pecas', quantity: 1 }] },
  { id: '2', order_number: 12411, status: 'entregue', total: 149.90, created_at: '2024-04-28T20:15:00Z', items: [{ product_name: 'Combo Familia - 80 pecas', quantity: 1 }] },
  { id: '3', order_number: 12287, status: 'em_preparo', total: 22.90, created_at: '2024-04-20T18:45:00Z', items: [{ product_name: 'Uramaki Filadelfia - 8 pecas', quantity: 1 }] },
  { id: '4', order_number: 12109, status: 'entregue', total: 39.90, created_at: '2024-04-15T12:30:00Z', items: [{ product_name: 'Combo Individual - 20 pecas', quantity: 1 }] },
]

function formatPrice(price: number) {
  return `R$ ${Number(price).toFixed(2).replace('.', ',')}`
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' as ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function PainelPage() {
  const [activeSection, setActiveSection] = useState('inicio')
  const [products, setProducts] = useState<Product[]>([])
  const [userProfile, setUserProfile] = useState<{ name: string; email: string; phone: string } | null>(null)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone')
          .eq('id', user.id)
          .single()

        setUserProfile({
          name: profile?.full_name || user.email?.split('@')[0] || 'Cliente',
          email: user.email || '',
          phone: profile?.phone || '(11) 99999-9999',
        })
      } else {
        // Demo user for preview
        setUserProfile({ name: 'Lucas Silva', email: 'lucas.silva@email.com', phone: '(11) 99999-9999' })
      }

      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .limit(4)
        .order('display_order')

      if (productsData) setProducts(productsData)
    }
    fetchData()
  }, [])

  const firstName = userProfile?.name?.split(' ')[0] || 'Cliente'
  const loyaltyPoints = 350
  const loyaltyGoal = 500

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="bg-card border-b border-border h-16 flex items-center px-6 gap-4 sticky top-0 z-40">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mr-6">
          <Image src="/images/logo-sushigo.png" alt="SushiGo" width={110} height={38} className="object-contain" />
        </Link>

        {/* Welcome text */}
        <div className="flex-1">
          <p className="text-muted-foreground text-xs leading-none mb-0.5">Bem-vindo(a),</p>
          <p className="text-foreground font-bold text-base leading-none">
            {userProfile?.name} <span>👋</span>
          </p>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:border-primary transition-colors">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full text-[10px] font-bold text-primary-foreground flex items-center justify-center">
              3
            </span>
          </button>

          {/* User */}
          <button className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
              <span className="text-primary font-bold text-sm">{firstName[0]}</span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-foreground font-semibold text-sm leading-tight">{userProfile?.name}</p>
              <p className="text-primary text-xs leading-tight">VER PERFIL</p>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-56 bg-card border-r border-border flex flex-col flex-shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="flex-1 py-4 px-3">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-0.5 text-sm font-medium transition-all ${
                  activeSection === id
                    ? 'bg-primary/15 text-primary border-l-4 border-primary pl-3'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          {/* Loyalty banner */}
          <div className="m-3 bg-card border border-border rounded-xl p-4">
            <p className="text-foreground font-bold text-xs mb-1">Ganhe beneficios em cada pedido!</p>
            <p className="text-muted-foreground text-[10px] leading-relaxed mb-3">
              Acumule pontos e troque por descontos exclusivos.
            </p>
            <button className="w-full border border-primary text-primary text-xs font-bold py-2 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors">
              VER BENEFICIOS
            </button>
          </div>

          {/* Logout */}
          <div className="px-3 pb-4">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl text-sm transition-colors">
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0 p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            {/* Welcome */}
            <div className="mb-6">
              <div className="w-8 h-1 bg-primary rounded-full mb-3" />
              <p className="text-muted-foreground text-xs">O melhor sushi, onde voce estiver.</p>
            </div>

            <div className="grid xl:grid-cols-[1fr_300px] gap-6">
              {/* Left column */}
              <div className="space-y-6">
                {/* Quick action cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: Bike, label: 'Fazer novo pedido', sub: 'Pedir agora', href: '/cardapio' },
                    { icon: Clock, label: 'Meus pedidos', sub: 'Ver historico', href: '#pedidos' },
                    { icon: Heart, label: 'Meus favoritos', sub: 'Ver salvos', href: '#favoritos' },
                    { icon: Gift, label: 'Cupons', sub: 'Ver descontos', href: '#cupons' },
                  ].map(({ icon: Icon, label, sub, href }) => (
                    <Link key={label} href={href}>
                      <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-all group">
                        <Icon className="w-7 h-7 text-primary mb-3" />
                        <p className="text-foreground font-semibold text-xs leading-tight">{label}</p>
                        <p className="text-muted-foreground text-[10px]">{sub}</p>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* My orders */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-foreground font-bold text-base">Meus pedidos</h2>
                    <button className="text-primary text-sm font-semibold hover:underline flex items-center gap-1">
                      Ver todos <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {MOCK_ORDERS.map((order) => {
                      const status = STATUS_LABELS[order.status] || STATUS_LABELS.pendente
                      const itemName = order.items?.[0]?.product_name || 'Pedido'
                      return (
                        <div key={order.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                          {/* Product thumb */}
                          <div className="w-14 h-14 rounded-lg bg-[#111] overflow-hidden flex-shrink-0 relative">
                            <Image
                              src="/images/combo-10.png"
                              alt={itemName}
                              fill
                              className="object-cover"
                            />
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-foreground font-semibold text-sm">Pedido #{order.order_number}</p>
                            <p className="text-muted-foreground text-xs truncate">{itemName}</p>
                            <p className="text-muted-foreground text-xs">{formatDate(order.created_at)}</p>
                          </div>
                          {/* Status */}
                          <div className={`px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.color}`}>
                            {status.label}
                          </div>
                          {/* Price */}
                          <p className="text-foreground font-bold text-sm flex-shrink-0">{formatPrice(order.total)}</p>
                          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Recommended products */}
                {products.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-foreground font-bold text-base">Recomendados para voce</h2>
                      <Link href="/cardapio" className="text-primary text-sm font-semibold hover:underline flex items-center gap-1">
                        Ver cardapio <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                      {products.map((p) => {
                        const price = p.promotion_price || p.base_price
                        return (
                          <Link key={p.id} href={`/produto/${p.slug}`} className="flex-shrink-0 w-40">
                            <div className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all">
                              <div className="relative w-full h-32 bg-[#111]">
                                <button
                                  onClick={(e) => e.preventDefault()}
                                  className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-background/70 flex items-center justify-center"
                                >
                                  <Heart className="w-3.5 h-3.5 text-muted-foreground" />
                                </button>
                                <Image
                                  src={p.image_url || '/images/hot-roll-salmao.png'}
                                  alt={p.name}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                  sizes="160px"
                                />
                              </div>
                              <div className="p-3">
                                <p className="text-foreground font-semibold text-xs leading-tight mb-0.5 line-clamp-1">{p.name}</p>
                                <p className="text-muted-foreground text-[10px] mb-2">
                                  {p.description?.slice(0, 20) || '2 unidades'}
                                </p>
                                <div className="flex items-center justify-between">
                                  <p className="text-primary font-bold text-sm">{formatPrice(price)}</p>
                                  <button
                                    onClick={(e) => e.preventDefault()}
                                    className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                                  >
                                    <Plus className="w-3 h-3 text-primary-foreground" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Right column */}
              <div className="space-y-4">
                {/* Current order status */}
                <div className="bg-card border border-border rounded-xl p-5">
                  <h3 className="text-foreground font-bold text-sm mb-4">Status do pedido atual</h3>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-foreground font-semibold text-sm">Pedido #12287</p>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-900/40 text-yellow-400">
                      Em preparo &rarr;
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs mb-1">Previsao de entrega</p>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-foreground font-bold text-3xl">20:15</p>
                      <p className="text-muted-foreground text-xs">Hoje, 20/04</p>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                      <Truck className="w-6 h-6 text-primary" />
                    </div>
                  </div>

                  {/* Progress steps */}
                  <div className="flex items-center justify-between">
                    {[
                      { icon: Check, label: 'Recebido', active: true, done: true },
                      { icon: Clock, label: 'Em preparo', active: true, done: false },
                      { icon: Bike, label: 'A caminho', active: false, done: false },
                      { icon: Check, label: 'Entregue', active: false, done: false },
                    ].map(({ icon: Icon, label, active, done }, i, arr) => (
                      <div key={label} className="flex items-center">
                        <div className="flex flex-col items-center gap-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                            done
                              ? 'bg-primary text-primary-foreground'
                              : active
                              ? 'bg-primary/20 text-primary border border-primary'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <p className={`text-[9px] text-center leading-tight ${active || done ? 'text-primary' : 'text-muted-foreground'}`}>
                            {label}
                          </p>
                        </div>
                        {i < arr.length - 1 && (
                          <div className={`w-4 h-0.5 mx-0.5 flex-shrink-0 ${done ? 'bg-primary' : 'bg-border'}`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* SushiGo Club */}
                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-foreground font-bold text-sm">SushiGo Club</h3>
                    <button className="text-primary text-xs font-bold hover:underline">VER BENEFICIOS</button>
                  </div>
                  <p className="text-muted-foreground text-xs mb-1">Seus pontos</p>
                  <p className="text-foreground font-bold text-2xl mb-1">{loyaltyPoints} pontos</p>
                  <p className="text-muted-foreground text-[10px] mb-3">
                    Faltam {loyaltyGoal - loyaltyPoints} pontos para ganhar R$10 de desconto!
                  </p>
                  <div className="h-2 bg-muted rounded-full overflow-hidden mb-1">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(loyaltyPoints / loyaltyGoal) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">{loyaltyGoal} pontos</span>
                  </div>
                </div>

                {/* My account */}
                <div className="bg-card border border-border rounded-xl p-5">
                  <h3 className="text-foreground font-bold text-sm mb-4">Minha conta</h3>
                  <div className="space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-xs">Nome</span>
                      <span className="text-foreground text-xs font-medium">{userProfile?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-xs">E-mail</span>
                      <span className="text-foreground text-xs font-medium truncate max-w-[140px]">{userProfile?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-xs">Telefone</span>
                      <span className="text-foreground text-xs font-medium">{userProfile?.phone}</span>
                    </div>
                  </div>
                  <button className="text-primary text-xs font-bold mt-3 hover:underline">EDITAR DADOS</button>
                </div>

                {/* Primary address */}
                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-foreground font-bold text-sm">Meu endereco principal</h3>
                    <button className="text-primary text-xs font-bold hover:underline">GERENCIAR</button>
                  </div>
                  <p className="text-foreground text-xs font-medium">Rua das Flores, 123</p>
                  <p className="text-muted-foreground text-xs">Apartamento 45 - Bairro Centro</p>
                  <p className="text-muted-foreground text-xs">Sao Paulo - SP, 01310-100</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits footer */}
      <div className="border-t border-border bg-card">
        <div className="container mx-auto px-6 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Bike, title: 'Entrega rapida', sub: 'Ate 60 minutos' },
              { icon: Fish, title: 'Peixes selecionados', sub: 'Qualidade premium' },
              { icon: Award, title: 'Embalagem premium', sub: 'Seguranca e qualidade' },
              { icon: ShieldCheck, title: 'Pagamento seguro', sub: 'Seus dados protegidos' },
            ].map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-center gap-3">
                <Icon className="w-6 h-6 text-primary flex-shrink-0" />
                <div>
                  <p className="text-foreground font-semibold text-xs">{title}</p>
                  <p className="text-muted-foreground text-[10px]">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
