// Temporary diagnostic route - test each import in isolation
export async function GET() {
  const results: Record<string, string> = {};

  // Test 1: basic response
  results.basic = "ok";

  // Test 2: can we import aws?
  try {
    const { DOCUMENTS_TABLE, PROJECTS_TABLE } = await import("@/lib/aws");
    results.aws_import = `ok: ${DOCUMENTS_TABLE}, ${PROJECTS_TABLE}`;
  } catch (e) {
    results.aws_import = `FAIL: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Test 3: can we import auth-server?
  try {
    const mod = await import("@/lib/auth-server");
    results.auth_import = `ok: ${typeof mod.getAuthenticatedUser}`;
  } catch (e) {
    results.auth_import = `FAIL: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Test 4: can we query DynamoDB?
  try {
    const { ddb, DOCUMENTS_TABLE } = await import("@/lib/aws");
    const { QueryCommand } = await import("@aws-sdk/lib-dynamodb");
    const result = await ddb.send(
      new QueryCommand({
        TableName: DOCUMENTS_TABLE,
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: { ":uid": "test" },
        Limit: 1,
      })
    );
    results.dynamodb = `ok: ${result.Items?.length ?? 0} items`;
  } catch (e) {
    results.dynamodb = `FAIL: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Test 5: env vars
  results.env_region = process.env.AWS_REGION || "(not set)";
  results.env_pool = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || "(not set)";
  results.env_docs_table = process.env.DOCUMENTS_TABLE || "(not set)";
  results.env_docs_bucket = process.env.DOCUMENTS_BUCKET || "(not set)";

  return Response.json(results);
}
