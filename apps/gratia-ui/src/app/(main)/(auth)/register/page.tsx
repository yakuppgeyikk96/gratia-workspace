import AuthPageLayout from "@/components/auth/AuthPageLayout";
import RegisterForm from "@/components/auth/RegisterForm";

export default async function RegisterPage() {
  return (
    <AuthPageLayout>
      <RegisterForm />
    </AuthPageLayout>
  );
}
