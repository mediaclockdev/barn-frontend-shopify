import Image from "next/image";
import { FaArrowRight } from "react-icons/fa";
import Button from "../ui/Button";
import TextHeader from "@/src/helper/TextHeader";
import Link from "next/link";

interface HomeAboutProp {
  title: string;
  subtitle: string;
  image: string;
}

const AboutSection = ({ title, subtitle, image }: HomeAboutProp) => {
  // Split title for TextHeader, e.g. "About Us" → text="About" highlighted="Us"
  const titleWords = title.split(" ");
  const headerText = titleWords[0] || "About";
  const headerHighlight = titleWords.slice(1).join(" ") || "Us";

  // Split content on newlines into paragraphs
  const paragraphs = subtitle
    .split(/\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  // Determine if the image is an external URL
  const isExternal = image.startsWith("http");
  return (
    <section className="halfSection">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-2 md:gap-12 items-center bg-white rounded-3xl p-6 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          {/* Mobile TextHeader (visible only on mobile) */}
          <div className="w-full flex justify-center md:hidden">
            <TextHeader
              text={headerText}
              highlightedText={headerHighlight}
              btn={false}
              isGrid={true}
              center={true}
              lgCenter={false}
            />
          </div>

          {/* Left Image */}
          <div className="relative w-full h-87.5 md:h-112.5 overflow-hidden rounded-2xl shadow-lg group">
            <Image
              src={image}
              alt="About Barn Pet Stock"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              {...(isExternal ? { unoptimized: true } : {})}
            />
          </div>

          {/* Right Content */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="w-full hidden md:flex justify-start">
              <TextHeader
                text={headerText}
                highlightedText={headerHighlight}
                btn={false}
                isGrid={true}
                center={true}
                lgCenter={false}
              />
            </div>

            <div className="z-10 mt-2">
              <div className="text-gray-600 leading-relaxed mb-8 text-base md:text-lg max-w-lg flex flex-col gap-4">
                {paragraphs.map((text, i) => (
                  <p key={i}>{text}</p>
                ))}
              </div>

              <div className="w-full flex items-center justify-center md:justify-start">
                <Link href="/about-us">
                  <Button text="Learn More" icon={FaArrowRight} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
