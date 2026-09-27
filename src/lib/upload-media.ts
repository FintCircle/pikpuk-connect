import { createUploadUrl } from "./media.functions";

export type UploadedMedia = {
  key: string;
  publicUrl: string;
};

/**
 * Uploads a file straight from the browser to media storage using a
 * short-lived signed URL. Reports progress from 0 to 1.
 */
export async function uploadMedia(
  file: File,
  onProgress?: (fraction: number) => void,
): Promise<UploadedMedia> {
  const { uploadUrl, key, publicUrl } = await createUploadUrl({
    data: { fileName: file.name, contentType: file.type as never, size: file.size },
  });

  await new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", uploadUrl, true);
    request.setRequestHeader("Content-Type", file.type);

    request.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) onProgress(event.loaded / event.total);
    };
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        onProgress?.(1);
        resolve();
      } else {
        reject(new Error(`Upload failed (${request.status}). Please try again.`));
      }
    };
    request.onerror = () => reject(new Error("Upload failed. Please check your connection."));
    request.send(file);
  });

  return { key, publicUrl };
}
