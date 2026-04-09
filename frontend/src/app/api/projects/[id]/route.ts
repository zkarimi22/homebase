import { ddb, PROJECTS_TABLE } from "@/lib/aws";
import { UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { getAuthenticatedUser, unauthorized } from "@/lib/auth-server";

// Update project
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  let user;
  try {
    user = await getAuthenticatedUser(request);
  } catch {
    return unauthorized();
  }

  const { id } = await params;
  const updates = await request.json();

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
      Key: { userId: user.userId, projectId: id },
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
  let user;
  try {
    user = await getAuthenticatedUser(request);
  } catch {
    return unauthorized();
  }

  const { id } = await params;

  await ddb.send(
    new DeleteCommand({
      TableName: PROJECTS_TABLE,
      Key: { userId: user.userId, projectId: id },
    })
  );

  return Response.json({ success: true });
}
