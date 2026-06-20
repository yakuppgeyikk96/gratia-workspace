import { z } from "zod";

export const productIdParamsSchema = z.object({
  productId: z.coerce.number().int().positive(),
});

export const addToWishlistSchema = z.object({
  productId: z.coerce.number().int().positive(),
});

export const checkWishlistQuerySchema = z.object({
  productIds: z
    .string()
    .min(1, "productIds is required")
    .transform((value, ctx) => {
      const parts = value.split(",").map((s) => s.trim()).filter(Boolean);
      const ids: number[] = [];

      for (const part of parts) {
        const n = Number(part);
        if (!Number.isInteger(n) || n <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Invalid product id: ${part}`,
          });
          return z.NEVER;
        }
        ids.push(n);
      }

      if (ids.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "productIds is required",
        });
        return z.NEVER;
      }

      if (ids.length > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Too many product ids (max 100)",
        });
        return z.NEVER;
      }

      return Array.from(new Set(ids));
    }),
});
