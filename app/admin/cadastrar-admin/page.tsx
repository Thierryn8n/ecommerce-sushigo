"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User, Phone, Shield, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/lib/store-context'

export default function CadastrarAdminPage() {
  const router = useRouter()
  const { store } = useStore()
  const supabase = createClient()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
      setError('Todos os campos sao obrigatorios')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas nao coincidem')
      return
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter no minimo 6 caracteres')
      return
    }

    if (!store?.id) {
      setError('Loja nao encontrada')
      return
    }

    try {
      setLoading(true)

      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .eq('store_id', store.id)
        .eq('is_admin', true)
        .eq('is_approved', true)

      if (admins && admins.length >= 2) {
        setError('Esta loja ja atingiu o limite de 2 administradores')
        return
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
          },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            is_admin: true,
            is_approved: false,
            is_owner: false,
            role: 'admin',
            store_id: store.id,
          })
          .eq('id', authData.user.id)

        if (profileError) throw profileError
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/admin')
      }, 3000)
    } catch (error: any) {
      setError(error.message || 'Erro ao cadastrar administrador')
    } finally {
      setLoading(false)
    }
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
            Seu cadastro foi enviado para aprovacao do dono da loja.
          </p>
          <p className="text-muted-foreground/60 text-sm">
            Voce sera redirecionado para o painel admin em instantes...
          </p>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/admin" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar ao Painel
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
              <h1 className="text-2xl font-bold text-foreground">Cadastrar Administrador</h1>
            </div>
            <p className="text-muted-foreground text-sm">
              {store?.name || 'Loja'} - Maximo 2 administradores
            </p>
          </div>

          {error && (
            <div className="bg-destructive/20 border border-destructive/50 rounded-lg p-3 mb-6">
              <p className="text-destructive text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-muted-foreground text-sm mb-2 block">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                'Cadastrar Administrador'
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted rounded-xl">
            <p className="text-muted-foreground text-xs text-center mb-2">
              Apos o cadastro, o dono da loja precisara aprovar seu acesso.
            </p>
            <p className="text-foreground/80 text-xs text-center">
              Voce recebera um e-mail de confirmacao.
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
