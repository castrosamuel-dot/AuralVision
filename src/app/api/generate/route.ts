import { model } from "@/lib/gemini";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { topic, category, tone } = await req.json();

    if (!topic || !category) {
      return NextResponse.json({ error: "Topic and Category are required" }, { status: 400 });
    }

    const prompt = `
      You are an expert Audio Visual technician, technology reviewer, and blogger for a site called "AuralVision".
      
      Write a comprehensive, engaging, and professional blog post about: "${topic}".
      Category: ${category}
      Tone: ${tone || 'Professional and Informative'}

      Structure the response in Markdown format.
      Include:
      1. A catchy Title (h1).
      2. An engaging Introduction.
      3. Well-structured body paragraphs with subheadings (h2, h3).
      4. A Conclusion.
      5. A short "Excerpt" at the very end, labeled as "EXCERPT:".

      Do not include any preamble like "Here is the blog post". Just output the content.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ content: text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to generate content" }, { status: 500 });
  }
}
