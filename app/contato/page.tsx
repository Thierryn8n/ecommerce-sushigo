"use client"

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Phone, Mail, MapPin, Clock, Instagram, Facebook, MessageCircle } from 'lucide-react'
import Header from '@/components/header'
import { Footer } from '@/components/footer'
import { CartSidebar } from '@/components/cart-sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ContatoPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      {/* Hero */}
      <section className="pt-28 pb-12 bg-gradient-to-b from-primary/30 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Fale <span className="text-[#FFC300]">Conosco</span>
            </h1>
            <p className="text-foreground/70 max-w-xl mx-auto">
              Estamos sempre prontos para atender você! Entre em contato conosco.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">Informações de Contato</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FF8C00]/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-[#FF8C00]" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-semibold mb-1">WhatsApp</h3>
                    <p className="text-foreground/70">(88) 9 9999-9999</p>
                    <a 
                      href="https://wa.me/5588999999999" 
                      target="_blank"
                      className="text-[#25D366] text-sm hover:underline"
                    >
                      Clique para enviar mensagem
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#8A2BE2]/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-[#8A2BE2]" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-semibold mb-1">E-mail</h3>
                    <p className="text-foreground/70">contato@acaidapraia.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#00BFFF]/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-[#00BFFF]" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-semibold mb-1">Endereço</h3>
                    <p className="text-foreground/70">Rua da Praia, 123</p>
                    <p className="text-foreground/70">Canoa Quebrada - CE</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FFC300]/20 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-[#FFC300]" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-semibold mb-1">Horário de Funcionamento</h3>
                    <p className="text-foreground/70">Segunda a Domingo</p>
                    <p className="text-foreground/70">10:00 às 22:00</p>
                  </div>
                </div>
              </div>

              {/* Social */}
              <div className="mt-8">
                <h3 className="text-foreground font-semibold mb-4">Redes Sociais</h3>
                <div className="flex gap-4">
                  <a 
                    href="#" 
                    className="w-12 h-12 rounded-xl bg-[#2a1a35] flex items-center justify-center text-foreground/70 hover:bg-gradient-to-br hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] hover:text-foreground transition-all"
                  >
                    <Instagram className="w-6 h-6" />
                  </a>
                  <a 
                    href="#" 
                    className="w-12 h-12 rounded-xl bg-[#2a1a35] flex items-center justify-center text-foreground/70 hover:bg-[#1877F2] hover:text-foreground transition-all"
                  >
                    <Facebook className="w-6 h-6" />
                  </a>
                  <a 
                    href="https://wa.me/5588999999999" 
                    target="_blank"
                    className="w-12 h-12 rounded-xl bg-[#2a1a35] flex items-center justify-center text-foreground/70 hover:bg-[#25D366] hover:text-foreground transition-all"
                  >
                    <MessageCircle className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card rounded-3xl p-8 border border-border"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">Envie uma Mensagem</h2>
              
              <form className="space-y-4">
                <div>
                  <label className="text-foreground/70 text-sm mb-2 block">Nome</label>
                  <Input
                    type="text"
                    placeholder="Seu nome"
                    className="bg-[#2a1a35] border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="text-foreground/70 text-sm mb-2 block">E-mail</label>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    className="bg-[#2a1a35] border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="text-foreground/70 text-sm mb-2 block">Telefone</label>
                  <Input
                    type="tel"
                    placeholder="(00) 00000-0000"
                    className="bg-[#2a1a35] border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="text-foreground/70 text-sm mb-2 block">Mensagem</label>
                  <textarea
                    rows={4}
                    placeholder="Sua mensagem..."
                    className="w-full bg-[#2a1a35] border border-border rounded-lg p-3 text-foreground placeholder:text-foreground/40 focus:border-[#8A2BE2] focus:outline-none resize-none"
                  />
                </div>
                <Button className="w-full bg-[#FF8C00] hover:bg-[#FFC300] text-foreground font-bold py-3 rounded-full">
                  Enviar Mensagem
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
      <CartSidebar />
    </main>
  )
}
