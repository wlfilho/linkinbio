"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon, Video } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface FileUploadProps {
  label: string;
  accept: string;
  maxSize: number; // in bytes
  currentUrl?: string;
  onUploadComplete: (url: string) => void;
  onRemove?: () => void;
  error?: string;
  disabled?: boolean;
  type: "image" | "video";
}

export default function FileUpload({
  label,
  accept,
  maxSize,
  currentUrl,
  onUploadComplete,
  onRemove,
  error,
  disabled = false,
  type,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const generateUniqueFilename = (userId: string, originalFilename: string): string => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = originalFilename.split(".").pop();
    return `${userId}/${timestamp}_${randomString}.${extension}`;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize) {
      toast.error(`Arquivo muito grande. Tamanho máximo: ${formatFileSize(maxSize)}`);
      return;
    }

    // Validate file type
    const acceptedTypes = accept.split(",").map((t) => t.trim());
    const fileType = file.type;
    const isValidType = acceptedTypes.some((acceptedType) => {
      if (acceptedType.endsWith("/*")) {
        const baseType = acceptedType.split("/")[0];
        return fileType.startsWith(baseType + "/");
      }
      return fileType === acceptedType;
    });

    if (!isValidType) {
      toast.error("Tipo de arquivo não suportado");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      // Generate unique filename
      const filename = generateUniqueFilename(user.id, file.name);

      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Simulate progress (Supabase doesn't provide real-time progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload file
      const { data, error } = await supabase.storage
        .from("stories")
        .upload(filename, file, {
          cacheControl: "3600",
          upsert: false,
        });

      clearInterval(progressInterval);

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("stories")
        .getPublicUrl(filename);

      setUploadProgress(100);
      toast.success("Upload concluído!");
      onUploadComplete(publicUrl);

      // Clean up object URL
      URL.revokeObjectURL(objectUrl);
    } catch (error: any) {
      console.error("Upload error:", error);
      setPreviewUrl(null);
      
      if (error.message?.includes("already exists")) {
        toast.error("Arquivo já existe. Tente novamente.");
      } else if (error.message?.includes("storage quota")) {
        toast.error("Cota de armazenamento excedida");
      } else {
        toast.error("Erro ao fazer upload: " + (error.message || "Erro desconhecido"));
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onRemove) {
      onRemove();
    }
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="block text-sm font-medium text-[#F1FFFA]">
        {label}
      </label>

      {/* Upload Area */}
      <div className="relative">
        {previewUrl ? (
          // Preview
          <div className="relative rounded-lg overflow-hidden border border-[#3a3737] bg-[#212020]">
            {type === "image" ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-48 object-cover"
              />
            ) : (
              <video
                src={previewUrl}
                className="w-full h-48 object-cover"
                controls
              />
            )}
            
            {/* Remove Button */}
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                title="Remover"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        ) : (
          // Upload Button
          <button
            type="button"
            onClick={handleClick}
            disabled={disabled || isUploading}
            className={`
              w-full h-48 rounded-lg border-2 border-dashed transition-all
              flex flex-col items-center justify-center gap-3
              ${
                disabled || isUploading
                  ? "border-[#3a3737] bg-[#212020] cursor-not-allowed opacity-50"
                  : "border-[#3a3737] bg-[#212020] hover:border-[#177245] hover:bg-[#177245]/5 cursor-pointer"
              }
            `}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 text-[#177245] animate-spin" />
                <div className="text-center">
                  <p className="text-[#F1FFFA] font-medium">Fazendo upload...</p>
                  <p className="text-[#F1FFFA]/50 text-sm">{uploadProgress}%</p>
                </div>
                {/* Progress Bar */}
                <div className="w-48 h-2 bg-[#3a3737] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#177245] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </>
            ) : (
              <>
                {type === "image" ? (
                  <ImageIcon className="w-12 h-12 text-[#F1FFFA]/30" />
                ) : (
                  <Video className="w-12 h-12 text-[#F1FFFA]/30" />
                )}
                <div className="text-center">
                  <p className="text-[#F1FFFA] font-medium">
                    Clique para fazer upload
                  </p>
                  <p className="text-[#F1FFFA]/50 text-sm mt-1">
                    Tamanho máximo: {formatFileSize(maxSize)}
                  </p>
                </div>
                <Upload className="w-5 h-5 text-[#177245]" />
              </>
            )}
          </button>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {/* Help Text */}
      <p className="text-[#F1FFFA]/50 text-xs">
        {type === "image"
          ? "Formatos aceitos: JPG, PNG, WebP, GIF"
          : "Formatos aceitos: MP4, WebM, MOV"}
      </p>
    </div>
  );
}

