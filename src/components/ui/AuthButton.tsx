import React from "react";

type Prop = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  text: string;
  muted?: boolean;
};

const AuthButton: React.FC<Prop> = ({ text, muted = false, className, disabled, ...props }) => {
  return (
    <button
      {...props}
      disabled={disabled}
      className={`w-full ${muted ? "bg-text-muted/60" : "bg-primary"} text-white py-3 rounded-lg text-lg ${
        muted ? "hover:bg-text-muted" : "hover:bg-cyan-500"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} transition font-medium ${className || ""}`}
    >
      {text}
    </button>
  );
};

export default AuthButton;
