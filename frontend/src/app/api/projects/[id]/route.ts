import { ddb, PROJECTS_TABLE } from "@/lib/aws";
import { UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

// Update project
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { userId, ...updates } = body;

  if (!userId) {
    return Response.json({ error: "Missing userId" }, { status: 400 });
  }

  // Build update expression dynamically
  const expressions: string[] = [];
  const names: Record<string, string> = {};
  const values: Record<string, unknown> = {};

  Object.entries(updates).forEach(([key, val]) => {
    const attr = `#${key}`;
    const placeholder = `:${key}`;
    expressions.push(`${attr} = ${placeholder}`);
    names[attr] = key;
    values[placeholder] = val;
  });

  // Auto-set timestamps on status changes
  if (updates.status === "in_progress" && !updates.startedAt) {
    expressions.push("#startedAt = :startedAt");
    names["#startedAt"] = "startedAt";
    values[":startedAt"] = new Date().toISOString();
  }
  if (updates.status === "completed" && !updates.completedAt) {
    expressions.push("#completedAt = :completedAt");
    names["#completedAt"] = "completedAt";
    values[":completedAt"] = new Date().toISOString();
  }

  const result = await ddb.send(
    new UpdateCommand({
      TableName: PROJECTS_TABLE,
      Key: { userId, projectId: id },
      UpdateExpression: `SET ${expressions.join(", ")}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ReturnValues: "ALL_NEW",
    })
  );

  return Response.json(result.Attributes);
}

// Delete project
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "default";

  await ddb.send(
    new DeleteCommand({
      TableName: PROJECTS_TABLE,
      Key: { userId, projectId: id },
    })
  );

  return Response.json({ success: true });
}
