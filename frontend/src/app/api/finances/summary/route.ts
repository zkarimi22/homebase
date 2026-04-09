import { financeSummary, obligations } from "@/lib/mock-data";

export async function GET() {
  return Response.json({ summary: financeSummary, obligations });
}
