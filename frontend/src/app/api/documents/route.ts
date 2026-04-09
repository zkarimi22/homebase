import { ddb, DOCUMENTS_TABLE } from "@/lib/aws";
import { QueryCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

// List documents for a user
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "default";
  const category = searchParams.get("category");

  const result = await ddb.send(
    new QueryCommand({
      TableName: DOCUMENTS_TABLE,
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: { ":uid": userId },
    })
  );

  let docs = result.Items || [];

  if (category && category !== "all") {
    docs = docs.filter((d) => d.category === category);
  }

  // Sort by uploadedAt descending
  docs.sort((a, b) => (b.uploadedAt || "").localeCompare(a.uploadedAt || ""));

  return Response.json({ documents: docs, total: docs.length });
}

// Delete a document
export async function DELETE(request: Request) {
  const { userId, documentId } = await request.json();

  await ddb.send(
    new DeleteCommand({
      TableName: DOCUMENTS_TABLE,
      Key: { userId, documentId },
    })
  );

  return Response.json({ success: true });
}
