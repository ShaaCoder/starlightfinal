'use client';

import { useState } from 'react';
import Image from 'next/image';
import { GalleryItem } from '@/types/gallery';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Eye, EyeOff, Loader as Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface GalleryListProps {
  items: GalleryItem[];
  onDeleteSuccess: () => void;
}

export function GalleryList({ items, onDeleteSuccess }: GalleryListProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [galleryItems, setGalleryItems] = useState(items);

  const supabase = createClient();

  const handleDelete = async (item: GalleryItem) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    setIsLoading(item.id);

    try {
      // Delete from storage
      const { error: storageError } = await (supabase as any).storage
        .from('gallery')
        .remove([item.image_path]);

      if (storageError) {
        toast.error('Failed to delete image from storage');
        setIsLoading(null);
        return;
      }

      // Delete from database
      const { error: dbError } = await (supabase as any)
        .from('gallery')
        .delete()
        .eq('id', item.id);

      if (dbError) {
        toast.error('Failed to delete gallery item');
        setIsLoading(null);
        return;
      }

      setGalleryItems(galleryItems.filter((i) => i.id !== item.id));
      toast.success('Image deleted successfully!');
      onDeleteSuccess();
    } catch (error) {
      toast.error('An error occurred while deleting');
      console.error(error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleToggleActive = async (item: GalleryItem) => {
    setIsLoading(item.id);

    try {
      const newActiveStatus = !item.is_active;
      const { error } = await (supabase as any)
        .from('gallery')
        .update({
          is_active: newActiveStatus,
        })
        .eq('id', item.id);

      if (error) {
        toast.error('Failed to update gallery item');
        setIsLoading(null);
        return;
      }

      setGalleryItems(
        galleryItems.map((i) =>
          i.id === item.id ? { ...i, is_active: !i.is_active } : i
        )
      );

      toast.success(
        item.is_active ? 'Image hidden' : 'Image made visible'
      );
      onDeleteSuccess();
    } catch (error) {
      toast.error('An error occurred while updating');
      console.error(error);
    } finally {
      setIsLoading(null);
    }
  };

  if (galleryItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gallery Images</CardTitle>
          <CardDescription>No images uploaded yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gallery Images</CardTitle>
        <CardDescription>
          {galleryItems.length} image{galleryItems.length !== 1 ? 's' : ''} uploaded
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {galleryItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg hover:bg-slate-50 transition-colors"
            >
              {/* Image Thumbnail */}
              <div className="relative w-full sm:w-24 h-24 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                <Image
                  src={item.image_url}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-slate-600 line-clamp-2 mt-1">
                        {item.description}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 mt-2">
                      {new Date(item.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="flex-shrink-0">
                    {item.is_active ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                        <Eye className="h-3 w-3" />
                        Visible
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                        <EyeOff className="h-3 w-3" />
                        Hidden
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(item)}
                  disabled={isLoading === item.id}
                >
                  {isLoading === item.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : item.is_active ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(item)}
                  disabled={isLoading === item.id}
                >
                  {isLoading === item.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
