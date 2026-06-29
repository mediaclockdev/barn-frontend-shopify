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
    <AuthLayout title={data.login_title} image={data.login_image}>
      <Suspense fallback={<AuthFormSkeleton mode="login" />}>
        <AuthForm mode="login" />
      </Suspense>
    </AuthLayout>
  );
};

export default page;
