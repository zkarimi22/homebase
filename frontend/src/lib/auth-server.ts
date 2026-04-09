import { createPublicKey, verify } from "crypto";

const region = process.env.AWS_REGION || "us-east-1";
const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || "";
const issuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;
const jwksUrl = `${issuer}/.well-known/jwks.json`;

type JWK = { kid: string; kty: string; n: string; e: string; alg: string; use: string };
let cachedKeys: JWK[] | null = null;

async function getKeys(): Promise<JWK[]> {
  if (cachedKeys) return cachedKeys;
  const res = await fetch(jwksUrl);
  const data = await res.json();
  cachedKeys = data.keys;
  return cachedKeys!;
}

function base64UrlDecode(str: string): Buffer {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(padded, "base64");
}

function verifyJwt(token: string, jwk: JWK): Record<string, unknown> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT");

  const header = JSON.parse(base64UrlDecode(parts[0]).toString());
  if (header.alg !== "RS256") throw new Error("Unsupported algorithm");

  const payload = JSON.parse(base64UrlDecode(parts[1]).toString());

  // Verify signature using Node.js crypto
  const key = createPublicKey({
    key: { kty: jwk.kty, n: jwk.n, e: jwk.e },
    format: "jwk",
  });

  const signatureValid = verify(
    "RSA-SHA256",
    Buffer.from(`${parts[0]}.${parts[1]}`),
    key,
    base64UrlDecode(parts[2])
  );

  if (!signatureValid) throw new Error("Invalid signature");

  // Check expiry
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token expired");
  }

  // Check issuer
  if (payload.iss !== issuer) {
    throw new Error("Invalid issuer");
  }

  return payload;
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

  // Decode header to get kid
  const headerPart = JSON.parse(base64UrlDecode(token.split(".")[0]).toString());
  const keys = await getKeys();
  const jwk = keys.find((k) => k.kid === headerPart.kid);
  if (!jwk) throw new Error("Unknown signing key");

  const payload = verifyJwt(token, jwk);

  const sub = payload.sub as string;
  if (!sub) throw new Error("Token missing sub claim");

  return {
    userId: sub,
    email: (payload.email as string) || "",
  };
}

export function unauthorized(message = "Unauthorized") {
  return Response.json({ error: message }, { status: 401 });
}
