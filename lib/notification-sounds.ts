'use client'

// Gerador de sons de notificação usando Web Audio API
// Não precisa de arquivos externos - gera os sons dinamicamente

class NotificationSoundGenerator {
  private audioContext: AudioContext | null = null

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return this.audioContext
  }

  // Som padrão - duas notas agradáveis
  playDefault(volume = 0.7): void {
    const ctx = this.getContext()
    const now = ctx.currentTime

    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(880, now) // A5
    osc1.frequency.setValueAtTime(1175, now + 0.1) // D6

    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(1318, now) // E6
    osc2.frequency.setValueAtTime(1760, now + 0.1) // A6

    gain.gain.setValueAtTime(volume * 0.3, now)
    gain.gain.exponentialDecayTo(0.01, now + 0.3)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)

    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + 0.3)
    osc2.stop(now + 0.3)
  }

  // Som de gato - miau suave
  playCat(volume = 0.7): void {
    const ctx = this.getContext()
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    // Simula um miau com variação de frequência
    osc.frequency.setValueAtTime(600, now)
    osc.frequency.linearRampToValueAtTime(800, now + 0.1)
    osc.frequency.linearRampToValueAtTime(600, now + 0.2)
    osc.frequency.linearRampToValueAtTime(400, now + 0.4)

    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(volume * 0.4, now + 0.05)
    gain.gain.linearRampToValueAtTime(volume * 0.3, now + 0.2)
    gain.gain.linearRampToValueAtTime(0, now + 0.4)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.4)
  }

  // Som de sino
  playBell(volume = 0.7): void {
    const ctx = this.getContext()
    const now = ctx.currentTime

    const frequencies = [523, 659, 784, 1047] // C5, E5, G5, C6

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now)

      gain.gain.setValueAtTime(volume * 0.2, now + i * 0.05)
      gain.gain.exponentialDecayTo(0.01, now + 0.8 + i * 0.05)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + i * 0.05)
      osc.stop(now + 0.8 + i * 0.05)
    })
  }

  // Som de chime - carrilhão
  playChime(volume = 0.7): void {
    const ctx = this.getContext()
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(1568, now) // G6
    osc.frequency.setValueAtTime(2093, now + 0.15) // C7

    gain.gain.setValueAtTime(volume * 0.4, now)
    gain.gain.exponentialDecayTo(0.01, now + 0.5)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.5)
  }

  // Som de ding simples
  playDing(volume = 0.7): void {
    const ctx = this.getContext()
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(1200, now)

    gain.gain.setValueAtTime(volume * 0.5, now)
    gain.gain.exponentialDecayTo(0.01, now + 0.3)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.3)
  }

  // Som de pop
  playPop(volume = 0.7): void {
    const ctx = this.getContext()
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(400, now)
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.1)

    gain.gain.setValueAtTime(volume * 0.6, now)
    gain.gain.exponentialDecayTo(0.01, now + 0.15)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.15)
  }

  // Método principal para tocar som pelo tipo
  play(type: string, volume = 0.7): void {
    switch (type) {
      case 'cat':
        this.playCat(volume)
        break
      case 'bell':
        this.playBell(volume)
        break
      case 'chime':
        this.playChime(volume)
        break
      case 'ding':
        this.playDing(volume)
        break
      case 'pop':
        this.playPop(volume)
        break
      default:
        this.playDefault(volume)
    }
  }
}

// Polyfill para exponentialDecayTo (não existe nativamente)
declare global {
  interface AudioParam {
    exponentialDecayTo(value: number, endTime: number): AudioParam
  }
}

if (typeof AudioParam !== 'undefined') {
  AudioParam.prototype.exponentialDecayTo = function(value: number, endTime: number) {
    this.exponentialRampToValueAtTime(Math.max(value, 0.0001), endTime)
    return this
  }
}

// Singleton para uso global
let soundGeneratorInstance: NotificationSoundGenerator | null = null

export function getNotificationSoundGenerator(): NotificationSoundGenerator {
  if (typeof window === 'undefined') {
    return null as any
  }
  if (!soundGeneratorInstance) {
    soundGeneratorInstance = new NotificationSoundGenerator()
  }
  return soundGeneratorInstance
}

export type SoundType = 'default' | 'cat' | 'bell' | 'chime' | 'ding' | 'pop'

export const SOUND_OPTIONS: { value: SoundType; label: string; description: string }[] = [
  { value: 'default', label: 'Padrão', description: 'Som clássico de notificação' },
  { value: 'cat', label: 'Gato', description: 'Miau suave e fofo' },
  { value: 'bell', label: 'Sino', description: 'Som de sino melodioso' },
  { value: 'chime', label: 'Carrilhão', description: 'Som de carrilhão elegante' },
  { value: 'ding', label: 'Ding', description: 'Som curto e simples' },
  { value: 'pop', label: 'Pop', description: 'Som de bolha estourando' },
]
