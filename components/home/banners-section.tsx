"use client"

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Banner } from '@/lib/types'

export function BannersSection() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBanners() {
      const supabase = createClient()
      const now = new Date().toISOString()
      
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .or(`start_date.is.null,start_date.lte.${now}`)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order('display_order')

      if (!error && data && data.length > 0) {
        setBanners(data)
      }
      setLoading(false)
    }

    fetchBanners()
  }, [])

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }, [banners.length])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }, [banners.length])

  // Auto-slide
  useEffect(() => {
    if (banners.length <= 1) return
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [banners.length, nextSlide])

  if (loading || banners.length === 0) {
    return null
  }

  const currentBanner = banners[currentIndex]

  return (
    <section className="py-6 sm:py-8 md:py-12 bg-background">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="relative w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[3/1]"
              style={{ backgroundColor: currentBanner.background_color || undefined }}
            >
              {/* Background Image */}
              {currentBanner.image_url && (
                <Image
                  src={currentBanner.image_url}
                  alt={currentBanner.title || 'Banner'}
                  fill
                  className="object-cover"
                  priority
                />
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

              {/* Floating Image */}
              {currentBanner.floating_image_url && (
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="absolute right-2 sm:right-6 md:right-10 lg:right-16 bottom-0 top-0 flex items-center justify-center pointer-events-none z-20 hidden sm:flex"
                >
                  <motion.div
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-52 md:h-52 lg:w-64 lg:h-64"
                  >
                    <Image
                      src={currentBanner.floating_image_url}
                      alt=""
                      fill
                      className="object-contain drop-shadow-2xl"
                      priority
                    />
                  </motion.div>
                </motion.div>
              )}

              {/* Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="w-full max-w-2xl px-4 sm:px-6 md:px-12 py-4 sm:py-6">
                  {currentBanner.subtitle && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-secondary text-xs sm:text-sm font-semibold tracking-wider mb-1 sm:mb-2"
                    >
                      {currentBanner.subtitle}
                    </motion.p>
                  )}
                  
                  {currentBanner.title && (
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-black text-white mb-2 sm:mb-4 leading-tight"
                    >
                      {currentBanner.title}
                    </motion.h2>
                  )}
                  
                  {currentBanner.description && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-white/80 text-xs sm:text-sm md:text-base mb-3 sm:mb-6 max-w-lg line-clamp-2 sm:line-clamp-none"
                    >
                      {currentBanner.description}
                    </motion.p>
                  )}
                  
                  {currentBanner.link_url && currentBanner.button_text && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Link href={currentBanner.link_url}>
                        <Button 
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full"
                        >
                          {currentBanner.button_text}
                          <ArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          {banners.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {banners.length > 1 && (
            <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all ${
                    index === currentIndex 
                      ? 'bg-primary w-6 sm:w-8' 
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
