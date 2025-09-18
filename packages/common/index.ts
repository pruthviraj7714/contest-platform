import z from "zod";

export const AuhtSchema = z.email({
  error: "Email Should be valid",
});
