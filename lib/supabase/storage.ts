import { createClient } from './client'

export async function uploadImage(
  file: File,
  bucket: string,
  path: string
): Promise<{ url: string; error?: string }> {
  try {
    const supabase = await createClient()
    
    const fileExt = file.name.split('.').pop()
    const fileName = `${path}/${Date.now()}.${fileExt}`
    const filePath = fileName
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        upsert: true,
        cacheControl: '3600',
      })
    
    if (error) throw error
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)
    
    return { url: publicUrl }
  } catch (error) {
    console.error('Error uploading image:', error)
    return { url: '', error: 'Failed to upload image' }
  }
}

export async function deleteImage(
  bucket: string,
  path: string
): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])
    
    if (error) throw error
    
    return {}
  } catch (error) {
    console.error('Error deleting image:', error)
    return { error: 'Failed to delete image' }
  }
}

export async function createBucket(bucket: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: 5242880, // 5MB
    })
    
    if (error) throw error
    
    return {}
  } catch (error) {
    console.error('Error creating bucket:', error)
    return { error: 'Failed to create bucket' }
  }
}
