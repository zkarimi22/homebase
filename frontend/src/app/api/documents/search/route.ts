import { ddb, DOCUMENTS_TABLE } from "@/lib/aws";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { getAuthenticatedUser, unauthorized } from "@/lib/auth-server";

export async function GET(request: Request) {
  let user;
  try {
    user = await getAuthenticatedUser(request);
  } catch {
    return unauthorized();
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").toLowerCase();

  if (!q || q.length < 2) {
    return Response.json({ results: [] });
  }

  try {
    const result = await ddb.send(
      new QueryCommand({
        TableName: DOCUMENTS_TABLE,
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: { ":uid": user.userId },
      })
    );

    const matches = (result.Items || [])
      .filter((d) => d.name?.toLowerCase().includes(q) || d.category?.toLowerCase().includes(q))
      .slice(0, 8)
      .map((d) => ({ documentId: d.documentId, name: d.name, category: d.category }));

    return Response.json({ results: matches });
  } catch {
    return Response.json({ results: [] });
  }
}
