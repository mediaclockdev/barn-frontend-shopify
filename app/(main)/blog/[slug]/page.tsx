import Image from "next/image";
import BreadCrumb from "@/src/components/misc/BreadCrumb";
import { fetchBlogBySlug } from "@/src/utils/blog-api";
import { notFound } from "next/navigation";
import { constructMetadata } from "@/src/utils/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await fetchBlogBySlug(slug);

  if (!blog) return constructMetadata({ title: "Not Found | Barn", description: "Page not found." });

  // Use description if available, otherwise truncate the content for the description
  const description = blog.description || blog.content.substring(0, 150).replace(/<[^>]*>?/gm, '') + "...";

  return constructMetadata({
    title: `${blog.title} | Barn Blog`,
    description,
    image: blog.url, // Featured image
  });
}

const page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const blog = await fetchBlogBySlug(slug);

  if (!blog) return notFound();

  return (
    <section className="halfSection py-0!">
      <div className="container max-w-6xl">
        <BreadCrumb customLabels={{ [slug]: blog.title }} />
        <div className="relative w-full h-110 mb-4 mt-4">
          <Image
            src={blog.url}
            alt={blog.title}
            fill
            className="object-cover rounded-xl"
          />
        </div>

        <p className="text-text-muted mb-2">{blog.date}</p>

        <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>

        {/* Support both plain text (static) and HTML (API) content */}
        {blog.content.includes("<") ? (
          <article
            className="prose max-w-none mb-4 prose-p:mb-2 prose-p:mt-0 text-black prose-h2:mb-2 prose-h2:mt-6 prose-ul:my-3 prose-ul:marker:text-gray-500 prose-ol:marker:text-gray-800 prose-li:my-1 prose-ol:my-3 prose-h3:mb-2 prose-h3:mt-4"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        ) : (
          <article className="prose max-w-none mb-4">{blog.content}</article>
        )}
      </div>
    </section>
  );
};

export default page;
