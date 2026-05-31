"use client"

// Metadata removido - não compatível com 'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import Header from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'

const blogPosts = [
  {
    id: 1,
    title: 'Os Benefícios do Açaí para a Saúde',
    excerpt: 'Descubra como o açaí pode melhorar sua saúde com antioxidantes, fibras e nutrientes essenciais para o corpo.',
    image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800',
    date: '2024-01-15',
    readTime: '5 min',
    category: 'Saúde',
    slug: 'beneficios-do-acai',
  },
  {
    id: 2,
    title: 'Receita: Açaí Fit em Casa',
    excerpt: 'Aprenda a fazer um açaí fit delicioso e saudável na sua casa com ingredientes simples e acessíveis.',
    image: 'https://images.unsplash.com/photo-1590089159943-8b9c3e3e1c9c?w=800',
    date: '2024-01-10',
    readTime: '8 min',
    category: 'Receitas',
    slug: 'acai-fit-em-casa',
  },
  {
    id: 3,
    title: 'A História do Açaí na Amazônia',
    excerpt: 'Conheça a origem e a tradição do açaí na cultura amazônica e como se tornou popular no mundo todo.',
    image: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=800',
    date: '2024-01-05',
    readTime: '6 min',
    category: 'História',
    slug: 'historia-do-acai',
  },
  {
    id: 4,
    title: '5 Dicas para Montar o Açaí Perfeito',
    excerpt: 'Aprenda técnicas profissionais para montar seu açaí como um especialista e impressionar seus amigos.',
    image: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=800',
    date: '2024-01-01',
    readTime: '4 min',
    category: 'Dicas',
    slug: 'dicas-acai-perfeito',
  },
  {
    id: 5,
    title: 'Açaí: Energia Natural para o Seu Dia',
    excerpt: 'Descubra como o açaí pode ser a fonte perfeita de energia para seus treinos e rotina diária.',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800',
    date: '2023-12-28',
    readTime: '5 min',
    category: 'Nutrição',
    slug: 'acai-energia-natural',
  },
  {
    id: 6,
    title: 'Combinações de Toppings que Você Precisa Experimentar',
    excerpt: 'Explore combinações criativas de toppings para elevar seu açaí a um novo nível de sabor.',
    image: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=800',
    date: '2023-12-20',
    readTime: '7 min',
    category: 'Dicas',
    slug: 'combinacoes-toppings',
  },
]

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#120018]">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-28 pb-16 bg-gradient-to-b from-[#5B1E87]/30 to-[#120018]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Nosso <span className="text-[#FFC300]">Blog</span>
            </h1>
            <p className="text-white/70 max-w-2xl mx-auto">
              Notícias, receitas e tudo sobre o mundo do açaí. Fique por dentro das novidades!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/blog/${post.slug}`}>
                  <div className="bg-[#1a0a25] border border-[#3a2a45] rounded-2xl overflow-hidden hover:border-[#8A2BE2] transition-all hover:scale-[1.02] group">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-[#FF8C00] text-white text-xs font-semibold rounded-full">
                          {post.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-4 text-sm text-white/50 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(post.date).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.readTime}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#FFC300] transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-white/60 text-sm mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center text-[#FFC300] font-semibold text-sm group-hover:gap-2 transition-all">
                        Ler mais
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
