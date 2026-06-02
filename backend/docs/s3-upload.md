# S3 Upload Integration

## Environment Variables

Set the following variables in `backend/.env`:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_BUCKET_NAME`

## Security and Storage Notes

- Bucket should stay private.
- API returns presigned URLs for access.
- Store only S3 object keys in database fields (for example, `Project.images` should contain values like `uploads/1717344000000-uuid-file.png`).

## Endpoints

Base route: `/api/uploads`

### 1) Upload file (multipart/form-data)

- **Method:** `POST /api/uploads`
- **Auth:** Bearer token required
- **Body:** `file` (form-data)
- **Allowed file types:** `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `application/pdf`
- **Max size:** 5MB

Success response:

```json
{
  "key": "uploads/1717344000000-123e4567-e89b-12d3-a456-426614174000-profile.png",
  "fileUrl": "https://...signed-download-url...",
  "status": "uploaded"
}
```

### 2) Create presigned upload URL

- **Method:** `POST /api/uploads/presigned-upload`
- **Auth:** Bearer token required
- **JSON Body (optional):**

```json
{
  "contentType": "image/png",
  "expiresIn": 900
}
```

Success response:

```json
{
  "key": "uploads/1717344000000-123e4567-e89b-12d3-a456-426614174000-file",
  "uploadUrl": "https://...signed-upload-url...",
  "expiresIn": 900,
  "status": "ready"
}
```

### 3) Create presigned download URL

- **Method:** `GET /api/uploads/presigned-download?key=<s3-object-key>&expiresIn=900`
- **Auth:** Bearer token required

Success response:

```json
{
  "key": "uploads/1717344000000-123e4567-e89b-12d3-a456-426614174000-profile.png",
  "downloadUrl": "https://...signed-download-url...",
  "expiresIn": 900
}
```

## Error Cases Covered

- Missing credentials / missing env vars
- Invalid bucket configuration
- Access denied (IAM/bucket policy)
- Upload failures
- Invalid file type
- File too large

## Service Usage (internal)

`src/services/s3Service.js` exports:

- `uploadFile(file)`
- `deleteFile(key)`
- `getFile(key)`
- `generatePresignedUploadUrl(options)`
- `generatePresignedDownloadUrl(options)`

## Project API binding

`/api/projects` now:

- uploads incoming multipart `images` files to S3 automatically
- stores only S3 object keys in MongoDB (`images` field in DB)
- returns UI-friendly signed URLs in response `images`
- also returns original stored keys as `imageKeys`
