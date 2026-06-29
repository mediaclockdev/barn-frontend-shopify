"use client";

import Image from "next/image";
import Button from "../ui/Button";
import { FaPaperPlane } from "react-icons/fa";

interface HeroContactProps {
  title: string;
  subtitle: string;
  image: string;
}

const HeroContact = ({ title, subtitle, image }: HeroContactProps) => {
  const isExternal = image.startsWith("http");

  const scrollSmooth = () => {
    const element = document.getElementById("message");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Split title to highlight the first word in primary color
  // e.g. "Contact Us" → "Contact" (primary) + " Us" (white)
  const words = title.split(" ");
  const firstWord = words[0] || "";
  const rest = words.slice(1).join(" ");

  return (
    <section className="w-full">
      <div className="relative w-full min-h-[calc(100vh-80px)] overflow-hidden">
        <Image
          src={image}
          alt="Hero"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
          {...(isExternal ? { unoptimized: true } : {})}
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/40 to-transparent w-full md:w-2/3 lg:w-1/2"></div>
        {/* Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="container w-full mx-auto">
            <div className="px-4 flex flex-col gap-8 items-start justify-start">
              <h1 className="text-6xl font-bold leading-12 lg:leading-15 text-primary">
                {firstWord}
                <span className=" text-white"> {rest}</span>
              </h1>

              <p className="text-gray-100 text-lg font-medium  lg:mx-0">
                {subtitle}
              </p>
              <Button
                text="Send Us A Message"
                icon={FaPaperPlane}
                onClick={scrollSmooth}
                aria-label="Scroll to Message Section"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroContact;
