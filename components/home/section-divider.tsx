"use client"

import { motion } from 'framer-motion'

const items = [
  { text: 'AÇAÍ DA PRAIA', icon: '🌊' },
  { text: 'SABOR QUE TRANSPORTA', icon: '🫐' },
  { text: 'INGREDIENTES SELECIONADOS', icon: '🌿' },
  { text: 'FEITO COM AMOR', icon: '❤️' },
  { text: 'PRAIA & AÇAÍ', icon: '☀️' },
  { text: 'CREMOSO & GELADO', icon: '✨' },
  // duplicados para loop contínuo
  { text: 'AÇAÍ DA PRAIA', icon: '🌊' },
  { text: 'SABOR QUE TRANSPORTA', icon: '🫐' },
  { text: 'INGREDIENTES SELECIONADOS', icon: '🌿' },
  { text: 'FEITO COM AMOR', icon: '❤️' },
  { text: 'PRAIA & AÇAÍ', icon: '☀️' },
  { text: 'CREMOSO & GELADO', icon: '✨' },
]

export function SectionDivider() {
  return (
    <div className="relative z-10 -mt-1">
      {/* Onda SVG que corta o hero */}
      <div className="w-full overflow-hidden leading-none">
        <svg
          viewBox="0 0 1440 60"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-10 sm:h-14 md:h-16 block"
        >
          <defs>
            <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="50%" stopColor="hsl(var(--secondary))" />
              <stop offset="100%" stopColor="hsl(var(--primary))" />
            </linearGradient>
          </defs>
          {/* Sombra/profundidade atrás */}
          <path
            d="M0,0 C240,55 480,5 720,35 C960,65 1200,10 1440,40 L1440,60 L0,60 Z"
            fill="hsl(var(--primary) / 0.25)"
          />
          {/* Onda principal */}
          <path
            d="M0,0 C240,50 480,0 720,30 C960,60 1200,5 1440,35 L1440,60 L0,60 Z"
            fill="url(#waveGrad)"
          />
        </svg>
      </div>

      {/* Faixa de marquee */}
      <div className="bg-gradient-to-r from-primary via-secondary to-primary overflow-hidden py-2.5 sm:py-3">
        <motion.div
          className="flex gap-0 whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {items.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 px-5 sm:px-7 text-primary-foreground font-black text-xs sm:text-sm tracking-widest uppercase"
            >
              <span className="text-base sm:text-lg leading-none select-none" aria-hidden>{item.icon}</span>
              {item.text}
              <span className="text-primary-foreground/40 text-lg font-light mx-1">|</span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* Segunda onda invertida para a próxima seção */}
      <div className="w-full overflow-hidden leading-none">
        <svg
          viewBox="0 0 1440 60"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-10 sm:h-14 md:h-16 block"
        >
          <defs>
            <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="50%" stopColor="hsl(var(--secondary))" />
              <stop offset="100%" stopColor="hsl(var(--primary))" />
            </linearGradient>
          </defs>
          {/* Sombra/profundidade */}
          <path
            d="M0,20 C240,5 480,55 720,25 C960,0 1200,50 1440,20 L1440,0 L0,0 Z"
            fill="hsl(var(--secondary) / 0.2)"
          />
          {/* Onda principal invertida */}
          <path
            d="M0,25 C240,10 480,60 720,28 C960,0 1200,55 1440,22 L1440,0 L0,0 Z"
            fill="url(#waveGrad2)"
          />
        </svg>
      </div>
    </div>
  )
}
