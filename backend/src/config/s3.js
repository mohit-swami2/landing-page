import { S3Client } from "@aws-sdk/client-s3";

let s3ClientInstance = null;

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    const error = new Error(`Missing required environment variable: ${name}`);
    error.statusCode = 500;
    error.code = "S3_CONFIG_MISSING";
    throw error;
  }
  return value;
}

export function getS3Config() {
  return {
    region: requireEnv("AWS_REGION"),
    bucketName: requireEnv("AWS_BUCKET_NAME"),
    credentials: {
      accessKeyId: requireEnv("AWS_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("AWS_SECRET_ACCESS_KEY")
    }
  };
}

export function getS3Client() {
  if (s3ClientInstance) return s3ClientInstance;

  const config = getS3Config();
  s3ClientInstance = new S3Client({
    region: config.region,
    credentials: config.credentials
  });

  return s3ClientInstance;
}
