import { NextResponse } from "next/server";
import { loadViewer } from "@/server/session";
import { getStorage, UploadsDisabledError } from "@/providers/storage";
import { memoryRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const MAX_BYTES = 2 * 1024 * 1024;
const TYPES: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

// Magic-number sniffing so a renamed .exe/.html cannot pass as an image.
function sniff(buf: Buffer): string | null {
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP") return "image/webp";
  return null;
}

export async function POST(req: Request) {
  const viewer = await loadViewer(req.headers);
  if (!viewer) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!memoryRateLimit(`upload:${viewer.userId}`, 20, 60_000)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const form = await req.formData();
  const file = form.get("file");
  const kind = form.get("kind") === "avatar" ? "avatars" : "products";
  if (!(file instanceof File)) return NextResponse.json({ error: "no_file" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "too_large", maxBytes: MAX_BYTES }, { status: 413 });

  const data = Buffer.from(await file.arrayBuffer());
  const type = sniff(data);
  if (!type || !TYPES[type]) return NextResponse.json({ error: "unsupported_type" }, { status: 415 });

  try {
    const { url } = await getStorage().put({ data, contentType: type, ext: TYPES[type] }, kind);
    return NextResponse.json({ url });
  } catch (error) {
    if (error instanceof UploadsDisabledError) return NextResponse.json({ error: "uploads_disabled" }, { status: 503 });
    throw error;
  }
}
