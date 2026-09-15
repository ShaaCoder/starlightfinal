export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent_id: string | null;
  created_at: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface BlogFAQ {
  id: string;
  blog_id: string;
  question: string;
  answer: string;
  sort_order: number;
  created_at: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string;
  image_alt: string;
  author: string;
  meta_title: string;
  meta_description: string;
  focus_keyword: string;
  canonical_url: string;
  og_image: string;
  reading_time: number;
  views: number;
  featured: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
  categories?: BlogCategory[];
  tags?: BlogTag[];
  faqs?: BlogFAQ[];
}

export interface BlogFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string;
  image_alt: string;
  author: string;
  meta_title: string;
  meta_description: string;
  focus_keyword: string;
  canonical_url: string;
  og_image: string;
  reading_time: number;
  featured: boolean;
  published: boolean;
  category_ids: string[];
  tag_ids: string[];
  faqs: { question: string; answer: string; sort_order: number }[];
}

export interface SEOScore {
  score: number;
  checks: {
    keyword_in_title: boolean;
    keyword_in_description: boolean;
    slug_optimized: boolean;
    heading_structure: boolean;
    image_alt_present: boolean;
    content_length_ok: boolean;
    faq_present: boolean;
    meta_title_length: boolean;
    meta_description_length: boolean;
    excerpt_present: boolean;
  };
}
