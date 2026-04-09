const region = process.env.AWS_REGION || "us-east-1";
const cognitoEndpoint = `https://cognito-idp.${region}.amazonaws.com/`;

export type AuthUser = { userId: string; email: string };

export async function getAuthenticatedUser(
  request: Request
): Promise<AuthUser> {
  const header = request.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) {
    throw new Error("Missing token");
  }

  const accessToken = header.slice(7);

  // Ask Cognito directly: "who does this token belong to?"
  const res = await fetch(cognitoEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "AWSCognitoIdentityProviderService.GetUser",
    },
    body: JSON.stringify({ AccessToken: accessToken }),
  });

  if (!res.ok) {
    throw new Error("Invalid or expired token");
  }

  const data = await res.json();
  const attrs = data.UserAttributes || [];
  const sub = attrs.find((a: { Name: string }) => a.Name === "sub")?.Value;
  const email = attrs.find((a: { Name: string }) => a.Name === "email")?.Value;

  if (!sub) throw new Error("Token missing sub");

  return { userId: sub, email: email || "" };
}

export function unauthorized(message = "Unauthorized") {
  return Response.json({ error: message }, { status: 401 });
}
