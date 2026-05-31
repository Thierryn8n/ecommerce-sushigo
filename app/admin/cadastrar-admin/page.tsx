"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User, Phone, Shield } from 'lucide-react'
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
    
    // Validações
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
      setError('Todos os campos são obrigatórios')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres')
      return
    }

    if (!store?.id) {
      setError('Loja não encontrada')
      return
    }

    try {
      setLoading(true)

      // Verificar se já tem 2 admins aprovados
      const { data: admins, error: countError } = await supabase
        .from('profiles')
        .select('id')
        .eq('store_id', store.id)
        .eq('is_admin', true)
        .eq('is_approved', true)

      if (countError) throw countError

      if (admins && admins.length >= 2) {
        setError('Esta loja já atingiu o limite de 2 administradores')
        return
      }

      // Criar usuário no Supabase Auth
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

      // Atualizar profile para admin (pendente aprovação)
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
      console.error('Erro ao cadastrar admin:', error)
      setError(error.message || 'Erro ao cadastrar administrador')
    } finally {
      setLoading(false)
    }
  }

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
            Seu cadastro foi enviado para aprovação do dono da loja.
          </p>
          <p className="text-white/50 text-sm">
            Você será redirecionado para o painel admin em instantes...
          </p>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#120018] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link href="/admin" className="inline-flex items-center text-white/70 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar ao Painel
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
              <div className="w-24 h-24 rounded-full bg-[#D62828] flex items-center justify-center text-white font-bold text-3xl">
                {store?.name?.charAt(0) || 'A'}
              </div>
            )}
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="w-6 h-6 text-[#D62828]" />
              <h1 className="text-2xl font-bold text-white">Cadastrar Administrador</h1>
            </div>
            <p className="text-white/60 text-sm">
              {store?.name || 'Loja'} - Máximo 2 administradores
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-6">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-white/70 text-sm mb-2 block">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                <Input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="********"
                  className="pl-10 bg-[#2a1a35] border-[#3a2a45] text-white"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D62828] hover:bg-[#FFC300] text-white font-bold py-3 rounded-full mt-6"
            >
              {loading ? 'Cadastrando...' : 'Cadastrar Administrador'}
            </Button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-[#2a1a35] rounded-xl">
            <p className="text-white/60 text-xs text-center mb-2">
              Após o cadastro, o dono da loja precisará aprovar seu acesso.
            </p>
            <p className="text-white/80 text-xs text-center">
              Você receberá um e-mail de confirmação.
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
