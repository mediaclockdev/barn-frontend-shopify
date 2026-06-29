import Image from "next/image";
import Link from "next/link";
import React from "react";
import Button from "../ui/Button";
import { FaShoppingBag } from "react-icons/fa";

type Prop = {
  id: number;
  name: string;
  image: string;
  to: string;
};

const CategoryCard: React.FC<Prop> = ({ name, image, to }) => {
  return (
    <Link
      href={to}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition duration-300 flex flex-col overflow-hidden"
    >
      {/* IMAGE */}
      <div className="relative aspect-video bg-gray-50 flex items-center justify-center">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain transition-transform duration-300 group-hover:scale-105 p-3"
        />
      </div>

      {/* CONTENT */}
      <div className="flex flex-col items-center text-center p-5 bg-gray-100    ">
        <h4 className="font-semibold text-xl mb-3">{name}</h4>

        <Button text="Shop Now" icon={FaShoppingBag} />
      </div>
    </Link>
  );
};

export default CategoryCard;
