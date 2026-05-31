"use client"

import Header from "@/components/header"
import { Footer } from "@/components/footer"
import { CartSidebar } from "@/components/cart-sidebar"
import { motion } from "framer-motion"
import { Tag, Clock, Percent, Gift, Sparkles, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const promotions = [
  {
    id: 1,
    title: "Cupom de Boas-Vindas",
    description: "10% de desconto no seu primeiro pedido",
    code: "BEMVINDO10",
    discount: "10% OFF",
    minValue: "R$ 30,00",
    validUntil: "31/12/2026",
    icon: Gift,
    color: "from-primary to-accent"
  },
  {
    id: 2,
    title: "Promoção de Verão",
    description: "R$ 20 de desconto em pedidos acima de R$ 60",
    code: "PRAIA20",
    discount: "R$ 20 OFF",
    minValue: "R$ 60,00",
    validUntil: "31/08/2026",
    icon: Sparkles,
    color: "from-accent to-primary"
  },
  {
    id: 3,
    title: "Combo Casal",
    description: "2 Combos Tradicionais + 2 Refrigerantes por apenas R$ 39,90",
    originalPrice: "R$ 45,80",
    promoPrice: "R$ 39,90",
    icon: Tag,
    color: "from-primary to-primary/80"
  },
  {
    id: 4,
    title: "Happy Hour",
    description: "20% de desconto em todos os combos das 14h às 17h",
    discount: "20% OFF",
    schedule: "14h às 17h",
    icon: Clock,
    color: "from-accent to-accent/80"
  }
]

const weeklyDeals = [
  { day: "Segunda", deal: "Combo Fit com 15% de desconto" },
  { day: "Terça", deal: "Combo Kids por R$ 12,90" },
  { day: "Quarta", deal: "2 por 1 em combos de 8 peças" },
  { day: "Quinta", deal: "Frete grátis para toda Canoa Quebrada" },
  { day: "Sexta", deal: "Combo Premium com Molho Especial grátis" },
  { day: "Sábado", deal: "Combo Família com 20% de desconto" },
  { day: "Domingo", deal: "Molho extra grátis em qualquer combo" }
]

export default function PromocoesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartSidebar />

      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
              <Percent className="w-5 h-5" />
              <span className="font-medium">Ofertas Especiais</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Promoções Imperdíveis
            </h1>
            <p className="text-lg text-muted-foreground">
              Aproveite nossos cupons e ofertas especiais para saborear o melhor 
              sushi de Canoa Quebrada com descontos exclusivos.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Promoções */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6">
            {promotions.map((promo, index) => (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative overflow-hidden rounded-2xl bg-card border border-border"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${promo.color} opacity-10 blur-2xl`} />
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${promo.color} flex items-center justify-center`}>
                      <promo.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    {promo.discount && (
                      <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold">
                        {promo.discount}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {promo.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {promo.description}
                  </p>

                  {promo.code && (
                    <div className="bg-muted rounded-lg p-3 mb-4">
                      <p className="text-sm text-muted-foreground mb-1">Código do cupom:</p>
                      <p className="font-mono font-bold text-lg text-foreground">
                        {promo.code}
                      </p>
                    </div>
                  )}

                  {promo.originalPrice && (
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-muted-foreground line-through">
                        {promo.originalPrice}
                      </span>
                      <span className="text-2xl font-bold text-primary">
                        {promo.promoPrice}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    {promo.minValue && (
                      <span className="bg-muted px-2 py-1 rounded">
                        Mínimo: {promo.minValue}
                      </span>
                    )}
                    {promo.validUntil && (
                      <span className="bg-muted px-2 py-1 rounded">
                        Válido até: {promo.validUntil}
                      </span>
                    )}
                    {promo.schedule && (
                      <span className="bg-muted px-2 py-1 rounded">
                        Horário: {promo.schedule}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Promoções da Semana */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-4">
              <Zap className="w-5 h-5" />
              <span className="font-medium">Promoções da Semana</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Cada Dia uma Surpresa!
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Acompanhe nossas promoções diárias e aproveite ofertas exclusivas em cada dia da semana.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {weeklyDeals.map((deal, index) => (
              <motion.div
                key={deal.day}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-background rounded-xl p-4 border border-border hover:border-primary/50 transition-colors"
              >
                <div className="text-primary font-bold mb-2">{deal.day}</div>
                <p className="text-sm text-foreground">{deal.deal}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary to-accent rounded-2xl p-8 md:p-12 text-center"
          >
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              Não perca nenhuma promoção!
            </h2>
            <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
              Siga-nos nas redes sociais e fique por dentro de todas as 
              novidades e promoções exclusivas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary">
                <Link href="/cardapio">
                  Ver Cardápio
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                <Link href="/contato">
                  Fale Conosco
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
