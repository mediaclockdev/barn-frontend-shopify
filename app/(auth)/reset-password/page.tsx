import AuthLayout from "@/src/components/auth/AuthLayout";
import ResetPasswordForm from "@/src/components/auth/ResetPasswordForm";
import AuthFormSkeleton from "@/src/components/auth/AuthFormSkeleton";
import React, { Suspense } from "react";
import { getAuthPageData } from "@/src/utils/auth-cms-api";
import { AUTH_FALLBACK } from "@/src/utils/auth-fallback";

const page = async () => {
  const res = await getAuthPageData();
  const data = { ...AUTH_FALLBACK, ...(res?.data || {}) };

  return (
    <AuthLayout title={data.reset_title} image={data.reset_image}>
      <Suspense fallback={<AuthFormSkeleton mode="reset" />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
};

export default page;
