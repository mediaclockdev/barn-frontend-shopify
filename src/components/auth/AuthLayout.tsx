import Image from "next/image";
import React from "react";

type Props = {
  children: React.ReactNode;
  title?: string;
  image?: string;
};

const AuthLayout: React.FC<Props> = ({
  children,
  title = "Welcome To The Barn",
  image = "/images/auth/auth.png",
}) => {
  const isExternal = image.startsWith("http");

  return (
    <section className="section p-0!">
      <div className="w-full min-h-[calc(100vh-80px)] bg-white overflow-hidden shadow-lg grid md:grid-cols-2">
        <div className="relative hidden md:block">
          <Image
            src={image}
            alt="Auth Image"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            {...(isExternal ? { unoptimized: true } : {})}
          />
        </div>

        <div className="relative flex flex-col justify-center px-6 py-10 md:px-10 bg-linear-to-r from-cyan-50 to-white-50">
          {title && (
            <h1
              className="text-5xl font-semibold mb-6 lg:mb-10 text-center"
              dangerouslySetInnerHTML={{ __html: title }}
            ></h1>
          )}

          <div className="relative z-10">{children}</div>
        </div>
      </div>
    </section>
  );
};

export default AuthLayout;
