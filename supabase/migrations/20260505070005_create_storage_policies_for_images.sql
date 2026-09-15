/*
  # Create Storage Policies for Images Bucket

  1. Storage Policies
    - Allow public read access to images
    - Allow authenticated users to upload images
    - Allow authenticated users to delete images
    - Allow authenticated users to update images

  2. Security
    - Upload restricted to authenticated users only
    - Public read for displaying images on the website
*/

-- Allow public read access
CREATE POLICY "Public read access for images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'images');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'images');

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'images')
  WITH CHECK (bucket_id = 'images');