import { createServerFn } from "@tanstack/react-start";
import * as Sentry from "@sentry/react";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

type UploadPayload = {
  dataUri: string;
  userId: string;
};

type PortfolioUploadPayload = UploadPayload & {
  projectIndex: number;
};

type LogoUploadPayload = {
  dataUri: string;
  companyId: string;
};

function assertDataUri(dataUri: string) {
  if (!dataUri.startsWith("data:image/")) {
    throw new Error("Only image uploads are supported.");
  }
  const base64 = dataUri.split(",")[1] ?? "";
  const bytes = Math.ceil((base64.length * 3) / 4);
  if (bytes > MAX_IMAGE_BYTES) {
    throw new Error("Image must be 5 MB or smaller.");
  }
}

export const uploadProfilePhotoFn = createServerFn({ method: "POST" })
  .validator((data: UploadPayload) => data)
  .handler(async ({ data }) => {
    try {
      assertDataUri(data.dataUri);
      const { uploadProfilePhotoFromDataUri } = await import("@/lib/cloudinary.server");
      const url = await uploadProfilePhotoFromDataUri(
        data.dataUri,
        data.userId
      );
      return { url };
    } catch (error) {
      Sentry.captureException(error, {
        extra: { userId: data.userId },
        tags: { feature: "uploads", type: "profile" },
      });
      throw error;
    }
  });

export const uploadPortfolioImageFn = createServerFn({ method: "POST" })
  .validator((data: PortfolioUploadPayload) => data)
  .handler(async ({ data }) => {
    try {
      assertDataUri(data.dataUri);
      const { uploadPortfolioImageFromDataUri } = await import("@/lib/cloudinary.server");
      return await uploadPortfolioImageFromDataUri(
        data.dataUri,
        data.userId,
        data.projectIndex
      );
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          userId: data.userId,
          projectIndex: data.projectIndex,
        },
        tags: { feature: "uploads", type: "portfolio" },
      });
      throw error;
    }
  });

export const uploadCompanyLogoFn = createServerFn({ method: "POST" })
  .validator((data: LogoUploadPayload) => data)
  .handler(async ({ data }) => {
    try {
      assertDataUri(data.dataUri);
      const { uploadCompanyLogoFromDataUri } = await import("@/lib/cloudinary.server");
      const url = await uploadCompanyLogoFromDataUri(
        data.dataUri,
        data.companyId
      );
      return { url };
    } catch (error) {
      Sentry.captureException(error, {
        extra: { companyId: data.companyId },
        tags: { feature: "uploads", type: "logo" },
      });
      throw error;
    }
  });
