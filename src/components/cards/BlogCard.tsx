import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/src/utils/blog-api";

interface BlogCardProps {
  item: BlogPost;
}

const BlogCard = ({ item }: BlogCardProps) => {
  return (
    <Link href={`/blog/${item.slug}`} className="h-full block group">
      <div className="relative rounded-xl bg-bg-light flex flex-col p-5 pb-12 cursor-pointer h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-transparent hover:border-primary/10">
        <div className="relative w-full h-52 mb-4 overflow-hidden rounded-xl">
          <Image
            src={item.url}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="flex flex-col grow">
          <p className="text-end mb-2 text-text-muted text-xs">{item.date}</p>

          <h4 className="text-center mb-2 font-semibold text-xl line-clamp-2 min-h-14 group-hover:text-primary transition-colors duration-300">
            {item.title}
          </h4>

          <p className="text-center text-md line-clamp-3">{item.description}</p>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
