-- Create gallery table
CREATE TABLE IF NOT EXISTS public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500) NOT NULL,
  image_path VARCHAR(500) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create gallery bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true) ON CONFLICT (id) DO NOTHING;

-- Gallery bucket policies
CREATE POLICY "gallery_public_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'gallery');

CREATE POLICY "gallery_authenticated_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "gallery_authenticated_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'gallery')
  WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "gallery_authenticated_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'gallery');

-- Enable RLS on gallery table
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

-- Gallery RLS: Public can read active gallery items
CREATE POLICY "gallery_public_read_active" ON public.gallery
  FOR SELECT TO public
  USING (is_active = true);

-- Gallery RLS: Authenticated users can insert
CREATE POLICY "gallery_authenticated_insert" ON public.gallery
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Gallery RLS: Authenticated users can update
CREATE POLICY "gallery_authenticated_update" ON public.gallery
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);

-- Gallery RLS: Authenticated users can delete
CREATE POLICY "gallery_authenticated_delete" ON public.gallery
  FOR DELETE TO authenticated
  USING (auth.uid() = created_by);

-- Create indexes
CREATE INDEX idx_gallery_sort_order ON public.gallery(sort_order ASC);
CREATE INDEX idx_gallery_is_active ON public.gallery(is_active);
CREATE INDEX idx_gallery_created_at ON public.gallery(created_at DESC);