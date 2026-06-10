import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { inspectImage } from "./image-inspect";

const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
export const MAX_BYTES = 4 * 1024 * 1024; // 4 MB
export const MIN_DIM = 96;
export const MAX_DIM = 4096;

const UploadSchema = z.object({
  session_id: z.string().min(1).max(128).regex(/^[A-Za-z0-9_-]+$/),
  filename: z.string().min(1).max(180),
  mime: z.string().min(3).max(64),
  // base64-encoded bytes (no data: prefix)
  data_b64: z.string().min(10).max(Math.ceil((MAX_BYTES * 4) / 3) + 32),
});

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export const uploadLogo = createServerFn({ method: "POST" })
  .inputValidator((input) => UploadSchema.parse(input))
  .handler(async ({ data }) => {
    if (!ALLOWED.has(data.mime)) throw new Error("INVALID_TYPE");

    let bytes: Uint8Array;
    try { bytes = b64ToBytes(data.data_b64); }
    catch { throw new Error("INVALID_PAYLOAD"); }

    if (bytes.length === 0) throw new Error("EMPTY_FILE");
    if (bytes.length > MAX_BYTES) throw new Error("TOO_LARGE");

    // Verify magic bytes match the claimed MIME and read dimensions
    const meta = inspectImage(bytes);
    if (!meta) throw new Error("UNRECOGNIZED_IMAGE");
    if (meta.mime !== data.mime) throw new Error("MIME_MISMATCH");
    if (meta.width < MIN_DIM || meta.height < MIN_DIM) throw new Error(`TOO_SMALL:${MIN_DIM}`);
    if (meta.width > MAX_DIM || meta.height > MAX_DIM) throw new Error(`TOO_LARGE_DIMENSIONS:${MAX_DIM}`);

    const ext = meta.mime.split("/")[1].replace("jpeg", "jpg");
    const path = `${data.session_id}/${Date.now()}.${ext}`;

    const { error: upErr } = await supabaseAdmin
      .storage
      .from("logos")
      .upload(path, bytes, { contentType: meta.mime, upsert: true });
    if (upErr) throw new Error(`UPLOAD_FAILED:${upErr.message}`);

    const { data: signed, error: signErr } = await supabaseAdmin
      .storage
      .from("logos")
      .createSignedUrl(path, 60 * 60 * 24 * 365); // 1 year
    if (signErr || !signed) throw new Error("SIGN_FAILED");

    return {
      url: signed.signedUrl,
      path,
      width: meta.width,
      height: meta.height,
      mime: meta.mime,
      size: bytes.length,
    };
  });
