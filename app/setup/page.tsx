"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Store, User, Mail, Lock, Phone, MapPin, CheckCircle, Loader2, Fish } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

export default function SetupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Store data
  const [storeData, setStoreData] = useState({
    id: '',
    name: '',
    description: '',
    whatsapp: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    primary_color: '#D62828',
    secondary_color: '#D4A017',
  })
  
  // Owner data
  const [ownerData, setOwnerData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  async function handleCreateStore() {
    setError('')
    setLoading(true)

    try {
      // Criar loja
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .insert({
          name: storeData.name,
          description: storeData.description,
          whatsapp_number: storeData.whatsapp,
          email: storeData.email,
          phone: storeData.phone,
          address: storeData.address,
          city: storeData.city,
          state: storeData.state,
          zip_code: storeData.zip_code,
          primary_color: storeData.primary_color,
          secondary_color: storeData.secondary_color,
        })
        .select()
        .single()

      if (storeError) throw storeError

      // Salvar store_id para usar no próximo passo
      setStoreData(prev => ({ ...prev, id: store.id }))
      setStep(2)
    } catch (error: any) {
      console.error('Erro ao criar loja:', error)
      setError(error.message || 'Erro ao criar loja')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateOwner() {
    setError('')
    setLoading(true)

    try {
      // Validar senha
      if (ownerData.password !== ownerData.confirmPassword) {
        setError('As senhas não coincidem')
        setLoading(false)
        return
      }

      if (ownerData.password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres')
        setLoading(false)
        return
      }

      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: ownerData.email,
        password: ownerData.password,
        options: {
          data: {
            full_name: ownerData.full_name,
          },
        },
      })

      if (authError) throw authError

      if (!authData.user) {
        setError('Erro ao criar usuário')
        setLoading(false)
        return
      }

      // Atualizar profile para ser dono e admin
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          is_owner: true,
          is_admin: true,
          is_approved: true,
          role: 'owner',
          store_id: storeData.id,
        })
        .eq('id', authData.user.id)

      if (profileError) throw profileError

      setStep(3)
    } catch (error: any) {
      console.error('Erro ao criar dono:', error)
      setError(error.message || 'Erro ao criar dono')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-3xl mx-auto mb-4">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Configuração Inicial</h1>
          <p className="text-muted-foreground">Crie sua loja e configure o dono/admin</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {step > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
            </div>
            <span className="font-medium">Loja</span>
          </div>
          <div className="w-8 h-0.5 bg-border" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {step > 2 ? <CheckCircle className="w-5 h-5" /> : '2'}
            </div>
            <span className="font-medium">Dono</span>
          </div>
          <div className="w-8 h-0.5 bg-border" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {step > 3 ? <CheckCircle className="w-5 h-5" /> : '3'}
            </div>
            <span className="font-medium">Concluído</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Step 1: Store */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              Informações da Loja
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Nome da Loja *</label>
                <Input
                  placeholder="Ex: SushiGo Delivery"
                  value={storeData.name}
                  onChange={(e) => setStoreData({ ...storeData, name: e.target.value })}
                  className="bg-background border-border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Descrição</label>
                <textarea
                  placeholder="Descreva sua loja..."
                  value={storeData.description}
                  onChange={(e) => setStoreData({ ...storeData, description: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">WhatsApp</label>
                  <Input
                    placeholder="(85) 99999-9999"
                    value={storeData.whatsapp}
                    onChange={(e) => setStoreData({ ...storeData, whatsapp: e.target.value })}
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Telefone</label>
                  <Input
                    placeholder="(85) 99999-9999"
                    value={storeData.phone}
                    onChange={(e) => setStoreData({ ...storeData, phone: e.target.value })}
                    className="bg-background border-border"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <Input
                  type="email"
                  placeholder="contato@loja.com"
                  value={storeData.email}
                  onChange={(e) => setStoreData({ ...storeData, email: e.target.value })}
                  className="bg-background border-border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Endereço</label>
                <Input
                  placeholder="Rua, número, bairro"
                  value={storeData.address}
                  onChange={(e) => setStoreData({ ...storeData, address: e.target.value })}
                  className="bg-background border-border"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Cidade</label>
                  <Input
                    placeholder="Fortaleza"
                    value={storeData.city}
                    onChange={(e) => setStoreData({ ...storeData, city: e.target.value })}
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">UF</label>
                  <Input
                    placeholder="CE"
                    maxLength={2}
                    value={storeData.state}
                    onChange={(e) => setStoreData({ ...storeData, state: e.target.value.toUpperCase() })}
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">CEP</label>
                  <Input
                    placeholder="60000-000"
                    value={storeData.zip_code}
                    onChange={(e) => setStoreData({ ...storeData, zip_code: e.target.value })}
                    className="bg-background border-border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Cor Primária</label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={storeData.primary_color}
                      onChange={(e) => setStoreData({ ...storeData, primary_color: e.target.value })}
                      className="w-16 h-10 p-1 bg-background border-border"
                    />
                    <Input
                      value={storeData.primary_color}
                      onChange={(e) => setStoreData({ ...storeData, primary_color: e.target.value })}
                      className="bg-background border-border flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Cor Secundária</label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={storeData.secondary_color}
                      onChange={(e) => setStoreData({ ...storeData, secondary_color: e.target.value })}
                      className="w-16 h-10 p-1 bg-background border-border"
                    />
                    <Input
                      value={storeData.secondary_color}
                      onChange={(e) => setStoreData({ ...storeData, secondary_color: e.target.value })}
                      className="bg-background border-border flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleCreateStore}
              disabled={loading || !storeData.name}
              className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Store className="w-5 h-5 mr-2" />}
              Criar Loja
            </Button>
          </motion.div>
        )}

        {/* Step 2: Owner */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Criar Dono/Admin
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Nome Completo *</label>
                <Input
                  placeholder="João Silva"
                  value={ownerData.full_name}
                  onChange={(e) => setOwnerData({ ...ownerData, full_name: e.target.value })}
                  className="bg-background border-border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email *</label>
                <Input
                  type="email"
                  placeholder="joao@loja.com"
                  value={ownerData.email}
                  onChange={(e) => setOwnerData({ ...ownerData, email: e.target.value })}
                  className="bg-background border-border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Senha *</label>
                <Input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={ownerData.password}
                  onChange={(e) => setOwnerData({ ...ownerData, password: e.target.value })}
                  className="bg-background border-border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Confirmar Senha *</label>
                <Input
                  type="password"
                  placeholder="Repita a senha"
                  value={ownerData.confirmPassword}
                  onChange={(e) => setOwnerData({ ...ownerData, confirmPassword: e.target.value })}
                  className="bg-background border-border"
                />
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Nota:</strong> Este usuário será criado como:
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>• Dono da loja (is_owner = true)</li>
                  <li>• Administrador (is_admin = true)</li>
                  <li>• Aprovado automaticamente (is_approved = true)</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="flex-1 border-border text-foreground hover:bg-muted"
              >
                Voltar
              </Button>
              <Button
                onClick={handleCreateOwner}
                disabled={loading || !ownerData.full_name || !ownerData.email || !ownerData.password}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle className="w-5 h-5 mr-2" />}
                Criar Dono
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-6 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Configuração Concluída!</h2>
            <p className="text-muted-foreground mb-6">
              Sua loja <strong className="text-foreground">{storeData.name}</strong> foi criada com sucesso.
            </p>
            <p className="text-muted-foreground mb-6">
              Acesse o painel admin em: <strong className="text-foreground">/admin</strong>
            </p>
            <Button
              onClick={() => router.push('/login-adm')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Ir para Login Admin
            </Button>
          </motion.div>
        )}
      </div>
    </main>
  )
}
