import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import path from "path";
import { randomUUID } from "crypto";
import { getS3Client, getS3Config } from "../config/s3.js";

const DEFAULT_SIGNED_URL_EXPIRY_SECONDS = 900;

function mapS3Error(error, operation) {
  const mapped = new Error(`S3 ${operation} failed`);
  mapped.cause = error;

  if (error?.name === "InvalidAccessKeyId" || error?.name === "SignatureDoesNotMatch") {
    mapped.message = "Invalid AWS credentials";
    mapped.statusCode = 500;
    return mapped;
  }

  if (error?.name === "NoSuchBucket" || error?.$metadata?.httpStatusCode === 404) {
    mapped.message = "Invalid S3 bucket configuration";
    mapped.statusCode = 500;
    return mapped;
  }

  if (error?.name === "AccessDenied" || error?.$metadata?.httpStatusCode === 403) {
    mapped.message = "Access denied to S3 bucket";
    mapped.statusCode = 403;
    return mapped;
  }

  mapped.statusCode = 500;
  return mapped;
}

function sanitizeFileName(originalName = "file") {
  return path
    .basename(originalName)
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

export function buildUploadKey(originalFilename) {
  const timestamp = Date.now();
  const uuid = randomUUID();
  const cleanName = sanitizeFileName(originalFilename);
  return `uploads/${timestamp}-${uuid}-${cleanName}`;
}

export async function assertS3Access() {
  const client = getS3Client();
  const { bucketName } = getS3Config();
  try {
    await client.send(new HeadBucketCommand({ Bucket: bucketName }));
  } catch (error) {
    throw mapS3Error(error, "bucket validation");
  }
}

export async function uploadFile(file, keyOverride) {
  const client = getS3Client();
  const { bucketName } = getS3Config();
  const key = keyOverride || buildUploadKey(file.originalname);

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
      })
    );
  } catch (error) {
    throw mapS3Error(error, "upload");
  }

  console.info("[s3] upload success", {
    key,
    mimeType: file.mimetype,
    bytes: file.size
  });

  return {
    key,
    status: "uploaded"
  };
}

export async function deleteFile(key) {
  const client = getS3Client();
  const { bucketName } = getS3Config();

  try {
    await client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key
      })
    );
  } catch (error) {
    throw mapS3Error(error, "delete");
  }

  console.info("[s3] delete success", { key });
  return { key, status: "deleted" };
}

export async function getFile(key) {
  const client = getS3Client();
  const { bucketName } = getS3Config();

  try {
    const response = await client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: key
      })
    );
    return response;
  } catch (error) {
    throw mapS3Error(error, "get");
  }
}

export async function generatePresignedUploadUrl({
  key,
  contentType,
  expiresIn = DEFAULT_SIGNED_URL_EXPIRY_SECONDS
} = {}) {
  const client = getS3Client();
  const { bucketName } = getS3Config();
  const resolvedKey = key || buildUploadKey("file");

  try {
    const uploadUrl = await getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: bucketName,
        Key: resolvedKey,
        ContentType: contentType || "application/octet-stream"
      }),
      { expiresIn }
    );

    return {
      key: resolvedKey,
      uploadUrl,
      expiresIn
    };
  } catch (error) {
    throw mapS3Error(error, "presigned upload URL generation");
  }
}

export async function generatePresignedDownloadUrl({
  key,
  expiresIn = DEFAULT_SIGNED_URL_EXPIRY_SECONDS
}) {
  const client = getS3Client();
  const { bucketName } = getS3Config();

  try {
    const downloadUrl = await getSignedUrl(
      client,
      new GetObjectCommand({
        Bucket: bucketName,
        Key: key
      }),
      { expiresIn }
    );

    return {
      key,
      downloadUrl,
      expiresIn
    };
  } catch (error) {
    throw mapS3Error(error, "presigned download URL generation");
  }
}
