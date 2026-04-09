import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export async function POST(request: Request) {
  const { messages } = await request.json();

  // v6 useChat sends messages with `parts` array instead of `content`.
  // Convert to the standard { role, content } format that streamText expects.
  const normalized = messages.map(
    (m: { role: string; content?: string; parts?: { type: string; text: string }[] }) => ({
      role: m.role,
      content:
        m.content ??
        m.parts
          ?.filter((p: { type: string }) => p.type === "text")
          .map((p: { text: string }) => p.text)
          .join("") ??
        "",
    })
  );

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system:
      "You are Homebase, a helpful AI assistant for homeowners. You help with home maintenance, " +
      "property questions, budgeting, project planning, and neighborhood information. " +
      "Keep answers concise and practical. If a question is about a specific document, " +
      "suggest the user check their Documents tab.",
    messages: normalized,
  });

  return result.toUIMessageStreamResponse();
}
