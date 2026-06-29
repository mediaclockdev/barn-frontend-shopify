import AuthLayout from "@/src/components/auth/AuthLayout";
import ForgetPasswordForm from "@/src/components/auth/ForgetPasswordForm";
import AuthFormSkeleton from "@/src/components/auth/AuthFormSkeleton";
import React, { Suspense } from "react";
import { getAuthPageData } from "@/src/utils/auth-cms-api";
import { AUTH_FALLBACK } from "@/src/utils/auth-fallback";

const page = async () => {
  const res = await getAuthPageData();
  const data = { ...AUTH_FALLBACK, ...(res?.data || {}) };

  return (
    <AuthLayout title={data.forget_title} image={data.forget_image}>
      <Suspense fallback={<AuthFormSkeleton mode="forget" />}>
        <ForgetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
};

export default page;
