import z from "zod";

export const AuhtSchema = z.email({
  error: "Email Should be valid",
});

const ChallangeSchema = z.object({
  index: z.number(),
  title: z.string(),
  description: z.string(),
  notionDocId: z.string(),
  startTime: z.date(),
  endTime: z.date(),
  isActive: z.boolean(),
  maxPoints: z.number(),
});
export const ContestSchema = z.object({
  title: z.string().min(5, {}),
  description: z.string().min(5, {}),
  startTime: z.date(),
  endTime: z.date(),
  challenges: z.array(ChallangeSchema),
});

export const EditContestSchema = z.object({
  id : z.string(),
  title: z.string().min(5, {}),
  description: z.string().min(5, {}),
  startTime: z.date(),
  endTime: z.date(),
  challenges: z.array(ChallangeSchema),
})
