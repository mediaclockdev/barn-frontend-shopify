"use client";

import AuthInput from "../ui/AuthInput";
import AuthButton from "../ui/AuthButton";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/src/utils/auth-api";
import { useState, useEffect } from "react";

const ResetPasswordForm = () => {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const id = params.get("id");

  useEffect(() => {
    if (!token || !id) {
      toast.error("Invalid or missing reset link. Please try again.");
      router.push("/forgot-password");
    }
  }, [token, id, router]);

  const schema = z
    .object({
      newPassword: z.string().min(6, "Password must be at least 6 characters"),
      confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
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
    if (!token || !id) {
      toast.error("Invalid reset link. Missing token or customer ID.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await resetPassword({
        id,
        resetToken: token,
        password: data.newPassword,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Password successfully updated!");

      setTimeout(() => {
        router.push("/login"); // or router.back()
      }, 1500);
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
      <AuthInput
        label="New Password"
        type="password"
        showPasswordToggle
        placeholder="******"
        required
        {...register("newPassword")}
        error={errors.newPassword?.message}
      />

      <AuthInput
        label="Confirm Password"
        type="password"
        placeholder="******"
        required
        {...register("confirmPassword")}
        error={errors.confirmPassword?.message}
      />

      <AuthButton
        text={isLoading ? "Resetting..." : "Reset Password"}
        type="submit"
        disabled={isLoading}
      />
    </form>
  );
};

export default ResetPasswordForm;
