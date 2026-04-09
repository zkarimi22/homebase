import { S3Client } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const region = process.env.AWS_REGION || "us-east-1";

export const s3 = new S3Client({ region });

const ddbClient = new DynamoDBClient({ region });
export const ddb = DynamoDBDocumentClient.from(ddbClient);

export const DOCUMENTS_BUCKET = process.env.DOCUMENTS_BUCKET || "homebase-dev-documents";
export const DOCUMENTS_TABLE = process.env.DOCUMENTS_TABLE || "homebase-dev-documents";
export const PROJECTS_TABLE = process.env.PROJECTS_TABLE || "homebase-dev-projects";
