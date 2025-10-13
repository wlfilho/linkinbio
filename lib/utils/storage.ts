/**
 * Utility functions for Supabase Storage operations
 */

import { createClient } from "@/lib/supabase/client";

/**
 * Extract the file path from a Supabase Storage public URL
 * @param url - The full public URL from Supabase Storage
 * @returns The file path within the bucket, or null if invalid
 */
export function extractFilePathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // Supabase storage URLs follow this pattern:
    // https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
    const pathParts = urlObj.pathname.split("/");
    const publicIndex = pathParts.indexOf("public");
    
    if (publicIndex === -1 || publicIndex >= pathParts.length - 2) {
      return null;
    }
    
    // Skip "public" and bucket name, get the rest
    const filePath = pathParts.slice(publicIndex + 2).join("/");
    return filePath || null;
  } catch {
    return null;
  }
}

/**
 * Delete a file from Supabase Storage
 * @param bucketName - The name of the storage bucket
 * @param filePath - The path to the file within the bucket
 * @returns True if successful, false otherwise
 */
export async function deleteFileFromStorage(
  bucketName: string,
  filePath: string
): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase.storage.from(bucketName).remove([filePath]);

    if (error) {
      console.error("Error deleting file:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
}

/**
 * Delete a file from Supabase Storage using its public URL
 * @param url - The full public URL from Supabase Storage
 * @param bucketName - The name of the storage bucket
 * @returns True if successful, false otherwise
 */
export async function deleteFileByUrl(
  url: string,
  bucketName: string
): Promise<boolean> {
  const filePath = extractFilePathFromUrl(url);
  
  if (!filePath) {
    console.error("Invalid storage URL:", url);
    return false;
  }

  return deleteFileFromStorage(bucketName, filePath);
}

/**
 * Replace a file in storage (delete old, keep new)
 * Useful when updating a story's image/video
 * @param oldUrl - The URL of the file to delete
 * @param newUrl - The URL of the new file (for validation)
 * @param bucketName - The name of the storage bucket
 * @returns True if successful, false otherwise
 */
export async function replaceFile(
  oldUrl: string | null,
  newUrl: string,
  bucketName: string
): Promise<boolean> {
  // If there's no old URL, nothing to delete
  if (!oldUrl || oldUrl === newUrl) {
    return true;
  }

  // Only delete if the old URL is from our storage
  if (oldUrl.includes("supabase.co/storage")) {
    return deleteFileByUrl(oldUrl, bucketName);
  }

  return true;
}

/**
 * Get file size from URL
 * @param url - The URL of the file
 * @returns File size in bytes, or null if unable to determine
 */
export async function getFileSizeFromUrl(url: string): Promise<number | null> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    const contentLength = response.headers.get("content-length");
    return contentLength ? parseInt(contentLength, 10) : null;
  } catch {
    return null;
  }
}

/**
 * Format bytes to human-readable string
 * @param bytes - Number of bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Validate file type
 * @param file - The file to validate
 * @param acceptedTypes - Array of accepted MIME types (e.g., ["image/jpeg", "image/png"])
 * @returns True if valid, false otherwise
 */
export function validateFileType(file: File, acceptedTypes: string[]): boolean {
  return acceptedTypes.some((type) => {
    if (type.endsWith("/*")) {
      const baseType = type.split("/")[0];
      return file.type.startsWith(baseType + "/");
    }
    return file.type === type;
  });
}

/**
 * Validate file size
 * @param file - The file to validate
 * @param maxSize - Maximum size in bytes
 * @returns True if valid, false otherwise
 */
export function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize;
}

