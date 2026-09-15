export interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  image_path: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export type GalleryFormData = {
  title: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
};
