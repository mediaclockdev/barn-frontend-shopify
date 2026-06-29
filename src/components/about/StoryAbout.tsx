import TextHeader from "@/src/helper/TextHeader";
import Image from "next/image";
import React from "react";

interface StoryAboutProps {
  title: string;
  content: string;
  image: string;
}

const StoryAbout = ({ title, content, image }: StoryAboutProps) => {
  // Split the story_content on double newlines to create paragraphs
  const paragraphs = content
    .split(/\r?\n\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  // Split the title into two words for the TextHeader component
  // e.g. "Our Story" → text="Our" highlightedText="Story"
  const titleWords = title.split(" ");
  const headerText = titleWords[0] || "Our";
  const headerHighlight = titleWords.slice(1).join(" ") || "Story";

  // Determine if the image is an external URL
  const isExternal = image.startsWith("http");

  return (
    <section className="halfSection pb-5!">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-16 items-center">
          {/* Mobile TextHeader */}
          <div className="w-full flex justify-center lg:hidden">
            <TextHeader
              text={headerText}
              highlightedText={headerHighlight}
              isGrid={true}
              btn={false}
              center={true}
            />
          </div>

          <div className="relative w-full h-[350px] md:h-[450px] overflow-hidden rounded-2xl group">
            <Image
              src={image}
              alt="aboutStory"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              {...(isExternal ? { unoptimized: true } : {})}
            />
          </div>

          {/* Content */}
          <div className="max-w-xl flex flex-col lg:gap-5 lg:pl-6">
            <div className="hidden lg:block w-full">
              <TextHeader
                text={headerText}
                highlightedText={headerHighlight}
                isGrid={true}
                btn={false}
                center={true}
              />
            </div>

            <div className="flex flex-col gap-5 mt-2">
              {paragraphs.map((paragraph, index) => {
                // Last paragraph gets the special blockquote-like styling
                const isLast = index === paragraphs.length - 1;

                return isLast ? (
                  <p
                    key={index}
                    className="text-gray-800 font-medium text-lg border-l-4 border-primary pl-4 py-1 mt-2"
                  >
                    {paragraph}
                  </p>
                ) : (
                  <p key={index} className="text-gray-600 text-lg">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoryAbout;
