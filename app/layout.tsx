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
  title: 'SushiGo Delivery | O Melhor Sushi da Cidade',
  description: 'Peixes selecionados, ingredientes frescos e o verdadeiro sabor da culinaria japonesa na sua casa. Peca agora!',
  keywords: ['sushi', 'delivery', 'sushigo', 'comida japonesa', 'sashimi', 'temaki', 'uramaki'],
  authors: [{ name: 'SushiGo Delivery' }],
  creator: 'SushiGo Delivery',
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://sushigo.com.br',
    title: 'SushiGo Delivery | O Melhor Sushi da Cidade',
    description: 'Peixes selecionados, ingredientes frescos e o verdadeiro sabor da culinaria japonesa.',
    siteName: 'SushiGo Delivery',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SushiGo Delivery | O Melhor Sushi da Cidade',
    description: 'Peixes selecionados, ingredientes frescos e o verdadeiro sabor da culinaria japonesa.',
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
  themeColor: '#D62828',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="bg-background dark" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans antialiased`}>
        <StoreProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            forcedTheme="dark"
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
