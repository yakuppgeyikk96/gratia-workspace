import { VerifyEmail } from "@/components/auth";

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
