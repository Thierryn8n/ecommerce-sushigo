"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Shield, Loader2, User, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/lib/store-context'

export default function AdminLoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const { store } = useStore()
  
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null)
  const [checkingAdmin, setCheckingAdmin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function checkAdminExists() {
      try {
        const { data: admin, error } = await supabase
          .from('profiles')
          .select('id, is_admin, email')
          .eq('is_admin', true)
          .maybeSingle()

        if (error) {
          const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('is_admin', true)
          setHasAdmin(count !== null && count > 0)
        } else {
          setHasAdmin(!!admin)
        }
      } catch {
        setHasAdmin(true)
      } finally {
        setCheckingAdmin(false)
      }
    }
    checkAdminExists()
  }, [supabase])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      })

      if (signInError) throw signInError

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError) throw profileError

      if (!profile.is_admin) {
        await supabase.auth.signOut()
        setError('Voce nao tem permissao de administrador')
        return
      }

      if (!profile.is_approved) {
        await supabase.auth.signOut()
        setError('Seu acesso ainda nao foi aprovado pelo dono da loja')
        return
      }

      router.push('/admin')
    } catch (error: any) {
      setError(error.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!registerData.fullName || !registerData.email || !registerData.phone || !registerData.password) {
      setError('Todos os campos sao obrigatorios')
      return
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError('As senhas nao coincidem')
      return
    }

    if (registerData.password.length < 6) {
      setError('A senha deve ter no minimo 6 caracteres')
      return
    }

    try {
      setLoading(true)

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          data: {
            full_name: registerData.fullName,
            phone: registerData.phone,
          },
        },
      })

      if (authError) {
        if (authError.message?.includes('already registered')) {
          throw new Error('Este email ja esta cadastrado. Tente fazer login.')
        }
        throw new Error(authError.message || 'Erro ao criar usuario')
      }

      if (authData.user) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        await supabase
          .from('profiles')
          .update({
            is_admin: true,
            is_approved: true,
            is_owner: true,
            role: 'admin',
          })
          .eq('id', authData.user.id)
        
        setSuccess(true)
        setTimeout(() => {
          router.push('/login-adm?message=verify-email')
        }, 3000)
      }
    } catch (error: any) {
      setError(error.message || 'Erro ao cadastrar administrador')
    } finally {
      setLoading(false)
    }
  }

  if (checkingAdmin) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando sistema...</p>
        </div>
      </main>
    )
  }

  if (success) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-2xl p-8 border border-border max-w-md w-full text-center"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Cadastro Realizado!</h2>
          <p className="text-muted-foreground mb-4">
            Primeiro administrador cadastrado com sucesso!
          </p>
          
          <div className="mb-6 p-4 bg-accent/20 border border-accent/30 rounded-xl">
            <p className="text-accent text-sm font-medium mb-1">Atencao</p>
            <p className="text-foreground/80 text-sm">
              Enviamos um email de confirmacao para <strong>{registerData.email}</strong>
            </p>
            <p className="text-muted-foreground text-xs mt-2">
              Clique no link do email para ativar sua conta antes de fazer login.
            </p>
          </div>
          
          <Link href="/login-adm">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-full">
              Ir para Login
            </Button>
          </Link>
        </motion.div>
      </main>
    )
  }

  // Register Mode
  if (hasAdmin === false) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar ao Site
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-8 border border-border"
          >
            <div className="flex justify-center mb-6">
              <Image
                src="/images/logo-sushigo.png"
                alt="SushiGo"
                width={160}
                height={64}
                className="object-contain"
              />
            </div>

            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">Primeiro Acesso</h1>
              </div>
              <p className="text-muted-foreground text-sm">
                Cadastre o primeiro administrador do sistema
              </p>
              <div className="mt-3 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full inline-block">
                <span className="text-green-400 text-xs">Aprovacao automatica</span>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/20 border border-destructive/50 rounded-lg p-3 mb-6">
                <p className="text-destructive text-sm text-center">{error}</p>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-muted-foreground text-sm mb-2 block">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    value={registerData.fullName}
                    onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                    placeholder="Joao Silva"
                    className="pl-10 bg-muted border-border text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="text-muted-foreground text-sm mb-2 block">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    placeholder="admin@loja.com"
                    className="pl-10 bg-muted border-border text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="text-muted-foreground text-sm mb-2 block">Telefone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="tel"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                    placeholder="(00) 0 0000-0000"
                    className="pl-10 bg-muted border-border text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="text-muted-foreground text-sm mb-2 block">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    placeholder="********"
                    className="pl-10 pr-10 bg-muted border-border text-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-muted-foreground text-sm mb-2 block">Confirmar Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    placeholder="********"
                    className="pl-10 bg-muted border-border text-foreground"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-full mt-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  'Cadastrar e Acessar'
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-muted rounded-xl">
              <p className="text-muted-foreground text-xs text-center">
                Como e o primeiro acesso, voce sera cadastrado como <strong className="text-foreground">dono da loja</strong> com aprovacao automatica.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    )
  }

  // Login Mode
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar ao Site
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-8 border border-border"
        >
          <div className="flex justify-center mb-6">
            <Image
              src="/images/logo-sushigo.png"
              alt="SushiGo"
              width={160}
              height={64}
              className="object-contain"
            />
          </div>

          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Painel Admin</h1>
            </div>
            <p className="text-muted-foreground text-sm">Acesso restrito a administradores aprovados</p>
          </div>

          {error && (
            <div className="bg-destructive/20 border border-destructive/50 rounded-lg p-3 mb-6">
              <p className="text-destructive text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-muted-foreground text-sm mb-2 block">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  placeholder="admin@loja.com"
                  className="pl-10 bg-muted border-border text-foreground"
                />
              </div>
            </div>

            <div>
              <label className="text-muted-foreground text-sm mb-2 block">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="********"
                  className="pl-10 pr-10 bg-muted border-border text-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link href="/esqueci-senha" className="text-primary text-sm hover:text-primary/80 transition-colors">
                Esqueci minha senha
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-full mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted-foreground text-sm">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Link href="/admin/cadastrar-admin" className="block">
            <Button
              variant="outline"
              className="w-full border-border text-foreground hover:bg-muted rounded-full"
            >
              Solicitar Acesso Admin
            </Button>
          </Link>
        </motion.div>

        <div className="text-center mt-6">
          <Link href="/login" className="text-muted-foreground text-sm hover:text-foreground transition-colors">
            Acesso de Cliente
          </Link>
        </div>
      </div>
    </main>
  )
}
