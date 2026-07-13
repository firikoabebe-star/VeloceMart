"use client";

import { useCallback, useState } from "react";
import { uploadImage } from "@/lib/api";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
}

export default function ImageUpload({
  value,
  onChange,
  className,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      setError(null);

      try {
        const result = await uploadImage(file);
        onChange(result.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setIsUploading(false);
      }
    },
    [onChange],
  );

  return (
    <div className={className}>
      <div className="flex items-start gap-4">
        {value ? (
          <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-lg border border-border/50">
            <img
              src={value}
              alt="Product image"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-error/80 text-white transition-colors hover:bg-error"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <label className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/50 transition-colors hover:border-accent-primary/50 hover:bg-surface-tertiary/50">
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent-primary" />
                <span className="text-xs text-text-muted">Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <svg className="h-8 w-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 6.75v12A2.25 2.25 0 003.75 21z" />
                </svg>
                <span className="text-xs text-text-muted">Upload image</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or enter image URL..."
          className="flex-1"
        />
      </div>
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
}
