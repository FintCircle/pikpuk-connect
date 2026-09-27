import { S3Client } from "@aws-sdk/client-s3";

export type R2Config = {
  client: S3Client;
  bucket: string;
  publicBaseUrl: string;
};

/**
 * Build the R2 (S3-compatible) client. Must only be called inside a server
 * function handler: env vars are injected per request in the worker runtime.
 */
export function getR2(): R2Config {
  const accountId = process.env["R2_ACCOUNT_ID"];
  const accessKeyId = process.env["R2_ACCESS_KEY_ID"];
  const secretAccessKey = process.env["R2_SECRET_ACCESS_KEY"];
  const bucket = process.env["R2_BUCKET_NAME"];
  const publicBaseUrl = process.env["R2_PUBLIC_URL"];

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicBaseUrl) {
    throw new Error(
      "Media storage is not configured yet. Missing one of R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL.",
    );
  }

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  return { client, bucket, publicBaseUrl: publicBaseUrl.replace(/\/$/, "") };
}
