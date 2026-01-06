"use client";

import React, { useCallback, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  onUpload: (file: File) => Promise<void>;
  onAnalyze: (imageUrl: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ onUpload, onAnalyze, disabled }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    setIsUploading(true);
    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setImageUrl(base64);
    };
    reader.readAsDataURL(file);

    try {
      await onUpload(file);
    } finally {
      setIsUploading(false);
    }
  }, [onUpload]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile, disabled],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    },
    [],
  );

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleAnalyze = useCallback(() => {
    if (imageUrl) {
      onAnalyze(imageUrl);
    }
  }, [imageUrl, onAnalyze]);

  const handleReset = useCallback(() => {
    setImageFile(null);
    setImageUrl(null);
  }, []);

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const files = e.target.files;
            if (files && files.length > 0) {
              handleFile(files[0]);
            }
          }}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center justify-center h-full pointer-events-none">
          {isUploading ? (
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600" />
              <p className="text-sm text-gray-600">Uploading image...</p>
            </div>
          ) : imageUrl ? (
            <div className="flex flex-col items-center space-y-3">
              <img
                src={imageUrl}
                alt="Uploaded product"
                className="max-h-48 max-w-full rounded-lg object-contain"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAnalyze}
                  disabled={disabled}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                >
                  Analyze with AI
                </button>
                <button
                  onClick={handleReset}
                  disabled={disabled}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                >
                  <X size={16} className="inline-block" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3 text-gray-500">
              <ImageIcon size={48} className="text-gray-400" />
              <div>
                <p className="font-medium">
                  {isDragging ? "Drop your image here" : "Drag & drop a product image"}
                </p>
                <p className="text-sm">or click to browse</p>
              </div>
              <div className="text-xs text-gray-400">
                Supports: JPG, PNG, WebP
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
