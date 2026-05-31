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
    title: 'Os Benefícios do Sushi para a Saúde',
    excerpt: 'Descubra como o sushi pode melhorar sua saúde com ômega-3, proteínas magras e nutrientes essenciais.',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800',
    date: '2024-01-15',
    readTime: '5 min',
    category: 'Saúde',
    slug: 'beneficios-do-sushi',
  },
  {
    id: 2,
    title: 'Guia: Como Comer Sushi Como um Profissional',
    excerpt: 'Aprenda a etiqueta japonesa para comer sushi, desde como usar os hashis até a ordem correta das peças.',
    image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800',
    date: '2024-01-10',
    readTime: '8 min',
    category: 'Cultura',
    slug: 'como-comer-sushi',
  },
  {
    id: 3,
    title: 'A História do Sushi no Japão',
    excerpt: 'Conheça a origem e a evolução do sushi, desde uma forma de conservar peixe até a arte culinária mundial.',
    image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=800',
    date: '2024-01-05',
    readTime: '6 min',
    category: 'História',
    slug: 'historia-do-sushi',
  },
  {
    id: 4,
    title: '5 Dicas para Escolher o Melhor Sushi',
    excerpt: 'Aprenda a identificar sushi de qualidade e como escolher as melhores peças no cardápio.',
    image: 'https://images.unsplash.com/photo-1559410545-0bdcd187e0a6?w=800',
    date: '2024-01-01',
    readTime: '4 min',
    category: 'Dicas',
    slug: 'dicas-escolher-sushi',
  },
  {
    id: 5,
    title: 'Sashimi vs Nigiri: Qual a Diferença?',
    excerpt: 'Entenda as diferenças entre os principais tipos de sushi e quando escolher cada um.',
    image: 'https://images.unsplash.com/photo-1534256958597-7fe685cbd745?w=800',
    date: '2023-12-28',
    readTime: '5 min',
    category: 'Guia',
    slug: 'sashimi-vs-nigiri',
  },
  {
    id: 6,
    title: 'Combinações de Molhos que Você Precisa Experimentar',
    excerpt: 'Explore combinações de molhos tradicionais japoneses para elevar seu sushi a um novo nível de sabor.',
    image: 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=800',
    date: '2023-12-20',
    readTime: '7 min',
    category: 'Dicas',
    slug: 'combinacoes-molhos',
  },
]

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#111111]">
      <Header />

      {/* Hero Section */}
      <section className="pt-28 pb-16 bg-gradient-to-b from-[#D62828]/20 to-[#111111]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Nosso <span className="text-[#D4A017]">Blog</span>
            </h1>
            <p className="text-white/70 max-w-2xl mx-auto">
              Notícias, curiosidades e tudo sobre o mundo do sushi. Fique por dentro das novidades!
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
                  <div className="bg-[#1C1C1C] border border-[#333333] rounded-2xl overflow-hidden hover:border-[#D62828] transition-all hover:scale-[1.02] group">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-[#D62828] text-white text-xs font-semibold rounded-full">
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
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#D4A017] transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-white/60 text-sm mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center text-[#D4A017] font-semibold text-sm group-hover:gap-2 transition-all">
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
