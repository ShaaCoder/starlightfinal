export interface Course {
  id: string;
  title: string;
  slug?: string;
  description: string;
  image_url?: string;
  image?: string;
  duration?: string;
  fee?: string;
  price?: number;
  featured?: boolean;
  created_at: string;
}
