"use client"

import { motion } from 'framer-motion'
import { ChevronDown, Sparkles } from 'lucide-react'

export function HeroTransition() {
  return (
    <div className="relative -mt-20 sm:-mt-24 z-20">
      {/* Onda orgânica com gradiente */}
      <div className="w-full overflow-hidden">
        <svg
          viewBox="0 0 1440 120"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-20 sm:h-28 md:h-32 block"
        >
          <defs>
            {/* Gradiente principal - roxo para laranja */}
            <linearGradient id="heroWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="30%" stopColor="hsl(var(--primary))" />
              <stop offset="70%" stopColor="hsl(var(--secondary))" />
              <stop offset="100%" stopColor="hsl(var(--secondary))" />
            </linearGradient>
            {/* Gradiente de brilho */}
            <linearGradient id="heroShineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.3" />
              <stop offset="50%" stopColor="white" stopOpacity="0.1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            {/* Filtro de sombra */}
            <filter id="heroWaveShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="-4" stdDeviation="8" floodColor="hsl(var(--primary))" floodOpacity="0.4" />
            </filter>
          </defs>
          
          {/* Camada de sombra */}
          <path
            d="M0,40 Q180,10 360,50 T720,30 T1080,60 T1440,40 L1440,120 L0,120 Z"
            fill="hsl(var(--primary) / 0.15)"
            transform="translate(0, 8)"
          />
          
          {/* Onda principal */}
          <path
            d="M0,40 Q180,10 360,50 T720,30 T1080,60 T1440,40 L1440,120 L0,120 Z"
            fill="url(#heroWaveGrad)"
            filter="url(#heroWaveShadow)"
          />
          
          {/* Brilho na crista da onda */}
          <path
            d="M0,42 Q180,12 360,52 T720,32 T1080,62 T1440,42"
            fill="none"
            stroke="url(#heroShineGrad)"
            strokeWidth="3"
          />
        </svg>
      </div>

      {/* Barra central flutuante com call-to-action */}
      <div className="relative bg-gradient-to-r from-primary via-primary/95 to-secondary">
        {/* Padrão decorativo de fundo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px),
                              radial-gradient(circle at 80% 50%, white 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        {/* Conteúdo central */}
        <div className="relative py-4 sm:py-5 px-4">
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8">
            {/* Badge animado esquerda */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="flex items-center gap-2"
            >
              <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-white/90 text-xs sm:text-sm font-medium tracking-wide">
                Ingredientes Selecionados
              </span>
            </motion.div>

            {/* Separador */}
            <div className="hidden sm:block w-px h-6 bg-white/30" />

            {/* Texto principal central */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="flex items-center gap-3"
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <ChevronDown className="w-5 h-5 text-secondary sm:text-white" />
              </motion.div>
              <span className="text-white font-bold text-sm sm:text-base tracking-wider uppercase">
                Descubra Nossos Sabores
              </span>
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <ChevronDown className="w-5 h-5 text-secondary sm:text-white" />
              </motion.div>
            </motion.div>

            {/* Separador */}
            <div className="hidden sm:block w-px h-6 bg-white/30" />

            {/* Badge animado direita */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex items-center gap-2"
            >
              <span className="text-white/90 text-xs sm:text-sm font-medium tracking-wide">
                100% Natural
              </span>
              <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Linha de brilho inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      </div>

      {/* Onda inferior invertida para transição suave */}
      <div className="w-full overflow-hidden leading-none rotate-180">
        <svg
          viewBox="0 0 1440 80"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-12 sm:h-16 md:h-20 block"
        >
          <defs>
            <linearGradient id="heroWaveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--secondary))" />
              <stop offset="50%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--secondary))" />
            </linearGradient>
          </defs>
          <path
            d="M0,20 Q360,70 720,30 T1440,50 L1440,80 L0,80 Z"
            fill="url(#heroWaveGrad2)"
          />
        </svg>
      </div>
    </div>
  )
}
