import VerifyEmail from "@/components/auth/VerifyEmail";
import { isAuthenticatedUser } from "@/actions/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

interface VerifyEmailPageProps {
  searchParams: Promise<{
    key: string;
  }>;
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { key } = await searchParams;

  // Check if user is authenticated
  const isAuthenticated = await isAuthenticatedUser();

  if (!isAuthenticated) {
    redirect("/login");
  }

  // Check if user is already verified
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("gratia-user")?.value;

  if (userCookie) {
    try {
      const user = JSON.parse(userCookie);
      if (user.isEmailVerified) {
        redirect("/");
      }
    } catch (error) {
      console.error("Failed to parse user cookie:", error);
    }
  }

  return <VerifyEmail token={key} />;
}
