/*
  # Create news categories table

  1. New Tables
    - `news_categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `slug` (text, unique)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `news_categories` table
    - Add policy for public read access
    - Add policy for authenticated users to manage categories
*/

-- Create news_categories table
CREATE TABLE IF NOT EXISTS news_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE news_categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to news categories"
  ON news_categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage news categories"
  ON news_categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_news_categories_slug ON news_categories(slug);
