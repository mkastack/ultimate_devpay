import { createServerFn } from "@tanstack/react-start";

export const MAX_BYTES = 4 * 1024 * 1024;
export const MIN_DIM = 96;
export const MAX_DIM = 4096;

type UploadPayload = {
  session_id: string;
  filename: string;
  mime: string;
  data_b64: string;
};

export const uploadLogo = createServerFn({ method: "POST" })
  .inputValidator((data: UploadPayload) => data)
  .handler(async ({ data }) => {
    const dataUrl = `data:${data.mime};base64,${data.data_b64}`;
    return { url: dataUrl };
  });
