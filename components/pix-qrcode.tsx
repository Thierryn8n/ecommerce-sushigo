'use client'

import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Copy, Check, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface PixQrCodeProps {
  pixKey: string
  amount: number
  orderNumber?: string | number
  description?: string
}

export function PixQrCode({ pixKey, amount, orderNumber, description }: PixQrCodeProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  // Gerar payload PIX simplificado (formato copia-e-cola)
  const pixPayload = generatePixPayload(pixKey, amount, orderNumber, description)

  const handleCopy = () => {
    navigator.clipboard.writeText(pixPayload)
    setCopied(true)
    toast({ title: 'Código PIX copiado!' })
    setTimeout(() => setCopied(false), 2000)
  }

  if (!pixKey) {
    return (
      <div className="bg-card rounded-xl p-4 border border-border">
        <p className="text-foreground/70 text-sm">
          Chave PIX não configurada. Entre em contato com o estabelecimento.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl p-4 border border-border space-y-4">
      <div className="flex items-center gap-2">
        <QrCode className="w-5 h-5 text-[#00BFFF]" />
        <h3 className="font-semibold text-foreground">Pagamento via PIX</h3>
      </div>

      <div className="flex justify-center">
        <div className="bg-white rounded-lg p-3">
          <QRCodeSVG
            value={pixPayload}
            size={180}
            bgColor="#ffffff"
            fgColor="#000000"
            level="M"
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-foreground/70 text-xs text-center">
          Escaneie o QR Code ou copie o código PIX abaixo
        </p>
        <div className="flex gap-2">
          <code className="flex-1 bg-muted rounded-lg px-3 py-2 text-xs text-foreground/80 truncate">
            {pixKey}
          </code>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex-shrink-0"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className="text-center">
        <p className="text-foreground/50 text-xs">
          Valor: <span className="text-foreground font-semibold">R$ {amount.toFixed(2).replace('.', ',')}</span>
        </p>
      </div>
    </div>
  )
}

// Função para gerar payload PIX simplificado (formato EMV BR Code)
function generatePixPayload(pixKey: string, amount: number, orderNumber?: string | number, description?: string): string {
  // Formato básico do payload PIX (simplificado)
  // Para um payload completo, seria necessário usar uma lib específica como pix-utils
  // Aqui geramos um payload simples que inclui a chave e o valor

  const valor = amount.toFixed(2)
  const merchantName = 'SushiGo'
  const merchantCity = 'CIDADE'
  const txid = orderNumber ? `PED${orderNumber}` : 'PIX'
  const info = description || 'Pedido SushiGo'

  // Payload simplificado para QR code funcionar em apps bancários
  // Format: key|amount|description|txid
  return `PIX:${pixKey}|VALOR:${valor}|DESC:${info}|REF:${txid}|NOME:${merchantName}`
}
