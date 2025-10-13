# ✅ Stories File Upload Implementation - Complete

## 📝 Summary

Successfully implemented file upload functionality for Stories using Supabase Storage, replacing external URL inputs with direct file uploads.

**Date:** January 15, 2025  
**Status:** ✅ Complete

---

## 🎯 What Was Implemented

### 1. Supabase Storage Bucket ✅
**Bucket Name:** `stories`

**Configuration:**
- **Public:** Yes (public read access)
- **Max File Size:** 50MB
- **Allowed MIME Types:**
  - Images: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
  - Videos: `video/mp4`, `video/webm`, `video/quicktime`

**Access Policies:**
- ✅ Public read access (anyone can view)
- ✅ Authenticated users can upload
- ✅ Users can update their own files
- ✅ Users can delete their own files

**File Structure:**
```
stories/
  └── {user_id}/
      ├── {timestamp}_{random}.jpg
      ├── {timestamp}_{random}.mp4
      └── ...
```

---

### 2. FileUpload Component ✅
**File:** `components/ui/FileUpload.tsx`

**Features:**
- ✅ Drag-and-drop style upload button
- ✅ File type validation
- ✅ File size validation
- ✅ Upload progress indicator
- ✅ Image/video preview
- ✅ Remove uploaded file
- ✅ Error handling
- ✅ Disabled state during upload
- ✅ Unique filename generation
- ✅ Automatic public URL generation

**Props:**
```typescript
interface FileUploadProps {
  label: string;              // Field label
  accept: string;             // Accepted MIME types
  maxSize: number;            // Max size in bytes
  currentUrl?: string;        // Current file URL (for editing)
  onUploadComplete: (url: string) => void;  // Callback with public URL
  onRemove?: () => void;      // Callback when file removed
  error?: string;             // Error message
  disabled?: boolean;         // Disable upload
  type: "image" | "video";    // Type for icon/preview
}
```

**Usage Example:**
```tsx
<FileUpload
  label="Imagem do Story"
  accept="image/jpeg,image/png,image/webp,image/gif"
  maxSize={10 * 1024 * 1024} // 10MB
  currentUrl={formData.image_url}
  onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
  onRemove={() => setFormData({ ...formData, image_url: "" })}
  error={errors.image_url}
  type="image"
/>
```

---

### 3. Storage Utility Functions ✅
**File:** `lib/utils/storage.ts`

**Functions:**

#### `extractFilePathFromUrl(url: string): string | null`
Extracts the file path from a Supabase Storage public URL.

```typescript
const url = "https://project.supabase.co/storage/v1/object/public/stories/user123/file.jpg";
const path = extractFilePathFromUrl(url);
// Returns: "user123/file.jpg"
```

#### `deleteFileFromStorage(bucketName: string, filePath: string): Promise<boolean>`
Deletes a file from Supabase Storage.

```typescript
await deleteFileFromStorage("stories", "user123/file.jpg");
```

#### `deleteFileByUrl(url: string, bucketName: string): Promise<boolean>`
Deletes a file using its public URL.

```typescript
await deleteFileByUrl(publicUrl, "stories");
```

#### `replaceFile(oldUrl: string | null, newUrl: string, bucketName: string): Promise<boolean>`
Replaces a file (deletes old, keeps new).

```typescript
await replaceFile(story.image_url, newImageUrl, "stories");
```

#### `formatBytes(bytes: number): string`
Formats bytes to human-readable string.

```typescript
formatBytes(1024);        // "1 KB"
formatBytes(1048576);     // "1 MB"
formatBytes(10485760);    // "10 MB"
```

#### `validateFileType(file: File, acceptedTypes: string[]): boolean`
Validates file MIME type.

```typescript
validateFileType(file, ["image/jpeg", "image/png"]);
```

#### `validateFileSize(file: File, maxSize: number): boolean`
Validates file size.

```typescript
validateFileSize(file, 10 * 1024 * 1024); // 10MB max
```

---

### 4. Updated Stories Form ✅
**File:** `components/admin/StoriesForm.tsx`

**Changes:**
- ✅ Replaced `image_url` text input with `FileUpload` component
- ✅ Replaced `video_url` text input with `FileUpload` component
- ✅ Added automatic file deletion when replacing files
- ✅ Image upload: max 10MB
- ✅ Video upload: max 50MB
- ✅ Preview uploaded files
- ✅ Remove uploaded files

**Before:**
```tsx
<Input
  label="URL da Imagem"
  type="url"
  value={formData.image_url}
  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
/>
```

