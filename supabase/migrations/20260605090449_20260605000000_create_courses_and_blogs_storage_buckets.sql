
-- Create courses storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('courses', 'courses', true) ON CONFLICT (id) DO NOTHING;

-- Create blogs storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('blogs', 'blogs', true) ON CONFLICT (id) DO NOTHING;

-- Courses bucket: public read
CREATE POLICY "courses_public_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'courses');

-- Courses bucket: authenticated upload
CREATE POLICY "courses_authenticated_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'courses');

-- Courses bucket: authenticated update
CREATE POLICY "courses_authenticated_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'courses')
  WITH CHECK (bucket_id = 'courses');

-- Courses bucket: authenticated delete
CREATE POLICY "courses_authenticated_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'courses');

-- Blogs bucket: public read
CREATE POLICY "blogs_public_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'blogs');

-- Blogs bucket: authenticated upload
CREATE POLICY "blogs_authenticated_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'blogs');

-- Blogs bucket: authenticated update
CREATE POLICY "blogs_authenticated_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'blogs')
  WITH CHECK (bucket_id = 'blogs');

-- Blogs bucket: authenticated delete
CREATE POLICY "blogs_authenticated_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'blogs');
