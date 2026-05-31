"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { AdminSidebar, AdminHeader } from '@/components/admin/admin-layout'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/lib/store-context'
import { CheckCircle, XCircle, Clock, Shield, UserPlus, Loader2, Mail, Phone } from 'lucide-react'

interface AdminRequest {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  is_admin: boolean
  is_approved: boolean
  is_owner: boolean
  role: string
  store_id: string | null
  created_at: string
}

export default function AprovarAdminsPage() {
  const { store } = useStore()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<AdminRequest[]>([])
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRequests() {
      if (!store?.id) return

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('store_id', store.id)
          .eq('is_admin', true)
          .eq('is_owner', false)
          .order('created_at', { ascending: false })

        if (error) throw error
        setRequests(data || [])
      } catch (error) {
        console.error('Erro ao buscar solicitacoes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [store, supabase])

  const handleApprove = async (profileId: string) => {
    if (!store?.id) return

    try {
      setActionLoading(profileId)

      const { data: approvedAdmins } = await supabase
        .from('profiles')
        .select('id')
        .eq('store_id', store.id)
        .eq('is_admin', true)
        .eq('is_approved', true)

      if (approvedAdmins && approvedAdmins.length >= 2) {
        alert('Esta loja ja atingiu o limite de 2 administradores')
        return
      }

      const { error } = await supabase
        .from('profiles')
        .update({ is_approved: true })
        .eq('id', profileId)

      if (error) throw error

      setRequests(requests.map(r => 
        r.id === profileId ? { ...r, is_approved: true } : r
      ))

      alert('Administrador aprovado com sucesso!')
    } catch (error) {
      console.error('Erro ao aprovar admin:', error)
      alert('Erro ao aprovar administrador')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (profileId: string) => {
    try {
      setActionLoading(profileId)

      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: false, is_approved: false })
        .eq('id', profileId)

      if (error) throw error

      setRequests(requests.filter(r => r.id !== profileId))

      alert('Solicitacao rejeitada')
    } catch (error) {
      console.error('Erro ao rejeitar admin:', error)
      alert('Erro ao rejeitar solicitacao')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminSidebar />
        <div className="lg:ml-56">
          <AdminHeader />
          <main className="p-6 flex items-center justify-center h-[calc(100vh-4rem)]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </main>
        </div>
      </div>
    )
  }

  const approvedCount = requests.filter(r => r.is_approved).length
  const pendingCount = requests.filter(r => !r.is_approved).length

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="lg:ml-56">
        <AdminHeader />
        
        <main className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Gerenciar Administradores</h1>
                <p className="text-muted-foreground text-sm">Aprove ou rejeite solicitacoes de acesso</p>
              </div>
              <Link href="/admin/cadastrar-admin">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Cadastrar Novo Admin
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Total de Admins</p>
                    <p className="text-foreground text-2xl font-bold">{requests.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Aprovados</p>
                    <p className="text-foreground text-2xl font-bold">{approvedCount}</p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Pendentes</p>
                    <p className="text-foreground text-2xl font-bold">{pendingCount}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Limit Warning */}
            {approvedCount >= 2 && (
              <div className="bg-accent/20 border border-accent/50 rounded-lg p-4 mb-6">
                <p className="text-accent text-sm">
                  Esta loja atingiu o limite de 2 administradores aprovados.
                </p>
              </div>
            )}

            {/* Admins List */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="text-lg font-bold text-foreground mb-6">Administradores</h2>

              {requests.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum administrador cadastrado</p>
                  <Link href="/admin/cadastrar-admin" className="text-primary text-sm mt-2 inline-block hover:underline">
                    Cadastrar o primeiro administrador
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div
                      key={request.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted rounded-xl border border-border gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                          {request.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-foreground font-semibold">{request.full_name || 'Sem nome'}</p>
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Mail className="w-3 h-3" />
                            <span>{request.email}</span>
                          </div>
                          {request.phone && (
                            <div className="flex items-center gap-2 text-muted-foreground text-xs">
                              <Phone className="w-3 h-3" />
                              <span>{request.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {request.is_approved ? (
                          <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-3 py-1.5 rounded-full">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Aprovado</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-full">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">Pendente</span>
                          </div>
                        )}
                        
                        {!request.is_approved && !request.is_owner && (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleApprove(request.id)}
                              disabled={actionLoading === request.id || approvedCount >= 2}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              {actionLoading === request.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Aprovar'}
                            </Button>
                            <Button
                              onClick={() => handleReject(request.id)}
                              disabled={actionLoading === request.id}
                              size="sm"
                              variant="outline"
                              className="border-destructive/50 text-destructive hover:bg-destructive/10"
                            >
                              {actionLoading === request.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Rejeitar'}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
