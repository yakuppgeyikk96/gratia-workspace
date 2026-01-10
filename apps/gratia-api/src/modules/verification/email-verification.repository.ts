import { and, eq, gt, lt, or } from "drizzle-orm";
import { db } from "../../config/postgres.config";
import {
  emailVerifications,
  type EmailVerification,
} from "../../db/schema/email-verification.schema";
import CreateVerificationDto from "./types/CreateVerificationDto";

export const createEmailVerification = async (
  data: CreateVerificationDto
): Promise<EmailVerification | null> => {
  await deleteExpiredEmailVerifications(data.token);

  const [verification] = await db
    .insert(emailVerifications)
    .values({ ...data })
    .returning();

  return verification || null;
};

export const verifyEmailCode = async (
  token: string,
  code: string
): Promise<EmailVerification | null> => {
  const [verification] = await db
    .select()
    .from(emailVerifications)
    .where(
      and(
        eq(emailVerifications.token, token),
        eq(emailVerifications.verificationCode, code),
        eq(emailVerifications.isUsed, false),
        gt(emailVerifications.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!verification) {
    return null;
  }

  const [updatedVerification] = await db
    .update(emailVerifications)
    .set({ isUsed: true })
    .where(eq(emailVerifications.id, verification.id))
    .returning();

  return updatedVerification || null;
};

export const deleteExpiredEmailVerifications = async (
  token: string
): Promise<void> => {
  await db
    .delete(emailVerifications)
    .where(
      and(
        eq(emailVerifications.token, token),
        or(
          lt(emailVerifications.expiresAt, new Date()),
          eq(emailVerifications.isUsed, true)
        )
      )
    );
};
