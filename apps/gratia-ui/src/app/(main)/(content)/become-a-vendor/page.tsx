import { COOKIE_TOKEN_KEY, COOKIE_USER_KEY } from "@/constants";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Container from "@gratia/ui/components/Container";
import type { IUser } from "@/types/User.types";
import BecomeVendorForm from "@/components/features/vendor/BecomeVendorForm";
import { Flex } from "@gratia/ui";

export default async function BecomeVendorPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_TOKEN_KEY)?.value;
  const userCookie = cookieStore.get(COOKIE_USER_KEY)?.value;

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
      <Flex direction="column" align="center" className="gap-8 py-12">
        <BecomeVendorForm user={user} />
      </Flex>
    </Container>
  );
}
