/*
  # Add Hero Carousel and News Management Tables

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

    - `news_categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `slug` (text, unique)
      - `created_at` (timestamptz)

    - `news_articles`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `featured_image` (text)
      - `category_id` (uuid, foreign key)
      - `tags` (text[])
      - `author` (text)
      - `meta_title` (text)
      - `meta_description` (text)
      - `status` (text)
      - `published_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
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

-- Create news_categories table
CREATE TABLE IF NOT EXISTS news_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create news_articles table
CREATE TABLE IF NOT EXISTS news_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  featured_image text,
  category_id uuid REFERENCES news_categories(id) ON DELETE SET NULL,
  tags text[] DEFAULT ARRAY[]::text[],
  author text NOT NULL,
  meta_title text,
  meta_description text,
  status text NOT NULL CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;

-- Create policies for hero_slides
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

-- Create policies for news_categories
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

-- Create policies for news_articles
CREATE POLICY "Allow public read access to published news articles"
  ON news_articles
  FOR SELECT
  TO public
  USING (status = 'published' AND published_at <= now());

CREATE POLICY "Allow authenticated users to manage news articles"
  ON news_articles
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_hero_slides_active_dates 
  ON hero_slides(is_active, start_date, end_date)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_news_articles_status_date 
  ON news_articles(status, published_at)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_news_articles_category 
  ON news_articles(category_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_hero_slides_updated_at
  BEFORE UPDATE ON hero_slides
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_articles_updated_at
  BEFORE UPDATE ON news_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
