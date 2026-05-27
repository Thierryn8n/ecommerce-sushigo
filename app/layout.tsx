import type { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { CartProvider } from '@/contexts/cart-context'
import { ThemeProvider } from '@/components/theme-provider'
import { StoreProvider } from '@/lib/store-context'

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins"
})

export const metadata: Metadata = {
  title: 'Açaí da Praia | O Melhor Açaí com o Sabor do Paraíso',
  description: 'Açaí cremoso, ingredientes selecionados e aquele toque especial que só a gente tem! Peça agora o melhor açaí da região.',
  keywords: ['açaí', 'delivery', 'açaí da praia', 'açaí premium', 'canoa quebrada', 'açaí natural'],
  authors: [{ name: 'Açaí da Praia' }],
  creator: 'Açaí da Praia',
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://acaidapraia.com.br',
    title: 'Açaí da Praia | O Melhor Açaí com o Sabor do Paraíso',
    description: 'Açaí cremoso, ingredientes selecionados e aquele toque especial que só a gente tem!',
    siteName: 'Açaí da Praia',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Açaí da Praia | O Melhor Açaí com o Sabor do Paraíso',
    description: 'Açaí cremoso, ingredientes selecionados e aquele toque especial que só a gente tem!',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#5B1E87',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="bg-background" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans antialiased`}>
        <StoreProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <CartProvider>
              {children}
            </CartProvider>
          </ThemeProvider>
        </StoreProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
