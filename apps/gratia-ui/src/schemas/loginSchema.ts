import { EMAIL_REGEX, PASSWORD_REGEX } from "@/constants";
import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .email("Please enter a valid email address")
    .regex(EMAIL_REGEX, "Please enter a valid email address")
    .min(1, "Email is required"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(
      PASSWORD_REGEX,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

export type LoginFormData = z.infer<typeof loginSchema>;
