import { put } from "@vercel/blob";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { env } from "@/env";

export interface Storage {
  readonly name: string;
  put(file: { data: Buffer; contentType: string; ext: string }, folder: string): Promise<{ url: string }>;
}

export class UploadsDisabledError extends Error {
  constructor() {
    super("Uploads are not configured (set BLOB_READ_WRITE_TOKEN).");
  }
}

class VercelBlobStorage implements Storage {
  readonly name = "vercel-blob";
  async put(file: { data: Buffer; contentType: string; ext: string }, folder: string) {
    const blob = await put(`${folder}/${randomBytes(8).toString("hex")}.${file.ext}`, file.data, { access: "public", contentType: file.contentType, token: env.BLOB_READ_WRITE_TOKEN });
    return { url: blob.url };
  }
}

/** Local development ONLY – never used when NODE_ENV=production (serverless file systems are read-only/ephemeral). */
class LocalDevStorage implements Storage {
  readonly name = "local-dev";
  async put(file: { data: Buffer; contentType: string; ext: string }, folder: string) {
    const name = `${randomBytes(8).toString("hex")}.${file.ext}`;
    const dir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), file.data);
    return { url: `/uploads/${folder}/${name}` };
  }
}

export function getStorage(): Storage {
  if (env.BLOB_READ_WRITE_TOKEN) return new VercelBlobStorage();
  if (env.NODE_ENV !== "production") return new LocalDevStorage();
  throw new UploadsDisabledError();
}
