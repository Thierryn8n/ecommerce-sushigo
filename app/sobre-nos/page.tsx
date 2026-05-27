"use client"

import Header from "@/components/header"
import { Footer } from "@/components/footer"
import { CartSidebar } from "@/components/cart-sidebar"
import { motion } from "framer-motion"
import { Leaf, Heart, Award, Users, MapPin, Clock } from "lucide-react"
import Image from "next/image"

export default function SobreNosPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartSidebar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Nossa História
            </h1>
            <p className="text-lg text-muted-foreground">
              Conheça a história do Açaí da Praia e nossa paixão por entregar 
              o melhor açaí de Canoa Quebrada para você.
            </p>
          </motion.div>
        </div>
      </section>

      {/* História */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20a%C3%A7a%C3%AD%20da%20praia%20sem%20fundo-f7nqFBR8xSzITFhI7km23gMgUdIh6o.png"
                  alt="Açaí da Praia"
                  fill
                  className="object-contain p-8"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold text-foreground">
                Do Pará para Canoa Quebrada
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                O Açaí da Praia nasceu em 2018, quando nosso fundador, apaixonado 
                pela cultura amazônica, decidiu trazer o verdadeiro sabor do açaí 
                paraense para o litoral cearense.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Começamos com uma pequena barraquinha na praia de Canoa Quebrada, 
                e rapidamente conquistamos o coração dos moradores e turistas com 
                nosso açaí cremoso e ingredientes selecionados.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Hoje, somos referência em qualidade e sabor, mantendo sempre o 
                compromisso com ingredientes frescos e o verdadeiro açaí amazônico.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Nossos Valores
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Qualidade, frescor e paixão em cada tigela de açaí
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Leaf,
                title: "100% Natural",
                description: "Utilizamos apenas açaí puro, sem conservantes ou aditivos artificiais."
              },
              {
                icon: Heart,
                title: "Feito com Amor",
                description: "Cada tigela é preparada com carinho e atenção aos detalhes."
              },
              {
                icon: Award,
                title: "Qualidade Premium",
                description: "Ingredientes selecionados e açaí direto do Pará."
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-background rounded-xl p-6 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="text-muted-foreground">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipe */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Nossa Equipe
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Uma equipe apaixonada por entregar a melhor experiência
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Users, label: "Colaboradores", value: "12+" },
              { icon: Award, label: "Anos de experiência", value: "6+" },
              { icon: Heart, label: "Clientes satisfeitos", value: "50k+" },
              { icon: MapPin, label: "Áreas atendidas", value: "5" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl p-6 text-center"
              >
                <stat.icon className="w-10 h-10 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Localização */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold text-foreground">
                Onde Estamos
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Localizado no coração de Canoa Quebrada, nosso espaço foi 
                pensado para você aproveitar o melhor açaí com vista para 
                o pôr do sol mais bonito do Ceará.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-foreground">Endereço</p>
                    <p className="text-muted-foreground">
                      Av. Principal, 123 - Canoa Quebrada, CE
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-foreground">Horário</p>
                    <p className="text-muted-foreground">
                      Segunda a Quinta: 10h às 22h<br />
                      Sexta e Sábado: 10h às 23h<br />
                      Domingo: 14h às 22h
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-video rounded-2xl overflow-hidden bg-muted"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3980.8726565725!2d-37.7065!3d-4.4222!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNMKwMjUnMTkuOSJTIDM3wrA0MicyMy40Ilc!5e0!3m2!1sen!2sbr!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
