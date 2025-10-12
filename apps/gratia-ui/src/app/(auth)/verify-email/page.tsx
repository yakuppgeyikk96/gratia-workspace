import VerifyEmail from "@/components/features/auth/VerifyEmail";

interface VerifyEmailPageProps {
  searchParams: Promise<{
    key: string;
  }>;
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { key } = await searchParams;
  return <VerifyEmail token={key} />;
}
