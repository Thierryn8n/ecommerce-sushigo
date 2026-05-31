import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const exePath = path.join(process.cwd(), 'public', 'downloads', 'sushigo-printer-setup.exe')

    if (!fs.existsSync(exePath)) {
      return NextResponse.json({ error: 'Instalador nao encontrado' }, { status: 404 })
    }

    const fileBuffer = fs.readFileSync(exePath)

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="SushiGo Printer Setup.exe"',
        'Content-Length': String(fileBuffer.length)
      }
    })
  } catch (error) {
    console.error('Erro ao servir instalador:', error)
    return NextResponse.json({ error: 'Erro ao baixar instalador' }, { status: 500 })
  }
}
