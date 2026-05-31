"use client"

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react'
import Header from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'

const blogPosts: Record<string, any> = {
  'beneficios-do-acai': {
    title: 'Os Benefícios do Açaí para a Saúde',
    excerpt: 'Descubra como o açaí pode melhorar sua saúde com antioxidantes, fibras e nutrientes essenciais para o corpo.',
    image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=1200',
    date: '2024-01-15',
    readTime: '5 min',
    category: 'Saúde',
    content: `
      <p class="mb-4">O açaí é uma fruta nativa da Amazônia que conquistou o mundo não apenas pelo seu sabor delicioso, mas também pelos seus inúmeros benefícios para a saúde. Rico em antioxidantes, fibras e nutrientes essenciais, o açaí é considerado um superalimento.</p>
      
      <h2 class="text-2xl font-bold text-white mb-4 mt-8">Antioxidantes Poderosos</h2>
      <p class="mb-4">O açaí é uma das fontes mais ricas em antioxidantes, especialmente antocianinas, que ajudam a combater os radicais livres e protegem as células contra danos oxidativos.</p>
      
      <h2 class="text-2xl font-bold text-white mb-4 mt-8">Rico em Fibras</h2>
      <p class="mb-4">Com alto teor de fibras, o açaí auxilia na digestão, promove saciedade e ajuda a manter o peso saudável. As fibras também contribuem para a saúde intestinal.</p>
      
      <h2 class="text-2xl font-bold text-white mb-4 mt-8">Fonte de Energia</h2>
      <p class="mb-4">O açaí é uma excelente fonte de energia natural, ideal para pré-treino ou para começar o dia com disposição. Seus carboidratos complexos fornecem energia sustentada.</p>
      
      <h2 class="text-2xl font-bold text-white mb-4 mt-8">Vitaminas e Minerais</h2>
      <p class="mb-4">Rico em vitaminas A, C, E e do complexo B, além de minerais como ferro, cálcio e potássio, o açaí contribui para a saúde geral do organismo.</p>
      
      <h2 class="text-2xl font-bold text-white mb-4 mt-8">Saúde Cardiovascular</h2>
      <p class="mb-4">Estudos sugerem que o consumo regular de açaí pode ajudar a reduzir o colesterol ruim e melhorar a saúde cardiovascular, graças aos seus compostos bioativos.</p>
    `,
  },
  'acai-fit-em-casa': {
    title: 'Receita: Açaí Fit em Casa',
    excerpt: 'Aprenda a fazer um açaí fit delicioso e saudável na sua casa com ingredientes simples e acessíveis.',
    image: 'https://images.unsplash.com/photo-1590089159943-8b9c3e3e1c9c?w=1200',
    date: '2024-01-10',
    readTime: '8 min',
    category: 'Receitas',
    content: `
      <p class="mb-4">Fazer açaí fit em casa é mais simples do que você imagina! Com ingredientes acessíveis e um liquidificador, você pode preparar um açaí delicioso e saudável em minutos.</p>
      
      <h2 class="text-2xl font-bold text-white mb-4 mt-8">Ingredientes</h2>
      <ul class="list-disc list-inside mb-4 text-white/70 space-y-2">
        <li>200g de polpa de açaí</li>
        <li>1 banana congelada</li>
        <li>100ml de água de coco</li>
        <li>1 colher de mel (opcional)</li>
        <li>Granola para topping</li>
        <li>Frutas frescas (morango, banana, etc.)</li>
      </ul>
      
      <h2 class="text-2xl font-bold text-white mb-4 mt-8">Modo de Preparo</h2>
      <ol class="list-decimal list-inside mb-4 text-white/70 space-y-2">
        <li>Bata a polpa de açaí com a banana congelada no liquidificador</li>
        <li>Adicione a água de coco aos poucos até atingir a consistência desejada</li>
        <li>Se preferir mais doce, adicione o mel</li>
        <li>Coloque em uma tigela e adicione os toppings</li>
        <li>Sirva imediatamente</li>
      </ol>
      
      <h2 class="text-2xl font-bold text-white mb-4 mt-8">Dicas Extras</h2>
      <p class="mb-4">Para deixar seu açaí ainda mais proteico, você pode adicionar whey protein ou pasta de amendoim. Experimente diferentes combinações de frutas e toppings!</p>
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
            <span className="px-3 py-1 bg-[#FF8C00] text-white text-xs font-semibold rounded-full">
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
