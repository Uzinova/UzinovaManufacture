export interface NewsCategory {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  featured_image?: string;
  category_id?: string;
  tags: string[];
  author: string;
  meta_title?: string;
  meta_description?: string;
  status: 'draft' | 'published';
  published_at?: string;
  created_at: string;
  updated_at: string;
}
