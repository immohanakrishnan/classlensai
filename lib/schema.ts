import { z } from "zod";

export const classificationSchema = z.enum([
  "Poor",
  "Average",
  "Good",
  "Excellent",
]);

export const evaluationSchema = z.object({
  classification: classificationSchema,
  overallScore: z.number().int().min(0).max(100),
  summary: z.string().min(1),
  dimensions: z
    .array(
      z.object({
        name: z.string().min(1),
        score: z.number().int().min(0).max(100),
        reason: z.string().min(1),
      }),
    )
    .length(5),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  observations: z.array(
    z.object({
      timestampSeconds: z.number().min(0).nullable(),
      observation: z.string().min(1),
      recommendation: z.string().min(1),
    }),
  ),
  limitations: z.array(z.string()),
});

export type Evaluation = z.infer<typeof evaluationSchema>;

export const dimensionWeights = {
  "Teaching clarity": 0.25,
  "Student engagement": 0.25,
  "Lesson structure": 0.2,
  "Examples and explanations": 0.15,
  "Audio and visual usability": 0.15,
} as const;

export function classify(score: number) {
  if (score < 40) return "Poor";
  if (score < 60) return "Average";
  if (score < 80) return "Good";
  return "Excellent";
}
