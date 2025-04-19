export interface ProductLabel {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  categoryPath: string[];
  images: string[];
  mainImageIndex: number;
  stock: number;
  featured: boolean;
  sku: string;
  discount_rate?: number;
  discount_start?: string;
  discount_end?: string;
  labels?: ProductLabel[];
}

export interface ProductLabelAssignment {
  product_id: string;
  label_id: string;
  created_at: string;
}
