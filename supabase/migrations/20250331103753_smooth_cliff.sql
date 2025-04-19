/*
  # Create hero slides table

  1. New Tables
    - `hero_slides`
      - `id` (uuid, primary key)
      - `image_url` (text)
      - `title` (text, max 50 chars)
      - `subtitle` (text, max 150 chars)
      - `cta_text` (text)
      - `cta_url` (text)
      - `display_order` (integer)
      - `is_active` (boolean)
      - `start_date` (timestamptz)
      - `end_date` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `hero_slides` table
    - Add policy for public read access to active slides
    - Add policy for authenticated users to manage slides
*/

-- Create hero_slides table
CREATE TABLE IF NOT EXISTS hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  title text NOT NULL CHECK (char_length(title) <= 50),
  subtitle text CHECK (char_length(subtitle) <= 150),
  cta_text text,
  cta_url text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to active hero slides"
  ON hero_slides
  FOR SELECT
  TO public
  USING (
    is_active = true 
    AND (start_date IS NULL OR start_date <= now()) 
    AND (end_date IS NULL OR end_date >= now())
  );

CREATE POLICY "Allow authenticated users to manage hero slides"
  ON hero_slides
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_hero_slides_active_dates 
  ON hero_slides(is_active, start_date, end_date)
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
CREATE TRIGGER update_hero_slides_updated_at
  BEFORE UPDATE ON hero_slides
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
