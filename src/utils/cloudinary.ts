/**
 * Optimizes Cloudinary URLs with automatic format, quality, and sizing
 * @param url - Original Cloudinary URL
 * @param width - Desired width in pixels
 * @param height - Desired height in pixels (optional, defaults to width for square)
 * @returns Optimized URL with transformations
 */
export const getOptimizedCloudinaryUrl = (
  url: string | undefined | null,
  width: number,
  height?: number
): string => {
  if (!url) return '';
  if (!url.includes('cloudinary.com')) return url;
  
  const h = height ?? width;
  // 2x for retina displays, auto format (webp/avif), auto quality
  return url.replace(
    '/upload/',
    `/upload/w_${width * 2},h_${h * 2},c_fill,f_auto,q_auto/`
  );
};

