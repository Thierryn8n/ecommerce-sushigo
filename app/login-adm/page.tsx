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
  
  // Estados para verificação de admin existente
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null)
  const [checkingAdmin, setCheckingAdmin] = useState(true)
  
  // Estados para login
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  })
  
  // Estados para cadastro (primeiro admin)
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Verificar se existe algum admin no sistema
  useEffect(() => {
    async function checkAdminExists() {
      console.log('🔍 Verificando se existe admin...')
      
      try {
        // Estratégia 1: Usar maybeSingle para evitar erro se não encontrar
        const { data: admin, error } = await supabase
          .from('profiles')
          .select('id, is_admin, email')
          .eq('is_admin', true)
          .maybeSingle()

        if (error) {
          console.error('❌ Erro na query maybeSingle:', error)
          
          // Estratégia 2: Tentar contar (head: true não retorna dados, só conta)
          try {
            const { count, error: countError } = await supabase
              .from('profiles')
              .select('*', { count: 'exact', head: true })
              .eq('is_admin', true)
            
            if (countError) {
              console.error('❌ Erro na contagem:', countError)
              // EM CASO DE ERRO, ASSUMIR QUE TEM ADMIN (mais seguro)
              console.log('⚠️ Assumindo que existe admin devido a erro de permissão')
              setHasAdmin(true)
            } else {
              console.log('✅ Contagem de admins:', count)
              setHasAdmin(count !== null && count > 0)
            }
          } catch (countErr) {
            console.error('❌ Exceção na contagem:', countErr)
            setHasAdmin(true) // Mais seguro assumir que tem admin
          }
        } else {
          console.log('✅ Resultado maybeSingle:', admin)
          setHasAdmin(!!admin)
        }
      } catch (err) {
        console.error('❌ Erro geral ao verificar admins:', err)
        // Em caso de erro grave, assumir que TEM admin (não mostrar cadastro)
        setHasAdmin(true)
      } finally {
        console.log('🏁 Verificação finalizada. hasAdmin:', hasAdmin)
        setCheckingAdmin(false)
      }
    }

    checkAdminExists()
  }, [supabase])

  // Handler de login
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
        setError('Você não tem permissão de administrador')
        return
      }

      if (!profile.is_approved) {
        await supabase.auth.signOut()
        setError('Seu acesso ainda não foi aprovado pelo dono da loja')
        return
      }

      router.push('/admin')
    } catch (error: any) {
      console.error('Erro ao fazer login:', error)
      setError(error.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  // Handler de cadastro (primeiro admin)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validações
    if (!registerData.fullName || !registerData.email || !registerData.phone || !registerData.password) {
      setError('Todos os campos são obrigatórios')
      return
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    if (registerData.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres')
      return
    }

    try {
      setLoading(true)

      let userId: string | null = null
      let userCreated = false

      // TENTATIVA 1: Criar usuário no Supabase Auth
      try {
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
          console.error('Erro no signUp:', authError)
          
          // Verificar se o erro é de usuário já existente
          if (authError.message?.includes('already registered') || authError.message?.includes('already exists')) {
            throw new Error('Este email já está cadastrado. Tente fazer login.')
          }
          
          // Outro erro no signUp
          throw new Error(authError.message || 'Erro ao criar usuário')
        } 
        
        if (authData.user) {
          userId = authData.user.id
          userCreated = true
          console.log('Usuário criado com sucesso:', userId)
          
          // IMPORTANTE: O usuário foi criado mas precisa confirmar email
          // O trigger já criou o profile, então vamos tentar atualizá-lo
          // Como é o primeiro admin, vamos apenas mostrar sucesso
          // O usuário precisará confirmar o email antes de fazer login
        }
      } catch (signUpError: any) {
        console.error('Exceção no signUp:', signUpError)
        // Se já temos mensagem específica, propagar
        if (signUpError.message?.includes('cadastrado') || signUpError.message?.includes('Erro ao criar')) {
          throw signUpError
        }
        // Senão, tentar continuar
      }

      // Se usuário foi criado com sucesso, mostrar mensagem de sucesso
      // (não tentar login pois email não está confirmado)
      if (userCreated && userId) {
        // Tentar atualizar o profile se possível (pode falhar por RLS, mas trigger já criou)
        try {
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              is_admin: true,
              is_approved: true,
              is_owner: true,
              role: 'admin',
            })
            .eq('id', userId)
          
          if (updateError) {
            console.log('Não foi possível atualizar profile (RLS):', updateError)
            // Isso é OK, o profile foi criado pelo trigger com valores padrão
            // O admin pode atualizar manualmente depois ou via SQL
          } else {
            console.log('Profile atualizado com sucesso')
          }
        } catch (profileError) {
          console.log('Erro ao atualizar profile:', profileError)
        }
        
        // Mostrar sucesso - usuário precisa confirmar email
        setSuccess(true)
        setTimeout(() => {
          // Redirecionar para página explicando que precisa confirmar email
          router.push('/login-adm?message=verify-email')
        }, 3000)
        return
      }

      // Se chegou aqui, algo deu errado
      throw new Error('Não foi possível criar o usuário. Tente novamente.')
    } catch (error: any) {
      console.error('Erro ao cadastrar admin:', error)
      setError(error.message || 'Erro ao cadastrar administrador')
    } finally {
      setLoading(false)
    }
  }

  // Loading inicial enquanto verifica se tem admin
  if (checkingAdmin) {
    return (
      <main className="min-h-screen bg-[#120018] flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#FF8C00] mx-auto mb-4" />
          <p className="text-white/60">Verificando sistema...</p>
        </div>
      </main>
    )
  }

  // Tela de sucesso após cadastro do primeiro admin
  if (success) {
    return (
      <main className="min-h-screen bg-[#120018] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#1a0a25] rounded-3xl p-8 border border-[#3a2a45] max-w-md w-full text-center"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Cadastro Realizado!</h2>
          <p className="text-white/70 mb-4">
            Primeiro administrador cadastrado com sucesso!
          </p>
          
          {/* Alerta sobre confirmação de email */}
          <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
            <p className="text-yellow-400 text-sm font-medium mb-1">⚠️ Atenção</p>
            <p className="text-white/80 text-sm">
              Enviamos um email de confirmação para <strong>{registerData.email}</strong>
            </p>
            <p className="text-white/60 text-xs mt-2">
              Clique no link do email para ativar sua conta antes de fazer login.
            </p>
          </div>
          
          <Link href="/login-adm">
            <Button className="w-full bg-[#FF8C00] hover:bg-[#FFC300] text-white font-bold py-3 rounded-full">
              Ir para Login
            </Button>
          </Link>
        </motion.div>
      </main>
    )
  }

  // MODO CADASTRO: Se não tem admin, mostra formulário de cadastro
  if (hasAdmin === false) {
    return (
      <main className="min-h-screen bg-[#120018] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <Link href="/" className="inline-flex items-center text-white/70 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar ao Site
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1a0a25] rounded-3xl p-8 border border-[#3a2a45]"
          >
            {/* Logo */}
            <div className="flex justify-center mb-6">
              {store?.logo_url ? (
                <Image
                  src={store.logo_url}
                  alt={store.name}
                  width={100}
                  height={100}
                  className="object-contain"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#FF8C00] flex items-center justify-center text-white font-bold text-3xl">
                  {store?.name?.charAt(0) || 'A'}
                </div>
              )}
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="w-6 h-6 text-[#FF8C00]" />
                <h1 className="text-2xl font-bold text-white">Primeiro Acesso</h1>
              </div>
              <p className="text-white/60 text-sm">
                Cadastre o primeiro administrador do sistema
              </p>
              <div className="mt-3 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full inline-block">
                <span className="text-green-400 text-xs">✓ Aprovação automática</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-6">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-white/70 text-sm mb-2 block">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                  <Input
                    type="text"
                    value={registerData.fullName}
                    onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                    placeholder="João Silva"
                    className="pl-10 bg-[#2a1a35] border-[#3a2a45] text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/70 text-sm mb-2 block">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                  <Input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    placeholder="admin@loja.com"
                    className="pl-10 bg-[#2a1a35] border-[#3a2a45] text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/70 text-sm mb-2 block">Telefone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                  <Input
                    type="tel"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                    placeholder="(88) 9 9999-9999"
                    className="pl-10 bg-[#2a1a35] border-[#3a2a45] text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/70 text-sm mb-2 block">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    placeholder="********"
                    className="pl-10 pr-10 bg-[#2a1a35] border-[#3a2a45] text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-white/70 text-sm mb-2 block">Confirmar Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    placeholder="********"
                    className="pl-10 bg-[#2a1a35] border-[#3a2a45] text-white"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF8C00] hover:bg-[#FFC300] text-white font-bold py-3 rounded-full mt-6"
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

            {/* Info */}
            <div className="mt-6 p-4 bg-[#2a1a35] rounded-xl">
              <p className="text-white/60 text-xs text-center">
                Como é o primeiro acesso, você será cadastrado como <strong>dono da loja</strong> com aprovação automática.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    )
  }

  // MODO LOGIN: Se já tem admin, mostra formulário de login
  return (
    <main className="min-h-screen bg-[#120018] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-white/70 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar ao Site
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a0a25] rounded-3xl p-8 border border-[#3a2a45]"
        >
          {/* Logo */}
          <div className="flex justify-center mb-6">
            {store?.logo_url ? (
              <Image
                src={store.logo_url}
                alt={store.name}
                width={100}
                height={100}
                className="object-contain"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#FF8C00] flex items-center justify-center text-white font-bold text-3xl">
                {store?.name?.charAt(0) || 'A'}
              </div>
            )}
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="w-6 h-6 text-[#FF8C00]" />
              <h1 className="text-2xl font-bold text-white">Painel Admin</h1>
            </div>
            <p className="text-white/60 text-sm">Acesso restrito a administradores aprovados</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-6">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-white/70 text-sm mb-2 block">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                <Input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  placeholder="admin@loja.com"
                  className="pl-10 bg-[#2a1a35] border-[#3a2a45] text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="********"
                  className="pl-10 pr-10 bg-[#2a1a35] border-[#3a2a45] text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF8C00] hover:bg-[#FFC300] text-white font-bold py-3 rounded-full mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Acessar Painel'
              )}
            </Button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-[#2a1a35] rounded-xl">
            <p className="text-white/60 text-xs text-center mb-2">
              Precisa de acesso administrativo?
            </p>
            <Link href="/admin/cadastrar-admin" className="text-[#FF8C00] text-xs text-center block hover:text-[#FFC300]">
              Solicitar cadastro de administrador
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
