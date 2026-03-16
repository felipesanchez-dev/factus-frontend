"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/shared/lib/cn";

interface FileUploadProps {
  label: string;
  accept?: string;
  onFileSelect: (file: File | null) => void;
  preview?: string | null;
  error?: string;
  className?: string;
}

export function FileUpload({
  label,
  accept,
  onFileSelect,
  preview,
  error,
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const displayPreview = preview ?? localPreview;

  const handleFile = useCallback(
    (file: File | null) => {
      if (file && file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setLocalPreview(url);
      } else {
        setLocalPreview(null);
      }
      onFileSelect(file);
    },
    [onFileSelect],
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0] ?? null;
    handleFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    handleFile(file);
  }

  function handleClear() {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
        {label}
      </label>

      {displayPreview ? (
        <div className='relative inline-block'>
          <img
            src={displayPreview}
            alt='Preview'
            className='h-24 w-24 rounded-lg border border-gray-200 dark:border-gray-700 object-cover'
          />
          <button
            type='button'
            onClick={handleClear}
            className='absolute -right-2 -top-2 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600 transition-colors'
          >
            <X className='h-3.5 w-3.5' />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors",
            dragging
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
              : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800",
            error && "border-red-400",
          )}
        >
          <Upload className='h-6 w-6 text-gray-400' />
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Arrastra un archivo o{" "}
            <span className='text-blue-600 dark:text-blue-400 font-medium'>
              haz clic
            </span>
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type='file'
        accept={accept}
        onChange={handleChange}
        className='hidden'
      />
      {error && (
        <p className='text-xs text-red-500 dark:text-red-400'>{error}</p>
      )}
    </div>
  );
}
