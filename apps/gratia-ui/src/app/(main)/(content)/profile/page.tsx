import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Container from "@gratia/ui/components/Container";
import type { IUser } from "@/types/User.types";
import ProfilePageContent from "@/components/features/profile/ProfilePageContent";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("gratia-token")?.value;
  const userCookie = cookieStore.get("gratia-user")?.value;

  if (!token || !userCookie) {
    redirect("/login");
  }

  let user: IUser;
  try {
    user = JSON.parse(userCookie);
  } catch {
    redirect("/login");
  }

  return (
    <Container>
      <ProfilePageContent user={user} />
    </Container>
  );
}