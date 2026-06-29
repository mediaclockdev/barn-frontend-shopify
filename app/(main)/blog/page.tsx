import TextHeader from "@/src/helper/TextHeader";
import BreadCrumb from "@/src/components/misc/BreadCrumb";
import BlogCard from "@/src/components/cards/BlogCard";
import { fetchBlogPosts } from "@/src/utils/blog-api";
import { getHomePageData } from "@/src/utils/home-api";
import { HOME_FALLBACK } from "@/src/utils/home-fallback";
import { constructMetadata } from "@/src/utils/seo";

export async function generateMetadata() {
  const home = await getHomePageData();
  const content = { ...HOME_FALLBACK, ...(home?.data || {}) };

  return constructMetadata({
    title: `${content.blog_title} ${content.blog_highlight} | Barn`,
    description:
      "Read the latest news, tips, and updates from Barn Pet Stock and Feed.",
  });
}

const BlogPage = async () => {
  const blogs = await fetchBlogPosts();
  const home = await getHomePageData();

  const content = { ...HOME_FALLBACK, ...(home?.data || {}) };

  return (
    <>
      <section className="section py-0!">
        <div className="container">
          <BreadCrumb />
          <TextHeader
            text={content.blog_title}
            highlightedText={content.blog_highlight}
            url="/blog"
            btn={false}
            center
            isGrid
          />

          <div className="grid md:grid-cols-3 gap-6 my-4 lg:my-10 lg:px-5">
            {blogs.map((item) => (
              <BlogCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogPage;
