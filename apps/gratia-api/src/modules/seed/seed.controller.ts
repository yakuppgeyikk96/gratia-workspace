import { Request, Response } from "express";
import { seedDatabase } from "./seed.service";

export const runSeed = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.body;

    // Convert to number if they are strings (optional, depends on your API expectations)
    // Assuming backend validation or direct usage.
    // Usually vendorId is number, userId might be integer in this schema (user.schema.ts linked by vendors).

    // We pass them as unknown/any to service and handle types there or blindly pass if types match
    const result = await seedDatabase(vendorId);
    res.json(result);
  } catch (error) {
    console.error("Seed error:", error);
    res.status(500).json({ success: false, error: "Failed to seed database" });
  }
};
