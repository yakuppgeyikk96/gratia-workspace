import RegisterForm from "@/components/features/auth/RegisterForm";
import AuthPageLayout from "@/components/layout/AuthPageLayout";

export default async function RegisterPage() {
  return (
    <AuthPageLayout>
      <RegisterForm />
    </AuthPageLayout>
  );
}
