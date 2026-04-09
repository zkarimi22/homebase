import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export async function POST(request: Request) {
  const { messages } = await request.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system:
      "You are Homebase, a helpful AI assistant for homeowners. You help with home maintenance, " +
      "property questions, budgeting, project planning, and neighborhood information. " +
      "Keep answers concise and practical. If a question is about a specific document, " +
      "suggest the user check their Documents tab.",
    messages,
  });

  return result.toTextStreamResponse();
}
