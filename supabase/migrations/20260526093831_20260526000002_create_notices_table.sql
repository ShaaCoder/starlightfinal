/*
  # Create Notices Table

  This migration sets up the notices table for administrative announcements.

  1. New Tables
    - `notices`
      - `id` (uuid, primary key) - Unique identifier
      - `title` (text) - Notice title
      - `content` (text) - Notice content
      - `priority` (text) - Priority level: 'low', 'medium', 'high'
      - `is_active` (boolean) - Whether notice is currently active
      - `created_at` (timestamp) - Creation timestamp
      - `updated_at` (timestamp) - Last update timestamp

  2. Security
    - Enable RLS on `notices` table
    - Authenticated users can read and manage notices

  3. Important Notes
    - Priority defaults to 'medium'
    - Notices can be toggled active/inactive
*/

CREATE TABLE IF NOT EXISTS notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text DEFAULT '',
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- Policies for notices table
CREATE POLICY "Authenticated users can view notices"
  ON notices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create notices"
  ON notices FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update notices"
  ON notices FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete notices"
  ON notices FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS notices_created_at_idx ON notices(created_at DESC);
CREATE INDEX IF NOT EXISTS notices_priority_idx ON notices(priority);
CREATE INDEX IF NOT EXISTS notices_is_active_idx ON notices(is_active);

-- Trigger for updated_at
CREATE TRIGGER update_notices_updated_at
  BEFORE UPDATE ON notices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();