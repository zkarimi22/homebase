import { s3, DOCUMENTS_BUCKET } from "@/lib/aws";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function POST(request: Request) {
  const { s3Key } = await request.json();

  if (!s3Key) {
    return Response.json({ error: "Missing s3Key" }, { status: 400 });
  }

  const command = new GetObjectCommand({
    Bucket: DOCUMENTS_BUCKET,
    Key: s3Key,
  });

  // 1 hour download link
  const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

  return Response.json({ downloadUrl });
}
