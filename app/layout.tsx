import type { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { CartProvider } from '@/contexts/cart-context'
import { ThemeProvider } from '@/components/theme-provider'
import { StoreProvider } from '@/lib/store-context'
import { RouteAwareNav } from '@/components/route-aware-nav'

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins"
})

export const metadata: Metadata = {
  title: 'SushiGo | Sushi Premium Delivery',
  description: 'Sushi premium acessível. Delivery rápido com visual moderno japonês. Peça agora o melhor sushi da cidade!',
  keywords: ['sushi', 'delivery', 'sushigo', 'sushi premium', 'japonês', 'delivery sushi', 'sashimi', 'nigiri', 'maki'],
  authors: [{ name: 'SushiGo' }],
  creator: 'SushiGo',
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://sushigo.com.br',
    title: 'SushiGo | Sushi Premium Delivery',
    description: 'Sushi premium acessível. Delivery rápido com visual moderno japonês.',
    siteName: 'SushiGo',
    images: [{
      url: '/apple-icon.png',
      width: 512,
      height: 512,
      alt: 'SushiGo Logo',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SushiGo | Sushi Premium Delivery',
    description: 'Sushi premium acessível. Delivery rápido com visual moderno japonês.',
    images: ['/apple-icon.png'],
  },
  // favicon.ico e icon.png na pasta app/ são detectados automaticamente pelo Next.js
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
    <html lang="pt-BR" className="bg-background" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans antialiased`}>
        <StoreProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <CartProvider>
              <div className="lg:pb-0 pb-20">
                {children}
              </div>
              <RouteAwareNav />
            </CartProvider>
          </ThemeProvider>
        </StoreProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
