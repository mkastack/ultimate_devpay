import { supabase } from "@/integrations/supabase/client";

const MAX_BYTES = 2 * 1024 * 1024;

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are supported.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be 2 MB or smaller.");
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    throw new Error(
      uploadError.message.includes("Bucket not found")
        ? "Avatar storage is not set up. Create a public \"avatars\" bucket in Supabase Storage."
        : uploadError.message
    );
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}
