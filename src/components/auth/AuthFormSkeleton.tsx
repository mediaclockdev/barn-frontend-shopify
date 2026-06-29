import React from "react";

type Prop = {
  mode: "login" | "signup" | "forget" | "reset";
};

const AuthFormSkeleton: React.FC<Prop> = ({ mode = "login" }) => {
  const isSignup = mode === "signup";
  const isForget = mode === "forget";

  return (
    <div className="space-y-4 container max-w-lg mx-auto animate-pulse">
      {isSignup && (
        <div className="grid grid-cols-2 gap-3">
          <div className="w-full">
            <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-[50px] bg-gray-100 rounded-lg w-full border border-gray-200"></div>
          </div>
          <div className="w-full">
            <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-[50px] bg-gray-100 rounded-lg w-full border border-gray-200"></div>
          </div>
        </div>
      )}

      {/* Primary Field (Email or Password for Reset) */}
      <div className="w-full">
        <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-[50px] bg-gray-100 rounded-lg w-full border border-gray-200"></div>
      </div>

      {/* Secondary Field (Password for Login/Signup, Confirm Password for Reset) */}
      {!isForget && (
        <div className="w-full">
          <div className="h-5 bg-gray-200 rounded w-28 mb-2"></div>
          <div className="h-[50px] bg-gray-100 rounded-lg w-full border border-gray-200"></div>
          {mode === "login" && (
            <div className="flex justify-end mt-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          )}
        </div>
      )}

      <div className="h-[50px] bg-cyan-100 rounded-lg w-full mt-2"></div>

      <div className="mt-6 flex justify-center">
        <div className="h-5 bg-gray-200 rounded w-48"></div>
      </div>
    </div>
  );
};

export default AuthFormSkeleton;
