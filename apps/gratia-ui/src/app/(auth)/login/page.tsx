import LoginForm from "@/components/features/auth/LoginForm";
import AuthPageLayout from "@/components/layout/AuthPageLayout";

export default function LoginPage() {
  return (
    <AuthPageLayout>
      <LoginForm />
    </AuthPageLayout>
  );
}
