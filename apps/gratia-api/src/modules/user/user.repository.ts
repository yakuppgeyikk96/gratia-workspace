import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../../config/postgres.config";
import { users, User } from "../../db/schema/user.schema";
import { BCRYPT_ROUNDS } from "../../shared/constants/crypto.constants";
import { type CreateUserDto } from "./user.validation";

/**
 * PostgreSQL User Repository using Drizzle ORM
 * Equivalent to user.repository.ts (Mongoose version)
 */

export const createUser = async (userData: CreateUserDto): Promise<User | null> => {
  const hashedPassword = await bcrypt.hash(userData.password, BCRYPT_ROUNDS);

  const [user] = await db
    .insert(users)
    .values({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      emailVerified: true,
    })
    .returning();

  return user || null;
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  return user || null;
};

export const findUserIdByEmail = async (
  email: string
): Promise<number | undefined> => {
  // Optimized query: Only select id field instead of fetching full user object
  const [result] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  return result?.id;
};

export const findUserById = async (id: number): Promise<User | null> => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return user || null;
};