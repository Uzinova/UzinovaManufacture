/*
  # Add product labels and discounts

  1. New Tables
    - `product_labels`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `color` (text)
      - `created_at` (timestamp)
    
    - `product_label_assignments`
      - `product_id` (uuid, foreign key)
      - `label_id` (uuid, foreign key)
      - `created_at` (timestamp)

  2. Changes to Products Table
    - Add `sku` column (text, unique)
    - Add `discount_rate` column (numeric)
    - Add `discount_start` column (timestamptz)
    - Add `discount_end` column (timestamptz)

  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Create product_labels table
CREATE TABLE IF NOT EXISTS product_labels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  color text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create product_label_assignments table
CREATE TABLE IF NOT EXISTS product_label_assignments (
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  label_id uuid REFERENCES product_labels(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (product_id, label_id)
);

-- Add new columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku text UNIQUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_rate numeric CHECK (discount_rate >= 0 AND discount_rate <= 100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_start timestamptz;
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_end timestamptz;

-- Enable RLS
ALTER TABLE product_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_label_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access to product labels for all users"
  ON product_labels
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage product labels"
  ON product_labels
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow read access to product label assignments for all users"
  ON product_label_assignments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage product label assignments"
  ON product_label_assignments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_labels_name ON product_labels(name);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_discount_period 
  ON products(discount_start, discount_end) 
  WHERE discount_rate IS NOT NULL;
