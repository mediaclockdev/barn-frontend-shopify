import Image from "next/image";
import {
  FaInstagram,
  FaFacebookF,
  FaLinkedinIn,
  FaPhoneAlt,
  FaClock,
} from "react-icons/fa";
import Link from "next/link";
import { FaLocationDot } from "react-icons/fa6";
import type { FooterData } from "@/src/utils/footer-fallback";

interface FooterProps {
  data: FooterData;
}

const Footer = ({ data }: FooterProps) => {
  // Format phone for display: "0412713501" → "0412 713 501"
  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\s/g, "");
    if (digits.length === 10) {
      return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    }
    return raw;
  };

  // Build quick links array, filtering out empty entries
  const quickLinks = [1, 2, 3, 4, 5]
    .map((i) => ({
      label: data[`quick_link_${i}_label` as keyof FooterData] as string,
      url: data[`quick_link_${i}_url` as keyof FooterData] as string,
    }))
    .filter((link) => link.label && link.url);

  // Build hours array
  const hours = [
    { label: "Mon – Thurs:", time: data.hours_mon_thu },
    { label: "Fri:", time: data.hours_fri },
    { label: "Sat:", time: data.hours_sat },
    { label: "Sun:", time: data.hours_sun },
  ];

  return (
    <footer className="bg-linear-to-b from-blue-50 via-transparent to-gray-50">
      <div className="container mx-auto px-4 lg:px-0 py-5 pb-2">
        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 lg:px-4">
          {/* LOGO + DESCRIPTION + SOCIALS + PAYMENTS */}
          <div>
            <Link href="/">
              <Image src="/logo.svg" alt="logo" width={120} height={120} />
            </Link>

            <p className="mt-5 text-base text-gray-900 leading-relaxed max-w-xs lg:w-[80%]">
              {data.business_description}
            </p>

            {/* Payments */}
            <div className="flex gap-2.5 mt-5 flex-wrap items-center">
              <Image
                src="/images/payment/pay1.svg"
                width={46}
                height={26}
                alt="payment"
              />
              <Image
                src="/images/payment/pay2.svg"
                width={35}
                height={26}
                alt="payment"
              />
              <Image
                src="/images/payment/pay3.svg"
                width={23}
                height={26}
                alt="payment"
              />
              <Image
                src="/images/payment/pay4.svg"
                width={70}
                height={26}
                alt="payment"
              />
              <Image
                src="/images/payment/pay5.svg"
                width={40}
                height={26}
                alt="payment"
              />
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="text-2xl font-semibold font-sans mb-6">
              Quick Links
            </h3>

            <ul className="space-y-3 text-base text-gray-900">
              {quickLinks.map(({ url, label }) => (
                <li key={url}>
                  <Link
                    href={url}
                    className="group flex items-center gap-3 relative w-fit"
                  >
                    <span className="relative">
                      {label}
                      {/* underline */}
                      <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-current transition-all duration-300 ease-out group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="text-2xl font-semibold font-sans mb-6">
              Contact Us
            </h3>

            {/* Address */}
            <a
              href={data.address_map_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 mb-4 max-w-xs lg:w-[80%] group hover:text-gray-700 transition-colors duration-300 ease-in-out"
            >
              <div className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-300 shrink-0 group-hover:border-gray-700 transition-colors duration-300 ease-in-out">
                <FaLocationDot className="text-gray-900 text-base group-hover:text-gray-700 transition-colors duration-300 ease-in-out" />
              </div>
              <p className="text-base text-gray-900 group-hover:text-gray-700 transition-colors duration-300 ease-in-out mt-1.5 lg:mt-0">
                {data.address}
              </p>
            </a>

            {/* Phone */}
            <a
              href={`tel:${data.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-3 mb-6 group hover:text-gray-700 transition-colors duration-300 ease-in-out"
            >
              <div className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-300 shrink-0 group-hover:border-gray-700 transition-colors duration-300 ease-in-out">
                <FaPhoneAlt className="text-gray-900 text-base group-hover:text-gray-700 transition-colors duration-300 ease-in-out" />
              </div>
              <p className="text-base text-gray-900 group-hover:text-gray-700 transition-colors duration-300 ease-in-out">
                {formatPhone(data.phone)}
              </p>
            </a>

            {/* Socials */}
            <div className="flex gap-2 items-center mt-6">
              <a
                href={data.social_instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-linear-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white hover:scale-105 transition shadow-sm"
              >
                <FaInstagram size={22} />
              </a>

              <a
                href={data.social_facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-600 text-white hover:scale-105 transition shadow-sm"
              >
                <FaFacebookF size={22} />
              </a>

              <a
                href={data.social_linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-700 text-white hover:scale-105 transition shadow-sm"
              >
                <FaLinkedinIn size={22} />
              </a>
            </div>
          </div>

          {/* CONNECT (TIMINGS) */}
          <div className="lg:w-[90%]">
            <h3 className="text-2xl font-semibold font-sans mb-6">Connect</h3>

            <div className="text-base space-y-3 text-gray-900">
              {hours.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-300 shrink-0">
                    <FaClock className="text-gray-900 text-base" />
                  </div>
                  <p>
                    <span className="font-medium">{item.label}</span>{" "}
                    {item.time}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="border-t border-gray-200 mt-8 pt-4 pb-2 text-center">
          <p className="text-base text-gray-900">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold">{data.business_name}</span> |
            Designed by{" "}
            <a
              href="https://www.itserviceshobart.com.au/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-600 hover:text-blue-800 transition-colors duration-300"
            >
              IT Services Hobart
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