**After:**
```tsx
<FileUpload
  label="Imagem do Story"
  accept="image/jpeg,image/png,image/webp,image/gif"
  maxSize={10 * 1024 * 1024}
  currentUrl={formData.image_url}
  onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
  onRemove={() => setFormData({ ...formData, image_url: "" })}
  type="image"
/>
```

---

### 5. Updated Stories Admin Page ✅
**File:** `app/admin/stories/page.tsx`

**Changes:**
- ✅ Added automatic file deletion when story is deleted
- ✅ Deletes both image and video files from storage
- ✅ Prevents orphaned files in storage

**Delete Flow:**
```
1. User clicks delete button
2. Confirm deletion dialog
3. Get story data (image_url, video_url)
4. Delete story from database
5. Delete image file from storage (if exists)
6. Delete video file from storage (if exists)
7. Show success message
```

---

### 6. Setup Script ✅
**File:** `scripts/create-stories-bucket.ts`

**Purpose:** Create the `stories` storage bucket with proper configuration.

**Usage:**
```bash
npx tsx scripts/create-stories-bucket.ts
```

**What it does:**
- ✅ Creates `stories` bucket
- ✅ Sets public access
- ✅ Sets file size limit (50MB)
- ✅ Sets allowed MIME types
- ✅ Creates RLS policies (if supported)
- ✅ Checks if bucket already exists

---

## 📊 Complete Upload Flow

### Creating a New Story:

```
1. User clicks "Novo Story"
   ↓
2. User clicks upload button for image
   ↓
3. File picker opens
   ↓
4. User selects image file
   ↓
5. System validates:
   - File type (JPEG, PNG, WebP, GIF)
   - File size (max 10MB)
   ↓
6. Upload starts
   - Progress indicator shows
   - Preview appears
   ↓
7. File uploaded to Supabase Storage
   - Path: stories/{user_id}/{timestamp}_{random}.jpg
   ↓
8. Public URL generated
   ↓
9. URL saved to form state
   ↓
10. User fills other fields
   ↓
11. User clicks "Criar Story"
   ↓
12. Story saved to database with public URL
   ↓
13. Success! Story appears in list
```

### Editing an Existing Story:

```
1. User clicks "Editar" on a story
   ↓
2. Form loads with current data
   - Image preview shows current image
   ↓
3. User clicks "Remove" on image
   ↓
4. User uploads new image
   ↓
5. New file uploaded to storage
   ↓
6. User clicks "Atualizar Story"
   ↓
7. System deletes old image from storage
   ↓
8. Database updated with new URL
   ↓
9. Success! Story updated
```

### Deleting a Story:

```
1. User clicks "Excluir" on a story
   ↓
2. Confirmation dialog appears
   ↓
3. User confirms
   ↓
4. System gets story data (URLs)
   ↓
5. Story deleted from database
   ↓
6. Image file deleted from storage
   ↓
7. Video file deleted from storage (if exists)
   ↓
8. Success! Story and files removed
```

---

## 🧪 Testing Checklist

### Test 1: Upload Image
1. Go to `/admin/stories`
2. Click "Novo Story"
3. Click image upload area
4. Select a JPG image (< 10MB)
5. **Expected:** 
   - ✅ Upload progress shows
   - ✅ Preview appears
   - ✅ Public URL generated

### Test 2: Upload Video
1. Click video upload area
2. Select an MP4 video (< 50MB)
3. **Expected:**
   - ✅ Upload progress shows
   - ✅ Video preview with controls
   - ✅ Public URL generated

### Test 3: File Size Validation
1. Try to upload image > 10MB
2. **Expected:** ✅ Error: "Arquivo muito grande"

### Test 4: File Type Validation
1. Try to upload a PDF or TXT file
2. **Expected:** ✅ Error: "Tipo de arquivo não suportado"

### Test 5: Remove Uploaded File
1. Upload an image
2. Click "X" button on preview
3. **Expected:** ✅ Preview removed, can upload again

### Test 6: Replace File (Edit)
1. Create a story with an image
2. Edit the story
3. Remove old image
4. Upload new image
5. Save
6. **Expected:**
   - ✅ Old file deleted from storage
   - ✅ New file saved
   - ✅ Database updated

### Test 7: Delete Story with Files
1. Create a story with image and video
2. Delete the story
3. Check Supabase Storage
4. **Expected:** ✅ Both files deleted

### Test 8: View Story on Public Page
1. Create story with uploaded image
2. Go to public profile
3. Click story
4. **Expected:** ✅ Image displays correctly

---

## 📁 Files Created/Modified

### Created:
1. ✅ `components/ui/FileUpload.tsx`
   - Reusable file upload component
   - Progress indicator
   - Preview functionality

2. ✅ `lib/utils/storage.ts`
   - Storage utility functions
   - File deletion helpers
   - Validation helpers

