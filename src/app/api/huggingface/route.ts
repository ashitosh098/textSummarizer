import { NextResponse } from "next/server";
import { HfInference } from "@huggingface/inference";

// Define an interface for the message structure
interface Message {
  role: string;
  content: string;
}

interface QueryData {
  messages: Message[];
}

const inference = new HfInference(process.env.NEXT_API_KEY); // Use your API key from environment variables

async function query(data: QueryData): Promise<string> {
  const response = inference.chatCompletionStream({
    model: "meta-llama/Llama-3.2-3B-Instruct",
    messages: data.messages,
    max_tokens: 500,
  });

  let result = "";

  for await (const chunk of response) {
    result += chunk.choices[0]?.delta?.content || "";
  }

  return result;
}

export async function POST(req: Request) {
  const data: QueryData = await req.json(); // Specify the expected type

  try {
    const result = await query(data);
    return NextResponse.json({ response: result });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
