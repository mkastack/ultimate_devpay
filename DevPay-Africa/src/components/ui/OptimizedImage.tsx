import { AdvancedImage, lazyload, placeholder } from "@cloudinary/react";
import { fill } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";
import { cld, isCloudinaryConfigured } from "@/lib/cloudinary-client";

interface OptimizedImageProps {
  publicId: string;
  width: number;
  height: number;
  alt: string;
  className?: string;
}

export function OptimizedImage({
  publicId,
  width,
  height,
  alt,
  className,
}: OptimizedImageProps) {
  if (!isCloudinaryConfigured()) {
    return null;
  }

  const img = cld
    .image(publicId)
    .resize(fill().width(width).height(height).gravity(autoGravity()));

  return (
    <AdvancedImage
      cldImg={img}
      plugins={[lazyload(), placeholder("blur")]}
      alt={alt}
      className={className}
    />
  );
}
