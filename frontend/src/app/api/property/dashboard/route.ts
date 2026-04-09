import { property, financeSummary, projects, neighborhoodFeed, documents } from "@/lib/mock-data";

export async function GET() {
  return Response.json({
    property,
    stats: {
      home_value: financeSummary.home_value,
      equity: financeSummary.equity,
      documents_count: documents.length,
      active_projects: projects.filter((p) => p.status !== "completed").length,
      upcoming_events: neighborhoodFeed.filter(
        (n) => new Date(n.date) >= new Date()
      ).length,
    },
  });
}
