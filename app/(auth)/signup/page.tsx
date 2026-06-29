import AuthForm from "@/src/components/auth/AuthForm";
import AuthLayout from "@/src/components/auth/AuthLayout";
import AuthFormSkeleton from "@/src/components/auth/AuthFormSkeleton";
import { Suspense } from "react";
import { getAuthPageData } from "@/src/utils/auth-cms-api";
import { AUTH_FALLBACK } from "@/src/utils/auth-fallback";

const page = async () => {
  const res = await getAuthPageData();
  const data = { ...AUTH_FALLBACK, ...(res?.data || {}) };

  return (
    <AuthLayout title={data.signup_title} image={data.signup_image}>
      <Suspense fallback={<AuthFormSkeleton mode="signup" />}>
        <AuthForm mode="signup" />
      </Suspense>
    </AuthLayout>
  );
};

export default page;
