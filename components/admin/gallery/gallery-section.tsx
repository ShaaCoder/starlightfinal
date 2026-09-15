'use client';

import { useState, useEffect } from 'react';
import { GalleryUpload } from './gallery-upload';
import { GalleryList } from './gallery-list';
import { GalleryItem } from '@/types/gallery';
import { createClient } from '@/lib/supabase/client';

export function GallerySection() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  const loadGalleryItems = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('gallery')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGalleryItems((data || []) as GalleryItem[]);
    } catch (error) {
      console.error('Error loading gallery items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGalleryItems();
  }, []);

  return (
    <div className="space-y-8">
      <GalleryUpload onUploadSuccess={loadGalleryItems} />
      {!isLoading && (
        <GalleryList items={galleryItems} onDeleteSuccess={loadGalleryItems} />
      )}
    </div>
  );
}
