import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from "jose";

const region = process.env.AWS_REGION || "us-east-1";
const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || "";
const issuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;

// Lazy-init to avoid crashing at module load time
let _jwks: JWTVerifyGetKey | null = null;
function getJwks() {
  if (!_jwks) {
    _jwks = createRemoteJWKSet(
      new URL(`${issuer}/.well-known/jwks.json`)
    );
  }
  return _jwks;
}

export type AuthUser = { userId: string; email: string };

export async function getAuthenticatedUser(
  request: Request
): Promise<AuthUser> {
  const header = request.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) {
    throw new Error("Missing or invalid Authorization header");
  }

  const token = header.slice(7);
  const { payload } = await jwtVerify(token, getJwks(), { issuer });

  const sub = payload.sub;
  if (!sub) throw new Error("Token missing sub claim");

  return {
    userId: sub,
    email: (payload.email as string) || "",
  };
}

export function unauthorized(message = "Unauthorized") {
  return Response.json({ error: message }, { status: 401 });
}
