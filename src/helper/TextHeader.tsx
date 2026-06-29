"use client";

import Image from "next/image";
import React from "react";
import Button from "../components/ui/Button";
import { FaArrowCircleRight } from "react-icons/fa";
import Link from "next/link";

type Props = {
  text: string;
  highlightedText: string;
  url?: string;
  btn?: boolean;
  center?: boolean;
  shadow?: boolean;
  isGrid?: boolean;
  onClick?: () => void;
  lgCenter?: boolean;
};

const TextHeader: React.FC<Props> = ({
  text,
  highlightedText,
  center,
  onClick,
  shadow = true,
  btn = true,
  isGrid = false,
  url = "#",
  lgCenter,
}) => {
  return (
    <section className={`relative ${isGrid ? "py-3" : "pt-2 pb-6"}  w-full`}>
      <div
        className={`flex ${
          center
            ? "items-center justify-center text-center"
            : "items-start md:items-center justify-between text-left"
        } ${btn && "flex-col md:flex-row gap-5"} ${
          lgCenter
            ? "lg:items-center lg:justify-center lg:text-center"
            : "lg:items-start lg:justify-between lg:text-left"
        }`}
      >
        <div className="relative inline-block px-1">
          {shadow && (
            <Image
              src="/images/textImage.png"
              alt="Blur Background"
              width={600}
              height={300}
              className="absolute top-1/2 left-1/2 
              -translate-x-1/2 -translate-y-1/2 
              w-[120%] max-w-none opacity-80 pointer-events-none"
            />
          )}

          <h2 className="relative z-10 text-3xl md:text-4xl font-bold">
            <span>{text} </span>
            <span className="text-primary">{highlightedText}</span>
          </h2>
        </div>

        {btn && (
          <Link href={url}>
            <Button
              text="View All"
              icon={FaArrowCircleRight}
              onClick={onClick}
            />
          </Link>
        )}
      </div>
    </section>
  );
};

export default TextHeader;
