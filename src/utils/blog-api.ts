import { shopifyFetch } from "./shopify-client";
import { cache } from "react";

// ──────────────────────────────────────────────────────────────
// Blog Types
// ──────────────────────────────────────────────────────────────

export interface BlogPost {
  id: string;
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
 * Fetch all blog posts from Shopify Native Blog
 */
export const fetchBlogPosts = cache(async (limit: number = 25): Promise<BlogPost[]> => {
  const query = `
    query getArticles {
      articles(first: ${limit}, sortKey: PUBLISHED_AT, reverse: true) {
        edges {
          node {
            id
            handle
            title
            excerpt
            content
            contentHtml
            publishedAt
            image {
              url
            }
          }
        }
      }
    }
  `;

  try {
    const res = await shopifyFetch<any>({ query });
    const edges = res?.body?.data?.articles?.edges || [];

    return edges.map(({ node }: any) => {
      // Format date
      const dateObj = new Date(node.publishedAt);
      const formattedDate = dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Fallback: If no excerpt, use the first 150 characters of the plain text content
      let description = node.excerpt || "";
      if (!description && node.content) {
        description = node.content.length > 150 
          ? node.content.substring(0, 150) + "..." 
          : node.content;
      }

      return {
        id: node.id,
        slug: node.handle,
        title: node.title,
        description, // Plain text excerpt or truncated content for cards
        content: node.contentHtml || "",
        date: formattedDate,
        url: node.image?.url || "/images/blog/blog1.jpg", // Fallback image if none uploaded
      };
    });
  } catch (error) {
    console.error("Failed to fetch Blog Posts from Shopify:", error);
    return [];
  }
});

/**
 * Fetch blog posts for the homepage (limited set).
 */
export const resolveHomepageBlogs = cache(async (limit: number = 3): Promise<BlogPost[]> => {
  return await fetchBlogPosts(limit);
});

/**
 * Fetch a single blog post by slug.
 */
export const fetchBlogBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  const query = `
    query getArticleByHandle {
      blogByHandle(handle: "news") {
        articleByHandle(handle: "${slug}") {
          id
          handle
          title
          excerpt
          content
          contentHtml
          publishedAt
          image {
            url
          }
        }
      }
    }
  `;

  try {
    // Note: Storefront API usually requires knowing the Blog handle to get an article by handle natively.
    // The default blog handle is usually "news". If they use a different blog, this might return null.
    const res = await shopifyFetch<any>({ query });
    const node = res?.body?.data?.blogByHandle?.articleByHandle;

    if (!node) {
      // Fallback: If "news" blog doesn't exist, just fetch all and find it
      const allPosts = await fetchBlogPosts(100);
      return allPosts.find((p) => p.slug === slug) || null;
    }

    const dateObj = new Date(node.publishedAt);
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    let description = node.excerpt || "";
    if (!description && node.content) {
      description = node.content.length > 150 
        ? node.content.substring(0, 150) + "..." 
        : node.content;
    }

    return {
      id: node.id,
      slug: node.handle,
      title: node.title,
      description,
      content: node.contentHtml || "",
      date: formattedDate,
      url: node.image?.url || "/images/blog/blog1.jpg",
    };
  } catch (error) {
    console.error("Failed to fetch single Blog Post from Shopify:", error);
    return null;
  }
});

