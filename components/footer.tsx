"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Instagram, Twitter, Phone, Mail, MapPin } from 'lucide-react'
import { useStore } from '@/lib/store-context'

export function Footer() {
  const { store, loading: storeLoading } = useStore()

  return (
    <footer className="bg-background border-t border-border">
      {/* Benefits Bar */}
      <div className="bg-muted/50 py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-foreground font-semibold text-sm">Entregamos</p>
                <p className="text-foreground/60 text-xs">em toda a região</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <div>
                <p className="text-foreground font-semibold text-sm">Embalagens</p>
                <p className="text-foreground/60 text-xs">sustentáveis</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-foreground font-semibold text-sm">Satisfação</p>
                <p className="text-foreground/60 text-xs">garantida</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-foreground font-semibold text-sm">Atendimento</p>
                <p className="text-foreground/60 text-xs">de qualidade</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            {storeLoading ? (
              <div className="w-20 h-20 rounded-lg bg-muted animate-pulse mb-4" />
            ) : store?.logo_url ? (
              <Image
                src={store.logo_url}
                alt={store.name}
                width={120}
                height={120}
                className="mb-4 object-contain"
                priority
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-3xl mb-4">
                {store?.name?.charAt(0) || 'A'}
              </div>
            )}
            <p className="text-foreground/70 text-sm leading-relaxed">
              {store?.description || 'O melhor açaí, direto para você! Ingredientes selecionados e aquele sabor especial.'}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-foreground font-semibold mb-4 text-lg">Navegação</h4>
            <ul className="space-y-2">
              {[
                { label: 'Início', href: '/' },
                { label: 'Cardápio', href: '/cardapio' },
                { label: 'Combos', href: '/combos' },
                { label: 'Promoções', href: '/promocoes' },
                { label: 'Sobre Nós', href: '/sobre-nos' },
                { label: 'Contato', href: '/contato' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-foreground/70 hover:text-primary transition-colors text-sm">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="text-foreground font-semibold mb-4 text-lg">Informações</h4>
            <ul className="space-y-2">
              {['Formas de Pagamento', 'Política de Entrega', 'Trocas e Devoluções', 'Termos de Uso', 'Política de Privacidade'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-foreground/70 hover:text-primary transition-colors text-sm">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Contact */}
          <div>
            <h4 className="text-foreground font-semibold mb-4 text-lg">Siga nossas redes</h4>
            <div className="flex gap-4 mb-6">
              {store?.facebook_url && (
                <a href={store.facebook_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {store?.instagram_url && (
                <a href={store.instagram_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {store?.tiktok_url && (
                <a href={store.tiktok_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              )}
            </div>
            <p className="text-foreground/70 text-sm mb-2">@{store?.instagram_url?.split('/').pop() || 'loja'}</p>
            {store?.whatsapp_number && (
              <div className="flex items-center gap-2 text-foreground/70 text-sm">
                <Phone className="w-4 h-4 text-green-600" />
                <span>{store.whatsapp_number}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-border py-4">
        <div className="container mx-auto px-4">
          <p className="text-center text-foreground/50 text-sm">
            &copy; {new Date().getFullYear()} {store?.name || 'Loja'}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
