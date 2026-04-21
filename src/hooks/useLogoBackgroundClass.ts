import { useEffect, useState } from 'react';

type LogoBackgroundClass = 'bg-proph-grey-logo' | 'bg-proph-black/40';

const DEFAULT_CLASS: LogoBackgroundClass = 'bg-proph-black/40';

/**
 * Picks a contrasting background for school logos.
 * Dark logos get a lighter chip, bright logos stay on dark chip.
 */
export const useLogoBackgroundClass = (logoUrl?: string | null): LogoBackgroundClass => {
  const [bgClass, setBgClass] = useState<LogoBackgroundClass>(DEFAULT_CLASS);

  useEffect(() => {
    if (!logoUrl) {
      setBgClass(DEFAULT_CLASS);
      return;
    }

    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      if (cancelled) return;

      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setBgClass(DEFAULT_CLASS);
          return;
        }

        const sampleSize = 28;
        canvas.width = sampleSize;
        canvas.height = sampleSize;
        ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

        const pixels = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
        let luminanceSum = 0;
        let visiblePixelCount = 0;

        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const a = pixels[i + 3];

          // Ignore transparent pixels to avoid skewing logos with whitespace.
          if (a < 32) continue;

          const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          luminanceSum += luminance;
          visiblePixelCount += 1;
        }

        if (visiblePixelCount === 0) {
          setBgClass(DEFAULT_CLASS);
          return;
        }

        const avgLuminance = luminanceSum / visiblePixelCount;
        setBgClass(avgLuminance < 130 ? 'bg-proph-grey-logo' : 'bg-proph-black/40');
      } catch {
        // If canvas is blocked by CORS, keep a safe default.
        setBgClass(DEFAULT_CLASS);
      }
    };

    img.onerror = () => {
      if (!cancelled) setBgClass(DEFAULT_CLASS);
    };

    img.src = logoUrl;

    return () => {
      cancelled = true;
    };
  }, [logoUrl]);

  return bgClass;
};
