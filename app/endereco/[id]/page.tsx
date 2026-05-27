'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import Header from '@/components/header'
import { Footer } from '@/components/footer'
import { ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function EditarEnderecoPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    label: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: 'Canoa Quebrada',
    state: 'CE',
    zip_code: '',
    reference: '',
    is_default: false,
  })
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  useEffect(() => {
    loadAddress()
  }, [])

  async function loadAddress() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      setFormData(data)
    } catch (error) {
      console.error('Erro ao carregar endereço:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await supabase
        .from('addresses')
        .update(formData)
        .eq('id', params.id)

      if (error) throw error
      router.push('/perfil')
    } catch (error) {
      console.error('Erro ao salvar endereço:', error)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Tem certeza que deseja deletar este endereço?')) return

    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', params.id)

      if (error) throw error
      router.push('/perfil')
    } catch (error) {
      console.error('Erro ao deletar endereço:', error)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background py-8">
          <div className="container px-4 py-12 text-center">
            <p className="text-foreground">Carregando...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-8">
        <div className="container max-w-2xl px-4 py-12">
          <Link href="/perfil">
            <Button variant="outline" className="mb-8 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>

          <h1 className="mb-8 text-3xl font-bold text-foreground">
            Editar Endereço
          </h1>

          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-purple-700/30 bg-purple-950/20 p-6"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/80">
                  Identificação do Endereço
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) =>
                    setFormData({ ...formData, label: e.target.value })
                  }
                  placeholder="Ex: Casa, Trabalho"
                  className="mt-1 w-full rounded-lg border border-purple-700/30 bg-purple-950/40 px-4 py-2 text-foreground"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-foreground/80">
                    Rua
                  </label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) =>
                      setFormData({ ...formData, street: e.target.value })
                    }
                    placeholder="Nome da rua"
                    required
                    className="mt-1 w-full rounded-lg border border-purple-700/30 bg-purple-950/40 px-4 py-2 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80">
                    Número
                  </label>
                  <input
                    type="text"
                    value={formData.number}
                    onChange={(e) =>
                      setFormData({ ...formData, number: e.target.value })
                    }
                    placeholder="Nº"
                    required
                    className="mt-1 w-full rounded-lg border border-purple-700/30 bg-purple-950/40 px-4 py-2 text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80">
                  Complemento (Apto, Sala, etc)
                </label>
                <input
                  type="text"
                  value={formData.complement}
                  onChange={(e) =>
                    setFormData({ ...formData, complement: e.target.value })
                  }
                  placeholder="Opcional"
                  className="mt-1 w-full rounded-lg border border-purple-700/30 bg-purple-950/40 px-4 py-2 text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80">
                  Bairro
                </label>
                <input
                  type="text"
                  value={formData.neighborhood}
                  onChange={(e) =>
                    setFormData({ ...formData, neighborhood: e.target.value })
                  }
                  placeholder="Bairro"
                  required
                  className="mt-1 w-full rounded-lg border border-purple-700/30 bg-purple-950/40 px-4 py-2 text-foreground"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-foreground/80">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-purple-700/30 bg-purple-950/40 px-4 py-2 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80">
                    Estado
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    maxLength={2}
                    className="mt-1 w-full rounded-lg border border-purple-700/30 bg-purple-950/40 px-4 py-2 text-foreground uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80">
                  CEP
                </label>
                <input
                  type="text"
                  value={formData.zip_code}
                  onChange={(e) =>
                    setFormData({ ...formData, zip_code: e.target.value })
                  }
                  placeholder="00000-000"
                  className="mt-1 w-full rounded-lg border border-purple-700/30 bg-purple-950/40 px-4 py-2 text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80">
                  Referência
                </label>
                <textarea
                  value={formData.reference}
                  onChange={(e) =>
                    setFormData({ ...formData, reference: e.target.value })
                  }
                  placeholder="Próximo a... (opcional)"
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-purple-700/30 bg-purple-950/40 px-4 py-2 text-foreground"
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_default: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-purple-700/30 bg-purple-950/40"
                />
                <span className="text-sm font-medium text-foreground/80">
                  Usar como endereço padrão
                </span>
              </label>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 bg-accent hover:bg-accent/90"
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/perfil')}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}
