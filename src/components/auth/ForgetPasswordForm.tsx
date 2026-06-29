"use client";

import React from "react";
import AuthInput from "../ui/AuthInput";
import AuthButton from "../ui/AuthButton";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { forgotPassword } from "@/src/utils/auth-api";
import { useState } from "react";

const ForgotPasswordForm = () => {
  const router = useRouter();

  const schema = z.object({
    email: z.string().email("Please enter a valid email"),
  });

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const result = await forgotPassword(data.email);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(result.message || "Reset link sent to your email!");

      // Delay to let the user process the toast
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 container max-w-lg mx-auto"
    >
      <div>
        <AuthInput
          label="Enter Email"
          type="email"
          placeholder="john.doe@xyz.com"
          required
          {...register("email")}
          error={errors.email?.message}
        />
        <p className="text-sm text-gray-500 mt-2">
          We will send you a reset password link.
        </p>
      </div>

      <AuthButton
        text={isLoading ? "Sending..." : "Send Reset Link"}
        type="submit"
        disabled={isLoading}
      />
    </form>
  );
};

export default ForgotPasswordForm;
