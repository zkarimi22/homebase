import { ddb, DOCUMENTS_TABLE } from "@/lib/aws";
import { QueryCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { getAuthenticatedUser, unauthorized } from "@/lib/auth-server";

// List documents for the authenticated user
export async function GET(request: Request) {
  try {
    let user;
    try {
      user = await getAuthenticatedUser(request);
    } catch {
      return unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const result = await ddb.send(
      new QueryCommand({
        TableName: DOCUMENTS_TABLE,
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: { ":uid": user.userId },
      })
    );

    let docs = result.Items || [];

    if (category && category !== "all") {
      docs = docs.filter((d) => d.category === category);
    }

    docs.sort((a, b) => (b.uploadedAt || "").localeCompare(a.uploadedAt || ""));

    return Response.json({ documents: docs, total: docs.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}

// Delete a document
export async function DELETE(request: Request) {
  try {
    let user;
    try {
      user = await getAuthenticatedUser(request);
    } catch {
      return unauthorized();
    }

    const { documentId } = await request.json();

    await ddb.send(
      new DeleteCommand({
        TableName: DOCUMENTS_TABLE,
        Key: { userId: user.userId, documentId },
      })
    );

    return Response.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
