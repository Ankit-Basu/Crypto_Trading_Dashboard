import { NextResponse } from 'next/server';
import { generateGeminiResponse } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Add crypto trading context to the prompt
    const prompt = `You are a cryptocurrency trading assistant. Help the user with their query about crypto trading, market analysis, and investment strategies. Provide clear, concise responses without using asterisks (*). Format lists with bullet points (•) instead. Here's the user's message: ${message}`;

    const response = await generateGeminiResponse(prompt);

    // Clean up the response by replacing asterisks with bullet points
    const cleanedResponse = response
      .replace(/\*\*/g, '') // Remove double asterisks
      .replace(/\*/g, '•')  // Replace single asterisks with bullet points
      .trim();

    return NextResponse.json({ response: cleanedResponse });
  } catch (error) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate response';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
