import { neighborhoodFeed } from "@/lib/mock-data";

export async function GET() {
  const sorted = [...neighborhoodFeed].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return Response.json({ feed: sorted, total: sorted.length });
}
