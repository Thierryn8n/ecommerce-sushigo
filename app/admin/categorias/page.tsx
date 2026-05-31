"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  GripVertical,
  Palette,
  ImageIcon,
  Tag
} from 'lucide-react'
import { AdminSidebar, AdminHeader } from '@/components/admin/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { uploadImage } from '@/lib/supabase/storage'
import { Category } from '@/lib/types'

export default function AdminCategorias() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    color: '#8B5CF6',
    display_order: 0,
    is_active: true,
  })

  const supabase = createClient()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order')

    if (!error && data) {
      setCategories(data)
    }
    setLoading(false)
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: editingCategory ? prev.slug : generateSlug(name)
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const openDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        image_url: category.image_url || '',
        color: category.color || '#8B5CF6',
        display_order: category.display_order,
        is_active: category.is_active,
      })
      setImagePreview(category.image_url || null)
    } else {
      setEditingCategory(null)
      setFormData({
        name: '',
        slug: '',
        description: '',
        image_url: '',
        color: '#8B5CF6',
        display_order: categories.length,
        is_active: true,
      })
      setImagePreview(null)
    }
    setImageFile(null)
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    let imageUrl = formData.image_url

    // Upload de imagem se houver
    if (imageFile) {
      console.log("[v0] Uploading category image:", imageFile.name)
      const result = await uploadImage(imageFile, 'categories', 'categories')
      console.log("[v0] Upload result:", result)
      if (result.url) {
        imageUrl = result.url
      } else if (result.error) {
        alert('Erro ao fazer upload da imagem: ' + result.error)
        setSaving(false)
        return
      }
    }

    const categoryData = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description || null,
      image_url: imageUrl || null,
      color: formData.color,
      display_order: formData.display_order,
      is_active: formData.is_active,
    }

    console.log("[v0] Saving category:", categoryData)

    if (editingCategory) {
      const { data, error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', editingCategory.id)
        .select()
        .single()

      console.log("[v0] Update result:", { data, error })
      if (!error && data) {
        setCategories(prev => prev.map(c => c.id === data.id ? data : c))
      } else if (error) {
        alert('Erro ao atualizar categoria: ' + error.message)
      }
    } else {
      const { data, error } = await supabase
        .from('categories')
        .insert([categoryData])
        .select()
        .single()

      console.log("[v0] Insert result:", { data, error })
      if (!error && data) {
        setCategories(prev => [...prev, data])
      } else if (error) {
        alert('Erro ao criar categoria: ' + error.message)
      }
    }

    setSaving(false)
    setDialogOpen(false)
  }

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('categories')
      .update({ is_active: !currentStatus })
      .eq('id', id)

    if (!error) {
      setCategories(prev => prev.map(c => 
        c.id === id ? { ...c, is_active: !currentStatus } : c
      ))
    }
  }

  const deleteCategory = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria? Os produtos associados ficarao sem categoria.')) return

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (!error) {
      setCategories(prev => prev.filter(c => c.id !== id))
    }
  }

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const colorOptions = [
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#6366F1', // Indigo
    '#14B8A6', // Teal
    '#F97316', // Orange
    '#84CC16', // Lime
  ]

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="lg:ml-56">
        <AdminHeader />
        <main className="p-3 sm:p-4 md:p-6 lg:p-8 pb-20 lg:pb-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Categorias</h1>
              <p className="text-muted-foreground text-sm mt-1">Gerencie as categorias dos produtos</p>
            </div>
            <Button 
              onClick={() => openDialog()} 
              className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Categoria
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar categorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>

          {/* Categories Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
                  <div className="w-16 h-16 bg-muted rounded-xl mb-4" />
                  <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-xl">
              <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma categoria encontrada</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {searchTerm ? 'Tente outro termo de busca' : 'Comece criando sua primeira categoria'}
              </p>
              {!searchTerm && (
                <Button onClick={() => openDialog()} className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Categoria
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors group"
                >
                  {/* Color Bar */}
                  <div 
                    className="h-2" 
                    style={{ backgroundColor: category.color || '#8B5CF6' }}
                  />
                  
                  <div className="p-4">
                    {/* Image and Info */}
                    <div className="flex items-start gap-4 mb-4">
                      <div 
                        className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                        style={{ backgroundColor: `${category.color || '#8B5CF6'}20` }}
                      >
                        {category.image_url ? (
                          <Image
                            src={category.image_url}
                            alt={category.name}
                            width={64}
                            height={64}
                            className="object-contain"
                          />
                        ) : (
                          <Tag 
                            className="w-8 h-8" 
                            style={{ color: category.color || '#8B5CF6' }}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground truncate">{category.name}</h3>
                        <p className="text-muted-foreground text-sm truncate">/{category.slug}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            category.is_active 
                              ? 'bg-green-500/20 text-green-500' 
                              : 'bg-red-500/20 text-red-500'
                          }`}>
                            {category.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Ordem: {category.display_order}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {category.description && (
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                        {category.description}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-border">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatus(category.id, category.is_active)}
                        className="flex-1 text-muted-foreground hover:text-foreground"
                      >
                        {category.is_active ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-1" />
                            Ocultar
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-1" />
                            Mostrar
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDialog(category)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCategory(category.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Modal de Criacao/Edicao */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="bg-card border-border text-foreground max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nome */}
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ex: Sushi Tradicional"
                    required
                    className="bg-muted border-border"
                  />
                </div>

                {/* Slug */}
                <div>
                  <Label htmlFor="slug">Slug (URL)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="sushi-tradicional"
                    className="bg-muted border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Usado na URL: /cardapio?categoria={formData.slug || 'slug'}
                  </p>
                </div>

                {/* Descricao */}
                <div>
                  <Label htmlFor="description">Descricao</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descricao da categoria..."
                    className="bg-muted border-border resize-none"
                    rows={3}
                  />
                </div>

                {/* Imagem */}
                <div>
                  <Label>Imagem</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <div 
                      className="w-20 h-20 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-border"
                      style={{ backgroundColor: `${formData.color}20` }}
                    >
                      {imagePreview ? (
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          width={80}
                          height={80}
                          className="object-contain"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="bg-muted border-border"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG ou JPG. Recomendado: 200x200px
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cor */}
                <div>
                  <Label className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Cor da Categoria
                  </Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded-full transition-all ${
                          formData.color === color 
                            ? 'ring-2 ring-offset-2 ring-offset-card ring-primary scale-110' 
                            : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <Input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="w-8 h-8 p-0 border-0 cursor-pointer rounded-full overflow-hidden"
                    />
                  </div>
                </div>

                {/* Ordem */}
                <div>
                  <Label htmlFor="display_order">Ordem de Exibicao</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                    className="bg-muted border-border w-24"
                  />
                </div>

                {/* Ativo */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <Label htmlFor="is_active" className="cursor-pointer">Categoria Ativa</Label>
                    <p className="text-xs text-muted-foreground">Exibir esta categoria no cardapio</p>
                  </div>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    className="border-border"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving || !formData.name}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {saving ? 'Salvando...' : editingCategory ? 'Atualizar' : 'Criar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  )
}
