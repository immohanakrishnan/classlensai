import { GoogleGenerativeAI } from "@google/generative-ai";
import { classify, evaluationSchema, type Evaluation } from "./schema";

const prompt = `You are ClassLens AI, an evidence-focused evaluator of online children's classes. Analyze ONLY the teaching content and recording quality. Do not infer quality from appearance, identity, accent, gender, or demographic characteristics. Do not invent student responses, quotations, events, or timestamps. If students are not visible or engagement cannot be assessed, say so in limitations.

Return JSON only with this exact shape:
{ "classification": "Poor|Average|Good|Excellent", "overallScore": 0, "summary": "", "dimensions": [{"name":"Teaching clarity","score":0,"reason":""},{"name":"Student engagement","score":0,"reason":""},{"name":"Lesson structure","score":0,"reason":""},{"name":"Examples and explanations","score":0,"reason":""},{"name":"Audio and visual usability","score":0,"reason":""}], "strengths": [], "improvements": [], "observations": [{"timestampSeconds": 0, "observation":"", "recommendation":""}], "limitations": [] }

Score dimensions 0-100 and use the weighted rubric: clarity 25%, engagement 25%, structure 20%, examples 15%, usability 15%. Calculate overallScore from those weights and set classification using: 0-39 Poor, 40-59 Average, 60-79 Good, 80-100 Excellent. These are configurable prototype thresholds, not scientific validation. Use null for timestampSeconds when a timestamp cannot be verified from the recording.`;

export async function analyzeWithGemini(file: File): Promise<Evaluation> {
  const key = process.env.GEMINI_API_KEY;
  if (!key)
    throw new Error(
      "AI analysis is not configured. Add GEMINI_API_KEY after organizer approval.",
    );
  if (file.size > 20 * 1024 * 1024)
    throw new Error(
      "This prototype accepts uploaded videos up to 20 MB for direct multimodal analysis.",
    );
  const bytes = Buffer.from(await file.arrayBuffer());
  const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const model = new GoogleGenerativeAI(key).getGenerativeModel({
    model: modelName,
  });
  const result = await model.generateContent([
    { inlineData: { data: bytes.toString("base64"), mimeType: file.type } },
    { text: prompt },
  ]);
  const raw = result.response
    .text()
    .replace(/^```json\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  const parsed = evaluationSchema.parse(JSON.parse(raw));
  const weighted = parsed.dimensions.reduce((sum, dimension) => {
    const weight =
      dimension.name === "Teaching clarity"
        ? 0.25
        : dimension.name === "Student engagement"
          ? 0.25
          : dimension.name === "Lesson structure"
            ? 0.2
            : dimension.name === "Examples and explanations"
              ? 0.15
              : 0.15;
    return sum + dimension.score * weight;
  }, 0);
  return {
    ...parsed,
    overallScore: Math.round(weighted),
    classification: classify(Math.round(weighted)),
  };
}
