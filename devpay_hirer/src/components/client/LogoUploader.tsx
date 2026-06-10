import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { Avatar } from "./Avatar";
import { uploadLogo, MAX_BYTES, MIN_DIM, MAX_DIM } from "@/lib/upload.functions";
import { setStoredLogo, useLogoUrl } from "@/lib/logo";

const ACCEPT = "image/png,image/jpeg,image/webp,image/gif";
const ACCEPT_SET = new Set(ACCEPT.split(","));

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new Error("READ_FAILED"));
    r.onload = () => resolve(String(r.result));
    r.readAsDataURL(file);
  });
}

function getDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("DECODE_FAILED"));
    img.src = dataUrl;
  });
}

function friendlyError(msg: string): string {
  if (msg.startsWith("INVALID_TYPE") || msg.startsWith("MIME_MISMATCH")) return "Please upload a PNG, JPG, WEBP, or GIF image.";
  if (msg.startsWith("TOO_LARGE_DIMENSIONS")) return `Image is too large. Max ${MAX_DIM}×${MAX_DIM}px.`;
  if (msg.startsWith("TOO_LARGE")) return `File is too big. Keep it under ${(MAX_BYTES / 1024 / 1024).toFixed(0)} MB.`;
  if (msg.startsWith("TOO_SMALL")) return `Image is too small. Use at least ${MIN_DIM}×${MIN_DIM}px.`;
  if (msg.startsWith("UNRECOGNIZED_IMAGE")) return "That file doesn't look like a valid image.";
  if (msg.startsWith("EMPTY_FILE")) return "The selected file is empty.";
  if (msg.startsWith("UPLOAD_FAILED")) return "Upload failed. Please try again.";
  return "Something went wrong. Please try again.";
}

export function LogoUploader({ name, sessionId }: { name: string; sessionId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const url = useLogoUrl();
  const [busy, setBusy] = useState(false);
  const upload = useServerFn(uploadLogo);

  const pick = () => inputRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    // Client validation: type
    if (!ACCEPT_SET.has(file.type)) {
      toast.error("Please upload a PNG, JPG, WEBP, or GIF image.");
      return;
    }
    // Client validation: size
    if (file.size === 0) { toast.error("The selected file is empty."); return; }
    if (file.size > MAX_BYTES) {
      toast.error(`File is too big. Keep it under ${(MAX_BYTES / 1024 / 1024).toFixed(0)} MB.`);
      return;
    }

    setBusy(true);
    try {
      // Decode to check dimensions client-side before round-tripping bytes
      const dataUrl = await readAsDataURL(file);
      const dims = await getDimensions(dataUrl).catch(() => null);
      if (!dims) { toast.error("That file doesn't look like a valid image."); return; }
      if (dims.width < MIN_DIM || dims.height < MIN_DIM) {
        toast.error(`Image is too small. Use at least ${MIN_DIM}×${MIN_DIM}px.`);
        return;
      }
      if (dims.width > MAX_DIM || dims.height > MAX_DIM) {
        toast.error(`Image is too large. Max ${MAX_DIM}×${MAX_DIM}px.`);
        return;
      }

      const data_b64 = dataUrl.split(",")[1] ?? "";
      const result = await upload({
        data: { session_id: sessionId, filename: file.name, mime: file.type, data_b64 },
      });
      setStoredLogo(result.url);
      toast.success("Logo updated.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(friendlyError(msg));
    } finally {
      setBusy(false);
    }
  };

  const remove = () => {
    setStoredLogo(null);
    toast.success("Logo removed.");
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <Avatar src={url} name={name} size={96} rounded="lg" />
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={onFile}
        aria-label="Choose logo image"
      />
      <div className="flex w-full flex-col gap-2">
        <button
          type="button"
          onClick={pick}
          disabled={busy}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border text-[13px] font-semibold transition-colors hover:bg-accent disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
          style={{ borderColor: "var(--gold)", color: "var(--gold)" }}
          aria-busy={busy}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          {busy ? "Uploading…" : url ? "Replace logo" : "Upload logo"}
        </button>
        {url && (
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg text-[12px] font-medium transition-colors hover:bg-accent disabled:opacity-60"
            style={{ color: "var(--text-secondary)" }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </button>
        )}
      </div>
      <p className="text-center text-[11px]" style={{ color: "var(--text-muted)" }}>
        PNG, JPG, WEBP or GIF · {MIN_DIM}–{MAX_DIM}px · max {(MAX_BYTES / 1024 / 1024).toFixed(0)} MB
      </p>
    </div>
  );
}
