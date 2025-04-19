/*
  # Create authentication and shopping system tables

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `first_name` (text)
      - `last_name` (text)
      - `phone` (text)
      - `address_line1` (text)
      - `address_line2` (text)
      - `city` (text)
      - `state` (text)
      - `postal_code` (text)
      - `country` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `carts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `guest_id` (text, for non-authenticated users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `cart_items`
      - `id` (uuid, primary key)
      - `cart_id` (uuid, references carts)
      - `product_id` (uuid, references products)
      - `quantity` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `status` (text, enum: 'pending', 'processing', 'shipped', 'delivered', 'cancelled')
      - `total_amount` (numeric)
      - `shipping_address` (jsonb)
      - `billing_address` (jsonb)
      - `shipping_method` (text)
      - `payment_method` (text)
      - `payment_intent_id` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, references orders)
      - `product_id` (uuid, references products)
      - `quantity` (integer)
      - `price` (numeric)
      - `created_at` (timestamptz)

    - `discounts`
      - `id` (uuid, primary key)
      - `code` (text, unique)
      - `description` (text)
      - `discount_type` (text, enum: 'percentage', 'fixed_amount')
      - `discount_value` (numeric)
      - `min_purchase_amount` (numeric)
      - `max_uses` (integer)
      - `uses_count` (integer)
      - `start_date` (timestamptz)
      - `end_date` (timestamptz)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `user_discounts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `discount_id` (uuid, references discounts)
      - `used_at` (timestamptz)

    - `order_discounts`
      - `id` (uuid, primary key)
      - `order_id` (uuid, references orders)
      - `discount_id` (uuid, references discounts)
      - `amount` (numeric)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users and appropriate anonymous access
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  first_name text,
  last_name text,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create carts table
CREATE TABLE IF NOT EXISTS carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  guest_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_or_guest CHECK (
    (user_id IS NOT NULL AND guest_id IS NULL) OR
    (user_id IS NULL AND guest_id IS NOT NULL)
  )
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL REFERENCES carts ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cart_id, product_id)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE SET NULL,
  status text NOT NULL CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
  total_amount numeric NOT NULL CHECK (total_amount >= 0),
  shipping_address jsonb NOT NULL,
  billing_address jsonb NOT NULL,
  shipping_method text NOT NULL,
  payment_method text NOT NULL,
  payment_intent_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products ON DELETE SET NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric NOT NULL CHECK (price >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create discounts table
CREATE TABLE IF NOT EXISTS discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value numeric NOT NULL CHECK (discount_value > 0),
  min_purchase_amount numeric CHECK (min_purchase_amount >= 0),
  max_uses integer,
  uses_count integer NOT NULL DEFAULT 0,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_percentage CHECK (
    discount_type != 'percentage' OR (discount_value >= 0 AND discount_value <= 100)
  )
);

-- Create user_discounts table
CREATE TABLE IF NOT EXISTS user_discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  discount_id uuid NOT NULL REFERENCES discounts ON DELETE CASCADE,
  used_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, discount_id)
);

-- Create order_discounts table
CREATE TABLE IF NOT EXISTS order_discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders ON DELETE CASCADE,
  discount_id uuid NOT NULL REFERENCES discounts ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount >= 0),
  UNIQUE (order_id, discount_id)
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_discounts ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create policies for carts
CREATE POLICY "Users can view their own cart"
  ON carts FOR SELECT
  USING (auth.uid() = user_id OR (auth.uid() IS NULL AND guest_id IS NOT NULL));

CREATE POLICY "Users can create their own cart"
  ON carts FOR INSERT
  WITH CHECK (auth.uid() = user_id OR (auth.uid() IS NULL AND guest_id IS NOT NULL));

CREATE POLICY "Users can update their own cart"
  ON carts FOR UPDATE
  USING (auth.uid() = user_id OR (auth.uid() IS NULL AND guest_id IS NOT NULL))
  WITH CHECK (auth.uid() = user_id OR (auth.uid() IS NULL AND guest_id IS NOT NULL));

CREATE POLICY "Users can delete their own cart"
  ON carts FOR DELETE
  USING (auth.uid() = user_id OR (auth.uid() IS NULL AND guest_id IS NOT NULL));

-- Create policies for cart_items
CREATE POLICY "Users can view their own cart items"
  ON cart_items FOR SELECT
  USING (cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid() OR (auth.uid() IS NULL AND guest_id IS NOT NULL)));

CREATE POLICY "Users can create their own cart items"
  ON cart_items FOR INSERT
  WITH CHECK (cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid() OR (auth.uid() IS NULL AND guest_id IS NOT NULL)));

CREATE POLICY "Users can update their own cart items"
  ON cart_items FOR UPDATE
  USING (cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid() OR (auth.uid() IS NULL AND guest_id IS NOT NULL)))
  WITH CHECK (cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid() OR (auth.uid() IS NULL AND guest_id IS NOT NULL)));

CREATE POLICY "Users can delete their own cart items"
  ON cart_items FOR DELETE
  USING (cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid() OR (auth.uid() IS NULL AND guest_id IS NOT NULL)));

-- Create policies for orders
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policies for order_items
CREATE POLICY "Users can view their own order items"
  ON order_items FOR SELECT
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- Create policies for discounts
CREATE POLICY "Anyone can view active discounts"
  ON discounts FOR SELECT
  USING (is_active = true AND now() BETWEEN start_date AND end_date);

-- Create policies for user_discounts
CREATE POLICY "Users can view their own discount usage"
  ON user_discounts FOR SELECT
  USING (user_id = auth.uid());

-- Create policies for order_discounts
CREATE POLICY "Users can view discounts applied to their orders"
  ON order_discounts FOR SELECT
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- Create authenticated admin policies
CREATE POLICY "Admins can do all on profiles"
  ON profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = ANY(ARRAY['admin@example.com'])
    )
  );

CREATE POLICY "Admins can do all on carts"
  ON carts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = ANY(ARRAY['admin@example.com'])
    )
  );

CREATE POLICY "Admins can do all on cart_items"
  ON cart_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = ANY(ARRAY['admin@example.com'])
    )
  );

CREATE POLICY "Admins can do all on orders"
  ON orders FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = ANY(ARRAY['admin@example.com'])
    )
  );

CREATE POLICY "Admins can do all on order_items"
  ON order_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = ANY(ARRAY['admin@example.com'])
    )
  );

CREATE POLICY "Admins can do all on discounts"
  ON discounts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = ANY(ARRAY['admin@example.com'])
    )
  );

CREATE POLICY "Admins can do all on user_discounts"
  ON user_discounts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = ANY(ARRAY['admin@example.com'])
    )
  );

CREATE POLICY "Admins can do all on order_discounts"
  ON order_discounts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = ANY(ARRAY['admin@example.com'])
    )
  );

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carts_updated_at
  BEFORE UPDATE ON carts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discounts_updated_at
  BEFORE UPDATE ON discounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- Create trigger to create profile on auth signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to handle cart migration
CREATE OR REPLACE FUNCTION migrate_cart_after_login()
RETURNS TRIGGER AS $$
DECLARE
  guest_cart_id uuid;
  user_cart_id uuid;
BEGIN
  -- Check if the user has a guest cart
  SELECT id INTO guest_cart_id
  FROM carts
  WHERE guest_id = NEW.guest_id;

  -- Check if the user already has a cart
  SELECT id INTO user_cart_id
  FROM carts
  WHERE user_id = NEW.user_id;

  -- If user has a guest cart but no user cart, update the guest cart
  IF guest_cart_id IS NOT NULL AND user_cart_id IS NULL THEN
    UPDATE carts SET user_id = NEW.user_id, guest_id = NULL, updated_at = now()
    WHERE id = guest_cart_id;
  
  -- If user has both a guest cart and a user cart, move items and delete guest cart
  ELSIF guest_cart_id IS NOT NULL AND user_cart_id IS NOT NULL THEN
    -- Update quantities of existing items
    UPDATE cart_items
    SET quantity = cart_items.quantity + guest_items.quantity, updated_at = now()
    FROM (SELECT product_id, quantity FROM cart_items WHERE cart_id = guest_cart_id) AS guest_items
    WHERE cart_items.cart_id = user_cart_id AND cart_items.product_id = guest_items.product_id;
    
    -- Insert items that don't exist in user cart
    INSERT INTO cart_items (cart_id, product_id, quantity)
    SELECT user_cart_id, guest_items.product_id, guest_items.quantity
    FROM cart_items AS guest_items
    WHERE guest_items.cart_id = guest_cart_id
    AND NOT EXISTS (
      SELECT 1 FROM cart_items WHERE cart_id = user_cart_id AND product_id = guest_items.product_id
    );
    
    -- Delete the guest cart
    DELETE FROM carts WHERE id = guest_cart_id;
  END IF;

  RETURN NEW;
END;
$$ language plpgsql security definer;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_guest_id ON carts(guest_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_discounts_code ON discounts(code);
CREATE INDEX IF NOT EXISTS idx_discounts_active_dates ON discounts(is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_user_discounts_user_id ON user_discounts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_discounts_discount_id ON user_discounts(discount_id);
CREATE INDEX IF NOT EXISTS idx_order_discounts_order_id ON order_discounts(order_id);
CREATE INDEX IF NOT EXISTS idx_order_discounts_discount_id ON order_discounts(discount_id);
