import TextHeader from "@/src/helper/TextHeader";
import { FaTruckFast } from "react-icons/fa6";
import { FaHeadphones } from "react-icons/fa";
import { PiMedalFill } from "react-icons/pi";
import React from "react";

interface CoreAboutProps {
  values: string[];
}

// Icons are fixed (design-level decision, not CMS-controlled)
const CORE_ICONS = [FaTruckFast, FaHeadphones, PiMedalFill];

const CoreAbout = ({ values }: CoreAboutProps) => {
  const cardData = values.map((text, index) => ({
    id: index + 1,
    icon: CORE_ICONS[index] || CORE_ICONS[0],
    text,
  }));

  return (
    <section className="halfSection pt-0!">
      <div className="container">
        {/* Header */}
        <div className="text-center mx-auto">
          <TextHeader
            btn={false}
            text="Our"
            highlightedText="Core Values"
            center={true}
            lgCenter={true}
          />
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 px-4 md:px-0">
          {cardData.map((card) => (
            <div
              key={card.id}
              className="group bg-white border border-gray-100 rounded-3xl p-10 flex flex-col items-center text-center gap-6 h-72 justify-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <card.icon size={36} />
              </div>

              <p className="text-gray-700 leading-relaxed font-medium px-4">
                {card.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoreAbout;
