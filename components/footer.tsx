"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Instagram, Phone } from 'lucide-react'
import { useStore } from '@/lib/store-context'

export function Footer() {
  const { store, loading: storeLoading } = useStore()

  return (
    <footer className="bg-[#0A0A0A] border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            {storeLoading ? (
              <div className="w-32 h-12 bg-muted animate-pulse rounded mb-4" />
            ) : store?.logo_url ? (
              <Image
                src={store.logo_url}
                alt={store.name}
                width={120}
                height={50}
                className="mb-4 object-contain"
              />
            ) : (
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">S</span>
                </div>
                <span className="text-xl font-bold text-foreground">
                  Sushi<span className="text-primary">Go</span>
                </span>
              </div>
            )}
            <p className="text-foreground/60 text-sm leading-relaxed">
              O melhor sushi da cidade, com qualidade premium e entrega rapida na sua casa.
            </p>
            <div className="flex gap-3 mt-4">
              {store?.instagram_url && (
                <a 
                  href={store.instagram_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground/60 hover:text-primary hover:bg-muted/80 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {store?.facebook_url && (
                <a 
                  href={store.facebook_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground/60 hover:text-primary hover:bg-muted/80 transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {store?.whatsapp_number && (
                <a 
                  href={`https://wa.me/${store.whatsapp_number.replace(/\D/g, '')}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground/60 hover:text-green-500 hover:bg-muted/80 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Institucional */}
          <div>
            <h4 className="text-foreground font-semibold mb-4 text-sm tracking-wide">INSTITUCIONAL</h4>
            <ul className="space-y-2">
              {[
                { label: 'Sobre Nos', href: '/sobre-nos' },
                { label: 'Trabalhe Conosco', href: '/trabalhe-conosco' },
                { label: 'Politica de Entrega', href: '/politica-entrega' },
                { label: 'Politica de Privacidade', href: '/privacidade' },
                { label: 'Termos de Uso', href: '/termos' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-foreground/60 hover:text-primary transition-colors text-sm">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Atendimento */}
          <div>
            <h4 className="text-foreground font-semibold mb-4 text-sm tracking-wide">ATENDIMENTO</h4>
            <ul className="space-y-2">
              {[
                { label: 'Perguntas Frequentes', href: '/faq' },
                { label: 'Acompanhar Pedido', href: '/meus-pedidos' },
                { label: 'Fale Conosco', href: '/contato' },
                { label: 'WhatsApp', href: `https://wa.me/${store?.whatsapp_number?.replace(/\D/g, '') || '5585999999999'}` },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-foreground/60 hover:text-primary transition-colors text-sm">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Horarios e Pagamento */}
          <div>
            <h4 className="text-foreground font-semibold mb-4 text-sm tracking-wide">HORARIO DE FUNCIONAMENTO</h4>
            <p className="text-foreground/60 text-sm mb-1">Segunda a Domingo</p>
            <p className="text-foreground font-semibold text-sm mb-6">11:00 as 23:30</p>

            <h4 className="text-foreground font-semibold mb-3 text-sm tracking-wide">FORMAS DE PAGAMENTO</h4>
            <div className="flex gap-2 flex-wrap">
              <div className="bg-muted px-3 py-1.5 rounded text-xs font-semibold text-foreground/80">VISA</div>
              <div className="bg-muted px-3 py-1.5 rounded text-xs font-semibold text-foreground/80">MASTER</div>
              <div className="bg-muted px-3 py-1.5 rounded text-xs font-semibold text-foreground/80">ELO</div>
              <div className="bg-muted px-3 py-1.5 rounded text-xs font-semibold text-green-500">PIX</div>
              <div className="bg-muted px-3 py-1.5 rounded text-xs font-semibold text-foreground/80">DINHEIRO</div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-border py-4">
        <div className="container mx-auto px-4">
          <p className="text-center text-foreground/40 text-sm">
            &copy; {new Date().getFullYear()} SushiGo Delivery - Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
