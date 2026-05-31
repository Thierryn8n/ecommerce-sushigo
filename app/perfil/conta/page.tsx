'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Shield, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  Save,
  Loader2,
  KeyRound
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

export default function ContaPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  // Password change form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    fetchUser()
  }, [])

  async function fetchUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    } catch (error) {
      console.error('Erro ao buscar usuário:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ 
        title: 'Senhas não coincidem', 
        description: 'A nova senha e confirmação devem ser iguais',
        variant: 'destructive' 
      })
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast({ 
        title: 'Senha muito curta', 
        description: 'A senha deve ter pelo menos 6 caracteres',
        variant: 'destructive' 
      })
      return
    }

    setUpdating(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      toast({ 
        title: 'Senha atualizada!', 
        description: 'Sua senha foi alterada com sucesso' 
      })
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error: any) {
      console.error('Erro ao atualizar senha:', error)
      toast({ 
        title: 'Erro ao atualizar senha', 
        description: error.message || 'Tente novamente',
        variant: 'destructive' 
      })
    } finally {
      setUpdating(false)
    }
  }

  async function handleResetPassword() {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user?.email || '', {
        redirectTo: `${window.location.origin}/perfil/conta`
      })

      if (error) throw error

      toast({ 
        title: 'E-mail enviado!', 
        description: 'Verifique sua caixa de entrada para redefinir a senha' 
      })
    } catch (error: any) {
      toast({ 
        title: 'Erro ao enviar e-mail', 
        description: error.message,
        variant: 'destructive' 
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF8C00]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Segurança da Conta</h1>
        <p className="text-gray-400">Gerencie sua senha e dados de login</p>
      </div>

      {/* Security Alert */}
      <div className="bg-gradient-to-r from-[#FF8C00]/10 to-transparent border border-[#FF8C00]/20 rounded-xl p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-[#FF8C00] mt-0.5" />
        <div>
          <p className="text-white font-medium">Dicas de Segurança</p>
          <ul className="text-sm text-gray-400 mt-2 space-y-1">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-500" />
              Use pelo menos 6 caracteres
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-500" />
              Misture letras, números e símbolos
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-500" />
              Evite informações pessoais óbvias
            </li>
          </ul>
        </div>
      </div>

      {/* Email Section (Read Only) */}
      <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-[#0f0f0f] rounded-lg">
            <Mail className="w-5 h-5 text-[#FF8C00]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">E-mail</h2>
            <p className="text-sm text-gray-400">Seu e-mail de login</p>
          </div>
        </div>

        <div className="bg-[#0f0f0f] rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF8C00]/20 rounded-full flex items-center justify-center">
              <span className="text-[#FF8C00] font-semibold">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-white">{user?.email}</p>
              <p className="text-xs text-green-500 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Verificado
              </p>
            </div>
          </div>
          <span className="text-xs text-gray-500 bg-[#1a1a1a] px-3 py-1 rounded-full">
            Não pode ser alterado
          </span>
        </div>
      </div>

      {/* Password Change Section */}
      <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#0f0f0f] rounded-lg">
            <Lock className="w-5 h-5 text-[#FF8C00]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Alterar Senha</h2>
            <p className="text-sm text-gray-400">Escolha uma senha forte e segura</p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          {/* New Password */}
          <div className="space-y-2">
            <Label className="text-gray-300">Nova Senha</Label>
            <div className="relative">
              <Input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="Digite a nova senha"
                required
                minLength={6}
                className="bg-[#0f0f0f] border-white/10 text-white pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label className="text-gray-300">Confirmar Nova Senha</Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Confirme a nova senha"
                required
                minLength={6}
                className="bg-[#0f0f0f] border-white/10 text-white pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Password Strength Indicator */}
          {passwordData.newPassword && (
            <div className="space-y-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => {
                  const strength = passwordData.newPassword.length >= 8 ? 4 : 
                                  passwordData.newPassword.length >= 6 ? 2 : 1
                  return (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        level <= strength 
                          ? strength >= 4 ? 'bg-green-500' : strength >= 2 ? 'bg-[#FF8C00]' : 'bg-red-500'
                          : 'bg-[#2a2a2a]'
                      }`}
                    />
                  )
                })}
              </div>
              <p className={`text-xs ${
                passwordData.newPassword.length >= 8 ? 'text-green-500' :
                passwordData.newPassword.length >= 6 ? 'text-[#FF8C00]' : 'text-red-500'
              }`}>
                {passwordData.newPassword.length >= 8 ? 'Senha forte' :
                 passwordData.newPassword.length >= 6 ? 'Senha média' : 'Senha fraca'}
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={updating}
            className="w-full bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-white"
          >
            {updating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Atualizando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Atualizar Senha
              </>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-[#1a1a1a] text-gray-500">ou</span>
          </div>
        </div>

        {/* Reset Password via Email */}
        <Button
          type="button"
          variant="outline"
          onClick={handleResetPassword}
          className="w-full border-[#FF8C00]/20 text-[#FF8C00] hover:bg-[#FF8C00]/10"
        >
          <KeyRound className="w-4 h-4 mr-2" />
          Enviar E-mail de Recuperação
        </Button>
      </div>

      {/* 2FA Section - Placeholder for future */}
      <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10 opacity-60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0f0f0f] rounded-lg">
              <Smartphone className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-400">Autenticação em Dois Fatores</h2>
              <p className="text-sm text-gray-500">Adicione uma camada extra de segurança</p>
            </div>
          </div>
          <span className="text-xs bg-[#0f0f0f] text-gray-500 px-3 py-1 rounded-full">
            Em breve
          </span>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-500/10 rounded-xl p-6 border border-red-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-red-400">Zona de Perigo</h2>
            <p className="text-sm text-gray-400">Ações irreversíveis</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-[#0f0f0f] rounded-lg">
          <div>
            <p className="text-white font-medium">Excluir Conta</p>
            <p className="text-sm text-gray-400">Esta ação não pode ser desfeita</p>
          </div>
          <Button
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            onClick={() => {
              toast({ 
                title: 'Entre em contato', 
                description: 'Para excluir sua conta, envie um e-mail para suporte@acaipraia.com',
                variant: 'destructive'
              })
            }}
          >
            Solicitar
          </Button>
        </div>
      </div>
    </div>
  )
}
