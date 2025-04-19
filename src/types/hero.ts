export interface HeroSlide {
  id: string;
  image_url: string;
  title: string;
  subtitle?: string;
  cta_text?: string;
  cta_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
