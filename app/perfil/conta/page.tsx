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

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
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
      console.error('Erro ao buscar usuario:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ 
        title: 'Senhas nao coincidem', 
        description: 'A nova senha e confirmacao devem ser iguais',
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Seguranca da Conta</h1>
        <p className="text-muted-foreground">Gerencie sua senha e dados de login</p>
      </div>

      {/* Security Alert */}
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-primary mt-0.5" />
        <div>
          <p className="text-foreground font-medium">Dicas de Seguranca</p>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-500" />
              Use pelo menos 6 caracteres
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-500" />
              Misture letras, numeros e simbolos
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-500" />
              Evite informacoes pessoais obvias
            </li>
          </ul>
        </div>
      </div>

      {/* Email Section */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-muted rounded-lg">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">E-mail</h2>
            <p className="text-sm text-muted-foreground">Seu e-mail de login</p>
          </div>
        </div>

        <div className="bg-muted rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-primary font-semibold">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-foreground">{user?.email}</p>
              <p className="text-xs text-green-500 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Verificado
              </p>
            </div>
          </div>
          <span className="text-xs text-muted-foreground bg-background px-3 py-1 rounded-full border border-border">
            Nao pode ser alterado
          </span>
        </div>
      </div>

      {/* Password Change */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-muted rounded-lg">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Alterar Senha</h2>
            <p className="text-sm text-muted-foreground">Escolha uma senha forte e segura</p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Nova Senha</Label>
            <div className="relative">
              <Input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="Digite a nova senha"
                required
                minLength={6}
                className="bg-muted border-border text-foreground pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Confirmar Nova Senha</Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Confirme a nova senha"
                required
                minLength={6}
                className="bg-muted border-border text-foreground pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Password Strength */}
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
                          ? strength >= 4 ? 'bg-green-500' : strength >= 2 ? 'bg-accent' : 'bg-destructive'
                          : 'bg-border'
                      }`}
                    />
                  )
                })}
              </div>
              <p className={`text-xs ${
                passwordData.newPassword.length >= 8 ? 'text-green-500' :
                passwordData.newPassword.length >= 6 ? 'text-accent' : 'text-destructive'
              }`}>
                {passwordData.newPassword.length >= 8 ? 'Senha forte' :
                 passwordData.newPassword.length >= 6 ? 'Senha media' : 'Senha fraca'}
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={updating}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
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

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-card text-muted-foreground">ou</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleResetPassword}
          className="w-full border-primary/20 text-primary hover:bg-primary/10"
        >
          <KeyRound className="w-4 h-4 mr-2" />
          Enviar E-mail de Recuperacao
        </Button>
      </div>

      {/* 2FA Placeholder */}
      <div className="bg-card rounded-xl p-6 border border-border opacity-60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <Smartphone className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-muted-foreground">Autenticacao em Dois Fatores</h2>
              <p className="text-sm text-muted-foreground/60">Adicione uma camada extra de seguranca</p>
            </div>
          </div>
          <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full">
            Em breve
          </span>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-destructive/10 rounded-xl p-6 border border-destructive/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-destructive/20 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-destructive">Zona de Perigo</h2>
            <p className="text-sm text-muted-foreground">Acoes irreversiveis</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
          <div>
            <p className="text-foreground font-medium">Excluir Conta</p>
            <p className="text-sm text-muted-foreground">Esta acao nao pode ser desfeita</p>
          </div>
          <Button
            variant="outline"
            className="border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={() => {
              toast({ 
                title: 'Entre em contato', 
                description: 'Para excluir sua conta, envie um e-mail para suporte@sushigo.com',
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
