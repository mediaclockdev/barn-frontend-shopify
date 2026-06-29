import Image from "next/image";
import React from "react";
import Button from "../ui/Button";
import { FaShoppingBag } from "react-icons/fa";
import Link from "next/link";

interface HeroAboutProps {
  title: string;
  subtitle: string;
  image: string;
}

const HeroAbout = ({ title, subtitle, image }: HeroAboutProps) => {
  // Split title on the last space to put the last words in the accent color
  // e.g. "Quality Care For Every Companion" → "Quality Care" + "For Every Companion"
  const words = title.split(" ");
  const midpoint = Math.ceil(words.length / 2);
  const firstHalf = words.slice(0, midpoint).join(" ");
  const secondHalf = words.slice(midpoint).join(" ");

  // Determine if the image is an external URL or a local path
  const isExternal = image.startsWith("http");

  return (
    <section className="w-full">
      <div className="relative w-full min-h-[calc(100vh-150px)] overflow-hidden">
        <Image
          src={image}
          alt="Hero"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_20%]"
          {...(isExternal ? { unoptimized: true } : {})}
        />
        {/* Gradient shadow from the left to make text pop while keeping the rest of the image clear */}
        <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/40 to-transparent w-full md:w-2/3 lg:w-1/2"></div>

        {/* Subtle overall darkening to ensure text remains readable if it overflows */}
        {/* Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="container w-full mx-auto relative z-10">
            <div className="max-w-xl px-4 flex flex-col gap-8 items-start justify-start">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-10 lg:leading-16 text-white drop-shadow-xl">
                {firstHalf}
                <br />
                <span className="text-sky-400">{secondHalf}</span>
              </h1>

              <p className="text-gray-100 text-lg font-medium mx-auto lg:mx-0 max-w-lg drop-shadow-lg">
                {subtitle}
              </p>
              <Link href="/shop">
                <Button text="Shop Now" icon={FaShoppingBag} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroAbout;
