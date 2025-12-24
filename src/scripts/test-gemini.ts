import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { GoogleGenerativeAI } from "@google/generative-ai";

async function testGemini() {
  console.log("Testing Gemini Integration...");
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Error: GEMINI_API_KEY is missing.");
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("Attempting generation with 'gemini-1.5-flash'...");
    
    const result = await model.generateContent("Hello, are you working?");
    const response = await result.response;
    console.log("Response:", response.text());
    console.log("✅ Success! Gemini is working.");

  } catch (error: any) {
    console.error("❌ Failed:", error.message);
  }
}

testGemini();
