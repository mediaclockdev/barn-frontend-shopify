"use client";

import Link from "next/link";
import React, { forwardRef, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  isSignup?: boolean;
  error?: string; // Explicit error message prop for validation
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  (
    {
      label,
      type = "text",
      rightIcon,
      showPasswordToggle = false,
      isSignup = true,
      className,
      error,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const inputType =
      showPasswordToggle && type === "password"
        ? showPassword
          ? "text"
          : "password"
        : type;

    return (
      <div className="w-full">
        <label className="text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>

        <div className="relative mt-2">
          <input
            {...props}
            type={inputType}
            ref={ref}
            className={`w-full border ${
              error ? "border-red-500" : "border-cyan-400"
            } rounded-lg px-4 py-3 pr-10 bg-transparent outline-none focus:ring-1 ${
              error ? "focus:ring-red-500" : "focus:ring-cyan-400"
            } transition ${className || ""}`}
          />

          {/* Right Icon */}
          {rightIcon && !showPasswordToggle && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-500">
              {rightIcon}
            </div>
          )}

          {/* Password Toggle */}
          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-500 hover:text-gray-800"
            >
              {showPassword ? <FiEye /> : <FiEyeOff />}
            </button>
          )}
        </div>

        {error && (
          <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>
        )}

        {!isSignup && (
          <div className="flex justify-end">
            <Link href={"/forgot-password"}>
              <p className="text-sm text-cyan-500 mt-2 cursor-pointer hover:underline transition">
                Forgot Password?
              </p>
            </Link>
          </div>
        )}
      </div>
    );
  },
);

AuthInput.displayName = "AuthInput";

export default AuthInput;
