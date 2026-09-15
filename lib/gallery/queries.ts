import { createServerClient } from '@/lib/supabase/server';
import type { GalleryItem } from '@/types/gallery';

export async function getActiveGalleryItems() {
  const supabase = createServerClient();

  try {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as GalleryItem[];
  } catch (e) {
    console.error('Error fetching gallery items:', e);
    return [];
  }
}

export async function getAllGalleryItems() {
  const supabase = createServerClient();

  try {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as GalleryItem[];
  } catch (e) {
    console.error('Error fetching all gallery items:', e);
    return [];
  }
}

export async function getGalleryItem(id: string) {
  const supabase = createServerClient();

  try {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as GalleryItem | null;
  } catch (e) {
    console.error('Error fetching gallery item:', e);
    return null;
  }
}
