/*
  # Create carousel images table

  1. New Tables
    - `carousel_images`
      - `id` (uuid, primary key)
      - `image_url` (text)
      - `title` (text)
      - `description` (text)
      - `link_url` (text)
      - `display_order` (integer)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `carousel_images` table
    - Add policy for public read access
    - Add policy for authenticated users to manage images
*/

CREATE TABLE IF NOT EXISTS carousel_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  title text,
  description text,
  link_url text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE carousel_images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to carousel images"
  ON carousel_images
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage carousel images"
  ON carousel_images
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_carousel_images_order 
  ON carousel_images(display_order)
  WHERE is_active = true;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_carousel_images_updated_at
  BEFORE UPDATE ON carousel_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
