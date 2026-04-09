import { s3, ddb, DOCUMENTS_BUCKET, DOCUMENTS_TABLE } from "@/lib/aws";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

export async function POST(request: Request) {
  const { userId, fileName, fileType, fileSize, category } = await request.json();

  if (!userId || !fileName || !fileType) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const s3Key = `${userId}/${documentId}/${fileName}`;

    // Generate presigned upload URL (5 min expiry)
    const command = new PutObjectCommand({
      Bucket: DOCUMENTS_BUCKET,
      Key: s3Key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    // Store metadata in DynamoDB
    await ddb.send(
      new PutCommand({
        TableName: DOCUMENTS_TABLE,
        Item: {
          userId,
          documentId,
          name: fileName,
          category: category || "uncategorized",
          fileType,
          sizeKb: Math.round(fileSize / 1024),
          s3Key,
          uploadedAt: new Date().toISOString(),
        },
      })
    );

    return Response.json({ uploadUrl, documentId, s3Key });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to prepare upload";
    const code =
      typeof error === "object" && error !== null && "name" in error
        ? String(error.name)
        : "DocumentsUploadError";

    return Response.json({ error: message, code }, { status: 500 });
  }
}
