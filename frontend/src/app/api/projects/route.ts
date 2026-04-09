import { projects } from "@/lib/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const filtered = status
    ? projects.filter((p) => p.status === status)
    : projects;

  return Response.json({ projects: filtered, total: filtered.length });
}
