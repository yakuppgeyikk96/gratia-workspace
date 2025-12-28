import { AuthPageLayout, RegisterForm } from "@/components/auth";

export default async function RegisterPage() {
  return (
    <AuthPageLayout>
      <RegisterForm />
    </AuthPageLayout>
  );
}
