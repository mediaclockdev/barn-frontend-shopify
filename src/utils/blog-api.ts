import { blogData as staticBlogData } from "@/src/data/Data";

// ──────────────────────────────────────────────────────────────
// Blog Types
// ──────────────────────────────────────────────────────────────

export interface BlogPost {
  id: number;
  slug: string;
  url: string; // Featured image URL
  date: string; // Formatted display date
  title: string;
  description: string; // Short excerpt
  content: string; // Full HTML/text content
}

// ──────────────────────────────────────────────────────────────
// Fetch helpers
// ──────────────────────────────────────────────────────────────

/**
 * Fetch blog posts for the homepage (limited set).
 */
export function resolveHomepageBlogs(apiBlogs: any[] | undefined): BlogPost[] {
  // Fallback → static data while the API is not ready
  return staticBlogData as BlogPost[];
}

/**
 * Fetch all blog posts for the /blog listing page.
 */
export async function fetchBlogPosts(): Promise<BlogPost[]> {
  // ── Fallback → static data ─────────────────────────────
  return staticBlogData as BlogPost[];
}

/**
 * Fetch a single blog post by slug.
 */
export async function fetchBlogBySlug(slug: string): Promise<BlogPost | null> {
  // ── Fallback → static data ─────────────────────────────
  const staticPost = staticBlogData.find((item) => item.slug === slug);
  return (staticPost as BlogPost) ?? null;
}

