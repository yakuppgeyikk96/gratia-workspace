import { EMAIL_REGEX } from "@/constants";
import { z } from "zod";

const addressSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  email: z
    .string()
    .regex(EMAIL_REGEX, "Please enter a valid email address")
    .optional()
    .or(z.literal("")),
  addressLine1: z.string().min(5, "Address must be at least 5 characters"),
  addressLine2: z.string().optional().or(z.literal("")),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  postalCode: z.string().min(4, "Postal code must be at least 4 characters"),
  country: z.string().min(2, "Please select a country"),
});

export const shippingAddressSchema = z
  .object({
    shippingAddress: addressSchema,
    billingAddress: addressSchema.nullable().optional(),
    billingIsSameAsShipping: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.billingIsSameAsShipping) {
        return true;
      }
      return data.billingAddress !== undefined && data.billingAddress !== null;
    },
    {
      message: "Billing address is required when different from shipping",
      path: ["billingAddress"],
    }
  );

export type ShippingAddressFormData = z.infer<typeof shippingAddressSchema>;
