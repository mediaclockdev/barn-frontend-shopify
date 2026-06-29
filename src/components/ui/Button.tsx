import React from "react";

type Prop = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  text: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const Button: React.FC<Prop> = ({
  text,
  className,
  onClick,
  icon: Icon,
  disabled,
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={disabled}
      className={`${className || ""} group relative overflow-hidden flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
        disabled
          ? "bg-primary-gray! cursor-not-allowed"
          : "cursor-pointer hover:bg-primary-dark"
      } leading-relaxed tracking-wide`}
      onClick={onClick}
    >
      <span className="relative z-10 flex items-center gap-2">
        {text}
        {Icon && <Icon />}
      </span>
    </button>
  );
};

export default Button;
