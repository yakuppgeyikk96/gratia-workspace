import AuthPageLayout from "@/components/features/auth/AuthPageLayout";
import RegisterForm from "@/components/features/auth/RegisterForm";

export default async function RegisterPage() {
  return (
    <AuthPageLayout>
      <RegisterForm />
    </AuthPageLayout>
  );
}
