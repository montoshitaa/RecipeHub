---
phase: 03-recipe-management
plan: 02
subsystem: image-upload
tags: [react-dropzone, image-preview, data-url, client-side-validation]
key-files:
  - frontend/src/components/RecipeForm.tsx
metrics:
  files_modified: 1
  lines_changed: imageUrl text input replaced with dropzone
  ts_errors: 0
---

# 03-02 SUMMARY: Image Upload with react-dropzone

## What was built

Replaced the text-based image URL input in RecipeForm with a drag-and-drop file upload zone using react-dropzone. Users can drag/drop or click to select an image, see a live preview, remove and replace the image, and the file is converted to a base64 data URL for submission as the recipe's imageUrl. Client-side validation enforces image types and 5MB max size.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | `958f9d4` | feat(03-02): replace imageUrl text input with useDropzone drag-and-drop zone |

## Key Changes

### frontend/src/components/RecipeForm.tsx
- Replaced text Input for imageUrl with react-dropzone `useDropzone` hook integration
- Drag-and-drop zone with visual states:
  - Default: "Drag & drop an image here, or click to select" with Upload icon
  - Dragging: Green border with "Drop the image here ..." text
- Live preview: Shows uploaded image (max-height 256px, rounded border) above the dropzone
- Remove button: "Remove" button under preview to clear and drop a different image
- File validation on the `useDropzone` options:
  - `accept: { 'image/*': [] }` — only image file types accepted
  - `maxSize: 5 * 1024 * 1024` (5MB) — oversize files rejected with `toast.error`
  - Non-image files rejected with `toast.error` via `fileRejections` callback
- FileReader: Uses `FileReader.readAsDataURL()` to convert dropped file to base64 data URL
- Sets the preview URL to `form.setValue('imageUrl', dataUrl)` on successful drop
- Integrates with existing RHF+zod+shadcn form — imageUrl field in zod schema remains unchanged (`z.union([z.string().url(), z.literal('')]).optional()`)

## Verification

- `grep -c 'useDropzone' frontend/src/components/RecipeForm.tsx` — 2 (import + usage)
- `grep -c 'preview' frontend/src/components/RecipeForm.tsx` — 5 (preview state, preview URL, preview image display)
- `grep -c 'maxSize\|5.*MB\|5242880' frontend/src/components/RecipeForm.tsx` — 3 (maxSize config, error message)
- `grep -c 'image/' frontend/src/components/RecipeForm.tsx` — 1 (accept option)
- `grep -c 'FileReader\|readAsDataURL\|dataUrl' frontend/src/components/RecipeForm.tsx` — 5 (FileReader logic, dataUrl variable)
- `cd frontend && npx tsc --noEmit` — 0 errors

## Deviations

None. All must_have truths satisfied:
- Drag/drop image onto drop zone
- Live preview before submission
- Remove preview and drop different image
- Non-image file or >5MB rejection with error message
- Base64 data URL conversion for imageUrl field
- Image survives form submission as data URL string

## Self-Check: PASSED

All acceptance criteria met. TypeScript compiles with 0 errors. react-dropzone dropzone replaces URL text input in RecipeForm.
