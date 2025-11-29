import { EMAIL_REGEX, PASSWORD_REGEX } from "@/constants";
import { z } from "zod";

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),

  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters"),

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

  terms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