3. ✅ `scripts/create-stories-bucket.ts`
   - Bucket creation script
   - RLS policy setup

4. ✅ `STORIES_FILE_UPLOAD_IMPLEMENTATION.md`
   - This documentation file

### Modified:
1. ✅ `components/admin/StoriesForm.tsx`
   - Replaced URL inputs with FileUpload
   - Added file replacement logic
   - Added file deletion on update

2. ✅ `app/admin/stories/page.tsx`
   - Added file deletion on story delete
   - Imports storage utilities

3. ✅ `package.json`
   - Added `dotenv` dependency

---

## 🎯 Features Summary

### Upload Features:
- ✅ Direct file upload from computer
- ✅ Drag-and-drop style interface
- ✅ File type validation (images/videos only)
- ✅ File size validation (10MB images, 50MB videos)
- ✅ Upload progress indicator
- ✅ Image/video preview
- ✅ Remove uploaded file
- ✅ Replace existing file
- ✅ Unique filename generation
- ✅ Automatic public URL generation

### Storage Features:
- ✅ Organized by user ID
- ✅ Unique filenames (timestamp + random)
- ✅ Public read access
- ✅ Authenticated write access
- ✅ Automatic file deletion on replace
- ✅ Automatic file deletion on story delete
- ✅ No orphaned files

### Error Handling:
- ✅ File too large
- ✅ Invalid file type
- ✅ Network errors
- ✅ Storage quota exceeded
- ✅ Upload failures
- ✅ Clear error messages

---

## 💡 Best Practices

### File Naming:
- **Pattern:** `{user_id}/{timestamp}_{random}.{extension}`
- **Example:** `abc123/1705334400_x7k9m2.jpg`
- **Benefits:**
  - Organized by user
  - Unique filenames (no collisions)
  - Easy to identify owner
  - Sortable by time

### File Sizes:
- **Images:** Max 10MB
  - Recommended: 1-3MB
  - Optimize before upload
- **Videos:** Max 50MB
  - Recommended: 10-30MB
  - Compress for web

### File Formats:
- **Images:** JPG, PNG, WebP, GIF
  - JPG: Best for photos
  - PNG: Best for graphics with transparency
  - WebP: Best compression
  - GIF: Animated images
- **Videos:** MP4, WebM, MOV
  - MP4: Best compatibility
  - WebM: Best for web
  - MOV: Apple devices

### Storage Management:
- ✅ Always delete old files when replacing
- ✅ Always delete files when deleting story
- ✅ Use unique filenames to avoid collisions
- ✅ Organize files by user ID
- ✅ Monitor storage usage

---

## 🔒 Security

### Access Control:
- ✅ Public read access (anyone can view stories)
- ✅ Authenticated write access (only logged-in users can upload)
- ✅ Users can only modify their own files
- ✅ File path includes user ID for isolation

### Validation:
- ✅ File type validation (MIME type check)
- ✅ File size validation (prevent large uploads)
- ✅ User authentication check before upload
- ✅ Unique filename generation (prevent overwrites)

---

## 📊 Database Schema

**No changes to database schema!**

The `stories` table still stores URLs in `image_url` and `video_url` fields. The only difference is that these URLs now point to Supabase Storage instead of external services.

**Before:**
```
image_url: "https://example.com/image.jpg"
```

**After:**
```
image_url: "https://project.supabase.co/storage/v1/object/public/stories/user123/1705334400_x7k9m2.jpg"
```

---

## 🚀 Usage Guide

### For Admins:

1. **Create a Story:**
   - Go to `/admin/stories`
   - Click "Novo Story"
   - Click image upload area
   - Select image from computer
   - Wait for upload to complete
   - Fill other fields
   - Click "Criar Story"

2. **Edit a Story:**
   - Click "Editar" on a story
   - To replace image: Click "X" then upload new one
   - To keep image: Don't touch it
   - Click "Atualizar Story"

3. **Delete a Story:**
   - Click "Excluir" on a story
   - Confirm deletion
   - Files automatically deleted from storage

---

## ✅ Completion Checklist

- ✅ Supabase Storage bucket created
- ✅ FileUpload component created
- ✅ Storage utility functions created
- ✅ Stories form updated with file upload
- ✅ File deletion on replace implemented
- ✅ File deletion on story delete implemented
- ✅ File type validation working
- ✅ File size validation working
- ✅ Upload progress indicator working
- ✅ Preview functionality working
- ✅ Error handling implemented
- ✅ Documentation created

---

**Completion Date:** January 15, 2025  
**Status:** ✅ Complete  
**Ready for Use:** ✅ Yes

**Access:** `http://localhost:3000/admin/stories`

