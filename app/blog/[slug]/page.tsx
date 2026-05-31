"use client"

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react'
import Header from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'

const blogPosts: Record<string, any> = {
  'beneficios-do-sushi': {
    title: 'Os Benefícios do Sushi para a Saúde',
    excerpt: 'Descubra como o sushi pode melhorar sua saúde com ômega-3, proteínas magras e nutrientes essenciais.',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=1200',
    date: '2024-01-15',
    readTime: '5 min',
    category: 'Saúde',
    content: `
      <p class="mb-4">O sushi é uma delícia japonesa que conquistou o mundo não apenas pelo seu sabor excepcional, mas também pelos seus inúmeros benefícios para a saúde. Rico em ômega-3, proteínas magras e nutrientes essenciais, o sushi é considerado uma das refeições mais completas.</p>
      
      <h2 class="text-2xl font-bold text-white mb-4 mt-8">Rico em Ômega-3</h2>
      <p class="mb-4">O peixe cru utilizado no sushi, especialmente o salmão e o atum, é uma das melhores fontes de ácidos graxos ômega-3. Esses nutrientes são essenciais para a saúde do cérebro, reduzem inflamações e protegem o coração.</p>
      
      <h2 class="text-2xl font-bold text-white mb-4 mt-8">Proteína Magra</h2>
      <p class="mb-4">O sushi fornece proteínas de alta qualidade, essenciais para a construção e reparo dos músculos. Diferente de outras fontes de proteína, o peixe é pobre em gorduras saturadas, tornando-se ideal para quem busca uma alimentação saudável.</p>
      
      <h2 class="text-2xl font-bold text-white mb-4 mt-8">Baixo em Calorias</h2>
      <p class="mb-4">Um prato de sushi tradicional tem aproximadamente 200-300 calorias, tornando-se uma opção perfeita para quem deseja manter o peso ou seguir uma dieta equilibrada. O arroz japonês é também de fácil digestão.</p>
      
      <h2 class="text-2xl font-bold text-white mb-4 mt-8">Vitaminas e Minerais</h2>
      <p class="mb-4">O sushi é rico em vitaminas do complexo B, vitamina D, selênio, iodo e zinco. O alga nori utilizada nos rolos é uma excelente fonte de iodo, essencial para a saúde da tireoide.</p>
      
      <h2 class="text-2xl font-bold text-white mb-4 mt-8">Saúde Cardiovascular</h2>
      <p class="mb-4">Estudos demonstram que o consumo regular de peixe, como no sushi, pode reduzir em até 36% o risco de doenças cardíacas, graças aos ácidos graxos e antioxidantes presentes.</p>
    `,
  },
  'guia-sushi-iniciantes': {
    title: 'Guia Completo: Sushi para Iniciantes',
    excerpt: 'Aprenda tudo sobre sushi - tipos, como comer, etiqueta japonesa e dicas para aproveitar melhor sua experiência.',
    image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=1200',
    date: '2024-01-10',
    readTime: '8 min',
    category: 'Guia',
    content: `
      <p class="mb-4">Se você é novo no mundo do sushi, este guia é para você! Vamos desmistificar os diferentes tipos de sushi, ensinar a etiqueta japonesa e dar dicas para você aproveitar ao máximo essa experiência gastronômica única.</p>
      
      <h2 class="text-2xl font-bold text-white mb-4 mt-8">Tipos de Sushi</h2>
      <ul class="list-disc list-inside mb-4 text-white/70 space-y-2">
        <li><strong>Nigiri:</strong> Bolinho de arroz com peixe por cima</li>
        <li><strong>Maki:</strong> Rolo de arroz e recheio envolto em alga</li>
        <li><strong>Sashimi:</strong> Fatias de peixe cru, sem arroz</li>
        <li><strong>Temaki:</strong> Cone de alga recheado com arroz e peixe</li>
        <li><strong>Uramaki:</strong> "Rolo invertido" com arroz por fora</li>
      </ul>
      
      <h2 class="text-2xl font-bold text-white mb-4 mt-8">Como Comer Sushi</h2>
      <ol class="list-decimal list-inside mb-4 text-white/70 space-y-2">
        <li>Use hashi (palitinhos) ou as mãos - ambos são aceitos</li>
        <li>Molhe o peixe, não o arroz, no shoyu</li>
        <li>Coma o sushi inteiro de uma vez, não parti-lo</li>
        <li>Consuma logo após ser servido para melhor frescor</li>
        <li>O gengibre servido é para limpar o paladar entre peças</li>
      </ol>
      
      <h2 class="text-2xl font-bold text-white mb-4 mt-8">Dicas Extras</h2>
      <p class="mb-4">Não misture wasabi diretamente no shoyu - aplique uma pequena quantidade sobre o peixe. O sushi deve ser consumido em temperatura ambiente, não gelado. Peça sempre ao sushiman recomendações do dia!</p>
    `,
  },
}

import React from 'react'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = React.use(params)
  const post = blogPosts[resolvedParams.slug]

  if (!post) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-[#120018]">
      <Header />
      
      {/* Hero Image */}
      <section className="relative h-[400px]">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#120018] to-transparent" />
      </section>

      {/* Article Content */}
      <section className="container mx-auto px-4 -mt-20 relative z-10 pb-16">
        <Link href="/blog" className="inline-flex items-center text-white/70 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar ao Blog
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl"
        >
          <div className="flex items-center gap-4 mb-4">
            <span className="px-3 py-1 bg-[#D62828] text-white text-xs font-semibold rounded-full">
              {post.category}
            </span>
            <div className="flex items-center gap-4 text-sm text-white/50">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(post.date).toLocaleDateString('pt-BR')}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">{post.title}</h1>
          <p className="text-xl text-white/70 mb-8">{post.excerpt}</p>

          <div className="flex items-center justify-between mb-8 pb-8 border-b border-[#3a2a45]">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-[#3a2a45] text-white hover:bg-[#2a1a35]">
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>

          <div 
            className="prose prose-invert prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </motion.div>
      </section>

      <Footer />
    </main>
  )
}
