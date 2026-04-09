import { ddb, PROJECTS_TABLE } from "@/lib/aws";
import { QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { getAuthenticatedUser, unauthorized } from "@/lib/auth-server";

// List projects
export async function GET(request: Request) {
  let user;
  try {
    user = await getAuthenticatedUser(request);
  } catch {
    return unauthorized();
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  try {
    const result = await ddb.send(
      new QueryCommand({
        TableName: PROJECTS_TABLE,
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: { ":uid": user.userId },
      })
    );

    let projects = result.Items || [];

    if (status && status !== "all") {
      projects = projects.filter((p) => p.status === status);
    }

    projects.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

    return Response.json({ projects, total: projects.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load projects";
    return Response.json({ error: message }, { status: 500 });
  }
}

// Create project
export async function POST(request: Request) {
  let user;
  try {
    user = await getAuthenticatedUser(request);
  } catch {
    return unauthorized();
  }

  const { title, description, priority, budget } = await request.json();

  if (!title) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const projectId = `prj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const item = {
    userId: user.userId,
    projectId,
    title,
    description: description || "",
    status: "planned",
    priority: priority || "medium",
    budget: budget || 0,
    spent: 0,
    createdAt: new Date().toISOString(),
    startedAt: null,
    completedAt: null,
  };

  await ddb.send(
    new PutCommand({
      TableName: PROJECTS_TABLE,
      Item: item,
    })
  );

  return Response.json(item);
}
