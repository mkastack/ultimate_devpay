import { v2 as cloudinary } from "cloudinary";

if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ secure: true });
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

async function fileToDataUri(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString("base64");
  return `data:${file.type};base64,${base64}`;
}

export async function uploadProfilePhoto(file: File, userId: string) {
  const dataUri = await fileToDataUri(file);

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "devpay/profiles",
    public_id: `user_${userId}`,
    overwrite: true,
    transformation: [
      { width: 400, height: 400, crop: "fill", gravity: "face" },
      { quality: "auto", fetch_format: "auto" },
    ],
  });

  return result.secure_url;
}

export async function uploadProfilePhotoFromDataUri(
  dataUri: string,
  userId: string
) {
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "devpay/profiles",
    public_id: `user_${userId}`,
    overwrite: true,
    transformation: [
      { width: 400, height: 400, crop: "fill", gravity: "face" },
      { quality: "auto", fetch_format: "auto" },
    ],
  });

  return result.secure_url;
}

export async function uploadPortfolioImage(
  file: File,
  userId: string,
  projectIndex: number
) {
  const dataUri = await fileToDataUri(file);

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "devpay/portfolio",
    public_id: `${userId}_project_${projectIndex}`,
    overwrite: true,
    transformation: [
      { width: 1200, height: 800, crop: "fill" },
      { quality: "auto", fetch_format: "auto" },
    ],
  });

  return {
    full: result.secure_url,
    thumbnail: cloudinary.url(result.public_id, {
      width: 400,
      height: 267,
      crop: "fill",
      quality: "auto",
      fetch_format: "auto",
    }),
  };
}

export async function uploadPortfolioImageFromDataUri(
  dataUri: string,
  userId: string,
  projectIndex: number
) {
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "devpay/portfolio",
    public_id: `${userId}_project_${projectIndex}`,
    overwrite: true,
    transformation: [
      { width: 1200, height: 800, crop: "fill" },
      { quality: "auto", fetch_format: "auto" },
    ],
  });

  return {
    full: result.secure_url,
    thumbnail: cloudinary.url(result.public_id, {
      width: 400,
      height: 267,
      crop: "fill",
      quality: "auto",
      fetch_format: "auto",
    }),
  };
}

export async function uploadCompanyLogo(file: File, companyId: string) {
  const dataUri = await fileToDataUri(file);

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "devpay/logos",
    public_id: `company_${companyId}`,
    overwrite: true,
    background_removal: "cloudinary_ai",
    transformation: [
      { width: 200, height: 200, crop: "pad" },
      { quality: "auto", fetch_format: "auto" },
    ],
  });

  return result.secure_url;
}

export async function uploadCompanyLogoFromDataUri(
  dataUri: string,
  companyId: string
) {
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "devpay/logos",
    public_id: `company_${companyId}`,
    overwrite: true,
    background_removal: "cloudinary_ai",
    transformation: [
      { width: 200, height: 200, crop: "pad" },
      { quality: "auto", fetch_format: "auto" },
    ],
  });

  return result.secure_url;
}
