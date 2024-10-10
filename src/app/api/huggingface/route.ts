// app/api/huggingface/route.ts
import { NextResponse } from "next/server";
import { HfInference } from "@huggingface/inference";

const inference = new HfInference(process.env.NEXT_API_KEY); // Use your API key from environment variables

async function query(data: any) {
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
  const data = await req.json();

  try {
    const result = await query(data);
    return NextResponse.json({ response: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
