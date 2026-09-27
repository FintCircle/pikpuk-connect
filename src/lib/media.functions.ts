import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/tiff"] as const;
const MAX_BYTES = 25 * 1024 * 1024;

const uploadRequestSchema = z.object({
  fileName: z.string().min(1).max(200),
  contentType: z.enum(ALLOWED_TYPES),
  size: z.number().int().positive().max(MAX_BYTES),
});

function safeExtension(fileName: string, contentType: string) {
  const fromName = fileName.toLowerCase().match(/\.([a-z0-9]{2,5})$/)?.[1];
  if (fromName) return fromName;
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
    "image/tiff": "tif",
  };
  return map[contentType] ?? "bin";
}

/** Returns a short-lived direct upload URL for the signed-in user. */
export const createUploadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => uploadRequestSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
    const { getR2 } = await import("./r2.server");

    const { client, bucket, publicBaseUrl } = getR2();

    const ext = safeExtension(data.fileName, data.contentType);
    const key = `submissions/${context.userId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const uploadUrl = await getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: data.contentType,
        ContentLength: data.size,
      }),
      { expiresIn: 300 },
    );

    return { uploadUrl, key, publicUrl: `${publicBaseUrl}/${key}` };
  });

/** Removes one of the signed-in user's own uploads. */
export const deleteUpload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ key: z.string().min(1) }).parse(input))
  .handler(async ({ data, context }) => {
    if (!data.key.startsWith(`submissions/${context.userId}/`)) {
      throw new Error("You can only remove your own uploads.");
    }

    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    const { getR2 } = await import("./r2.server");
    const { client, bucket } = getR2();

    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: data.key }));
    return { ok: true };
  });
