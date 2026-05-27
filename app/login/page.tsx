"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (signInError) throw signInError
        router.push('/cardapio')
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('As senhas não conferem')
        }

        const { error: signUpError, data } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
            },
            emailRedirectTo:
              process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
              `${window.location.origin}/auth/callback`,
          },
        })

        if (signUpError) throw signUpError

        setError(
          'Conta criada! Verifique seu email para confirmar antes de fazer pedidos.'
        )
        setFormData({ name: '', email: '', password: '', confirmPassword: '' })
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar solicitação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl p-8 border border-border"
        >
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20a%C3%A7a%C3%AD%20da%20praia%20sem%20fundo-f7nqFBR8xSzITFhI7km23gMgUdIh6o.png"
              alt="Açaí da Praia"
              width={100}
              height={100}
            />
          </div>

          {/* Toggle */}
          <div className="flex bg-muted rounded-full p-1 mb-8">
            <button
              onClick={() => {
                setIsLogin(true)
                setError('')
              }}
              className={`flex-1 py-3 rounded-full text-sm font-semibold transition-all ${
                isLogin ? 'bg-[#FF8C00] text-white' : 'text-muted-foreground'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => {
                setIsLogin(false)
                setError('')
              }}
              className={`flex-1 py-3 rounded-full text-sm font-semibold transition-all ${
                !isLogin ? 'bg-[#FF8C00] text-white' : 'text-muted-foreground'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {error && (
            <div className={`p-4 rounded-lg text-sm ${error.includes('criada') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-muted-foreground text-sm mb-2 block">Nome completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Seu nome"
                    className="pl-10 bg-muted border-border text-foreground"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-muted-foreground text-sm mb-2 block">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seu@email.com"
                  className="pl-10 bg-muted border-border text-foreground"
                />
              </div>
            </div>

            <div>
              <label className="text-muted-foreground text-sm mb-2 block">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="********"
                  className="pl-10 pr-10 bg-muted border-border text-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="text-muted-foreground text-sm mb-2 block">Confirmar Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="********"
                    className="pl-10 bg-muted border-border text-foreground"
                  />
                </div>
              </div>
            )}

            {isLogin && (
              <div className="text-right">
                <Link href="/esqueci-senha" className="text-[#FF8C00] text-sm hover:text-[#FFC300] transition-colors">
                  Esqueci minha senha
                </Link>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF8C00] hover:bg-[#FFC300] text-white font-bold py-3 rounded-full mt-6 disabled:opacity-50"
            >
              {loading ? 'Processando...' : isLogin ? 'Entrar' : 'Criar Conta'}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted-foreground text-sm">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Social Login */}
          <Button
            variant="outline"
            className="w-full border-border text-foreground hover:bg-muted rounded-full"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuar com Google
          </Button>
        </motion.div>

        {/* Admin Link */}
        <div className="text-center mt-6">
          <Link href="/login-adm" className="text-muted-foreground text-sm hover:text-foreground transition-colors">
            Acesso Administrativo
          </Link>
        </div>
      </div>
    </main>
  )
}
