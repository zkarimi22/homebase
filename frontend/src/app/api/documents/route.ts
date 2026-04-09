import { documents } from "@/lib/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const filtered = category
    ? documents.filter((d) => d.category === category)
    : documents;

  return Response.json({ documents: filtered, total: filtered.length });
}
