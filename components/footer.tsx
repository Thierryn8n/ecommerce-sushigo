"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Instagram, Phone } from 'lucide-react'
import { useStore } from '@/lib/store-context'

export function Footer() {
  const { store } = useStore()

  return (
    <footer className="bg-[#0A0A0A] border-t border-[#1A1A1A]">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8">
          {/* Brand */}
          <div>
            <Image
              src="/images/logo-sushigo.png"
              alt="SushiGo Delivery"
              width={150}
              height={55}
              className="mb-5 object-contain"
            />
            <p className="text-foreground/60 text-sm leading-relaxed mb-5">
              O melhor sushi da cidade, com qualidade premium e entrega rapida na sua casa.
            </p>
            <div className="flex gap-3">
              <a 
                href={store?.instagram_url || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-foreground/60 hover:text-primary hover:border-primary transition-all"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href={store?.facebook_url || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-foreground/60 hover:text-primary hover:border-primary transition-all"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href={`https://wa.me/${store?.whatsapp_number?.replace(/\D/g, '') || '5585999999999'}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-foreground/60 hover:text-green-500 hover:border-green-500 transition-all"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Institucional */}
          <div>
            <h4 className="text-foreground font-bold mb-5 text-sm tracking-wide">INSTITUCIONAL</h4>
            <ul className="space-y-3">
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
            <h4 className="text-foreground font-bold mb-5 text-sm tracking-wide">ATENDIMENTO</h4>
            <ul className="space-y-3">
              {[
                { label: 'Perguntas Frequentes', href: '/faq' },
                { label: 'Acompanhar Pedido', href: '/meus-pedidos' },
                { label: 'Fale Conosco', href: '/contato' },
                { label: 'WhatsApp', href: `https://wa.me/${store?.whatsapp_number?.replace(/\D/g, '') || '5585999999999'}`, external: true },
              ].map((item) => (
                <li key={item.label}>
                  {item.external ? (
                    <a 
                      href={item.href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-foreground/60 hover:text-primary transition-colors text-sm"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link href={item.href} className="text-foreground/60 hover:text-primary transition-colors text-sm">
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Horarios e Pagamento */}
          <div>
            <h4 className="text-foreground font-bold mb-5 text-sm tracking-wide">HORARIO DE FUNCIONAMENTO</h4>
            <p className="text-foreground/60 text-sm mb-1">Segunda a Domingo</p>
            <p className="text-primary font-bold text-lg mb-8">11:00 as 23:30</p>

            <h4 className="text-foreground font-bold mb-4 text-sm tracking-wide">FORMAS DE PAGAMENTO</h4>
            <div className="flex gap-2 flex-wrap">
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] px-3 py-1.5 rounded text-xs font-bold text-blue-500">VISA</div>
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] px-3 py-1.5 rounded text-xs font-bold text-orange-500">MASTER</div>
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] px-3 py-1.5 rounded text-xs font-bold text-yellow-500">ELO</div>
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] px-3 py-1.5 rounded text-xs font-bold text-green-500">PIX</div>
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] px-3 py-1.5 rounded text-xs font-bold text-foreground/60">DINHEIRO</div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-[#1A1A1A] py-5">
        <div className="container mx-auto px-4">
          <p className="text-center text-foreground/40 text-sm">
            &copy; {new Date().getFullYear()} SushiGo Delivery - Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
