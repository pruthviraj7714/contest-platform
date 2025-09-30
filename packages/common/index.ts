import z from "zod";

export const AuhtSchema = z.object({
  email: z.email({
    error: "Email Should be valid",
  }),
});

export const ChallangeSchema = z.object({
  index: z.number(),
  title: z.string(),
  description: z.string(),
  notionDocId: z.string(),
  startTime: z.date(),
  endTime: z.date(),
  maxPoints: z.number(),
});

export const EditChallangeSchema = z.object({
  index: z.number(),
  title: z.string(),
  description: z.string(),
  notionDocId: z.string(),
  startTime: z.date(),
  endTime: z.date(),
  maxPoints: z.number(),
});

export const ContestSchema = z.object({
  title: z.string().min(5, {}),
  description: z.string().min(5, {}),
  startTime: z.string(),
  endTime: z.string(),
});

export const EditContestSchema = z.object({
  title: z.string().min(5, {}),
  description: z.string().min(5, {}),
  startTime: z.date(),
  endTime: z.date(),
});

export const SetUsernameSchema = z.object({
  username : z.string().min(5)
})