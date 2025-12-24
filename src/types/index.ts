export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string; // Markdown or HTML
  excerpt: string;
  category: 'Event AV' | 'Technology' | 'Reviews' | 'How-to';
  author: string;
  createdAt: number; // Timestamp
  published: boolean;
  coverImage?: string;
}

// Admin roles stored in Firebase Auth custom claims
export type AdminRole = 'admin' | 'super_admin';
