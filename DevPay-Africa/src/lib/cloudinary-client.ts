import { Cloudinary } from "@cloudinary/url-gen";

export const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as
  | string
  | undefined;

export const cld = new Cloudinary({
  cloud: {
    cloudName: cloudinaryCloudName ?? "",
  },
});

export function isCloudinaryConfigured() {
  return Boolean(cloudinaryCloudName);
}

export function profilePhotoPublicId(userId: string) {
  return `devpay/profiles/user_${userId}`;
}

export function portfolioImagePublicId(userId: string, projectIndex: number) {
  return `devpay/portfolio/${userId}_project_${projectIndex}`;
}

export function companyLogoPublicId(companyId: string) {
  return `devpay/logos/company_${companyId}`;
}

export function isCloudinaryDeliveryUrl(url: string) {
  return url.includes("res.cloudinary.com");
}
