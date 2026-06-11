import { useState, useEffect } from "react";
import { Image } from "lucide-react";

interface ImageWithSkeletonProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  referrerPolicy?: "no-referrer" | "origin" | "unsafe-url";
  priority?: boolean; // If true, disable lazy loading and preload
}

export default function ImageWithSkeleton({
  src,
  alt,
  className = "",
  containerClassName = "",
  referrerPolicy = "no-referrer",
  priority = false,
}: ImageWithSkeletonProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Reset states whenever src changes
  useEffect(() => {
    setLoaded(false);
    setError(false);

    if (priority && src) {
      const img = new window.Image();
      img.src = src;
      img.onload = () => setLoaded(true);
      img.onerror = () => setError(true);
    }
  }, [src, priority]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${containerClassName}`}>
      {/* Premium Shimmer Skeleton Loader */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gradient-to-r from-babun-primary/5 via-babun-primary/10 to-babun-primary/5 animate-pulse flex items-center justify-center">
          {/* Subtle loading indicator and decorative grid */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px]" />
          <Image size={24} className="text-babun-primary/20 animate-bounce duration-1000" />
        </div>
      )}

      {/* Error Fallback layout */}
      {error && (
        <div className="absolute inset-0 bg-babun-primary/10 flex flex-col items-center justify-center text-babun-primary/40 gap-2 p-4 text-center">
          <Image size={24} className="opacity-60" />
          <span className="text-[10px] font-mono leading-none">הטעינה נכשלה • תצוגה מקדימה</span>
        </div>
      )}

      {/* Actual optimizing Image */}
      {!error && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          loading={priority ? "eager" : "lazy"}
          referrerPolicy={referrerPolicy}
          className={`${className} transition-all duration-700 ease-out ${
            loaded ? "opacity-100 scale-100 filter-none" : "opacity-0 scale-95 blur-xs"
          }`}
        />
      )}
    </div>
  );
}
