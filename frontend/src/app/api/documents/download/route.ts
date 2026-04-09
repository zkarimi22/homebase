import { s3, DOCUMENTS_BUCKET } from "@/lib/aws";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getAuthenticatedUser, unauthorized } from "@/lib/auth-server";

export async function POST(request: Request) {
  let user;
  try {
    user = await getAuthenticatedUser(request);
  } catch {
    return unauthorized();
  }

  const { s3Key } = await request.json();

  if (!s3Key) {
    return Response.json({ error: "Missing s3Key" }, { status: 400 });
  }

  // Verify the s3Key belongs to this user (keys are prefixed with userId/)
  if (!s3Key.startsWith(`${user.userId}/`)) {
    return Response.json({ error: "Access denied" }, { status: 403 });
  }

  try {
    const command = new GetObjectCommand({
      Bucket: DOCUMENTS_BUCKET,
      Key: s3Key,
    });

    const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return Response.json({ downloadUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to prepare download";
    const code =
      typeof error === "object" && error !== null && "name" in error
        ? String(error.name)
        : "DocumentsDownloadError";

    return Response.json({ error: message, code }, { status: 500 });
  }
}
