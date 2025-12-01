# SecureShare Backend API

A secure and scalable backend API for file sharing built with Node.js, Express, TypeScript, Prisma, and AWS S3. Features presigned URL uploads, nested folder hierarchies, metadata management, file movement, avatar management, and secure shareable links with expiration.

Implements a clean controller-service architecture with strict validation, custom error handling, and consistent API responses.

## Tech Stack

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![AWS S3](https://img.shields.io/badge/AWS_S3-FF9900?style=for-the-badge&logo=amazons3&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

## Key Features

- **Secure File Management:** Presigned URL uploads, retrieve, delete, move, and rename files
- **AWS S3 Integration:** Scalable cloud storage with direct frontend-to-S3 uploads
- **Avatar Management:** User profile picture uploads with dedicated S3 storage
- **Nested Folder Hierarchy:** Create and manage multi-level folder structures
- **Shareable Links:** Generate time-limited public links with flexible expiration (minutes, hours, days)
- **JWT Authentication:** Secure user authentication and authorization
- **Type-Safe:** Full TypeScript implementation with Prisma ORM
- **Error Handling:** Custom error classes with consistent API responses

## Project Structure

```
src/
├── config/           # AWS S3 and environment configurations
├── controllers/      # Request handlers (auth, file, folder, share, avatar)
├── services/         # Business logic layer
├── middleware/       # Auth, error handling, file upload, 404
├── routes/           # API route definitions (v1)
├── utils/            # Helper utilities (Hash, Token, Response, Error)
├── types/            # TypeScript type definitions
├── healthCheck.ts    # Health and info routes
├── index.ts          # App initialization
└── listener.ts       # Server listener

prisma/
├── schema.prisma     # Database schema
└── migrations/       # Database migrations

postman/
└── SecureShareAPI.postman_collection.json
```

## Database Schema

Three core Prisma models:

- **User:** Authentication, file ownership, and avatar storage
- **Folder:** Self-referential nested hierarchy
- **FileMetaData:** S3 keys, share tokens, and metadata

Full schema available in `/prisma/schema.prisma`

## Try Now - Live Deployment & Health Routes

Test the API instantly at: [Visit](https://secureshare-backend-api.onrender.com)

### Health Check
[Visit](https://secureshare-backend-api.onrender.com/) `GET /`

Returns server status and timestamp.

**Live Example**: `curl https://secureshare-backend-api.onrender.com/`

**Response**:
```json
{"status":"OK","message":"Server is running 🚀","time":"2025-11-18T11:46:16.482Z"}
```

### Info
[Visit](https://secureshare-backend-api.onrender.com/info) `GET /info`

Returns package metadata (name, version, description, author, repo, license).

**Live Example**: `curl https://secureshare-backend-api.onrender.com/info`

**Response**:
```json
{
  "name": "fileshare_backend_api",
  "version": "1.0.0",
  "description": "A secure and scalable file-sharing backend API built with Express, TypeScript, Prisma, and AWS S3. Supports presigned URL uploads, folder hierarchy, JWT auth, avatar management, and shareable links with expiry.",
  "author": "Kaushik <dvlprkaushik>",
  "repository": "https://github.com/dvlprkaushik/SecureShare-Backend-API.git",
  "license": "ISC"
}
```

## API Documentation

### Health Check Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Server health status and timestamp |
| `/info` | GET | Package metadata (name, version, description, author, repository, license) |

**Example Response (`/`):**
```json
{
  "status": "OK",
  "message": "Server is running 🚀",
  "time": "2025-11-18T12:00:00.000Z"
}
```

**Example Response (`/info`):**
```json
{
  "name": "secureshare-backend-api",
  "version": "1.0.0",
  "description": "Secure file sharing API with AWS S3",
  "author": "Kaushik",
  "repository": "https://github.com/username/repo",
  "license": "ISC"
}
```

### Authentication

All protected routes require `Authorization: Bearer <token>` header.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/register` | POST | Create account (email, password) |
| `/api/v1/auth/login` | POST | Login and receive JWT token |

**Register Request:**
```json
{
  "email": "user@example.com",
  "password": "securepass"
}
```

### File Routes

#### Upload Workflow (3-Step Process)

**Step 1: Generate Presigned URL**
```
POST /api/v1/files/presign
```

**Request:**
```json
{
  "folderId": null,
  "filename": "sample_image.png",
  "mimeType": "image/png"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Presigned URL generated",
  "data": {
    "uploadUrl": "https://secure-share-buckets3.s3.ap-south-1.amazonaws.com/...",
    "fileKey": "users/16/uploads/1764511646888_GawHt6UOHy_sample_image.png"
  }
}
```

**Step 2: Upload to S3 (Frontend)**
```
PUT <uploadUrl>
Body: Binary file data
```

**Step 3: Save Upload**
```
POST /api/v1/files/complete
```

**Request:**
```json
{
  "fileKey": "users/16/uploads/1764511646888_GawHt6UOHy_sample_image.png",
  "filename": "sample_image.png",
  "mimeType": "image/png",
  "sizeKB": 186,
  "folderId": null
}
```

#### File Management Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/files/presign` | POST | Generate presigned S3 upload URL |
| `/api/v1/files/complete` | POST | Save file metadata after upload |
| `/api/v1/files` | GET | List all user files (paginated) |
| `/api/v1/files/:fileId` | GET | Get file details |
| `/api/v1/files/:fileId` | DELETE | Delete file permanently |
| `/api/v1/files/:fileId/move` | PATCH | Move file to folder |
| `/api/v1/files/:fileId/rename` | PATCH | Rename file |

**List Files (Pagination):**
```
GET /api/v1/files?page=1&limit=10
```

**Move Request:**
```json
{
  "folderId": 10
}
```

**Rename Request:**
```json
{
  "filename": "updated_name.png"
}
```

### Folder Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/folders` | POST | Create folder |
| `/api/v1/folders` | GET | List all user folders |
| `/api/v1/folders/:folderId` | GET | Get folder details and contents |

**Create Request:**
```json
{
  "folderName": "MyFolder",
  "parentId": 5
}
```

### Shareable Link Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/share/generate` | POST | Generate shareable link |
| `/api/v1/share/:token` | GET | Access shared file (public, no auth) |
| `/api/v1/share/:fileId/revoke` | DELETE | Revoke share link |

**Generate Request (Flexible Expiry):**
```json
{
  "fileId": 44,
  "expiryValue": 1,
  "expiryUnit": "min"
}
```

Available units: `"min"` (minutes), `"hour"` (hours), `"day"` (days)

**Generate Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Share link generated",
  "data": {
    "fileId": 44,
    "shareUrl": "http://localhost:5000/api/v1/share/vtpD0A7tcNWK0HmhCc4mpxolSnDih-Fr",
    "token": "vtpD0A7tcNWK0HmhCc4mpxolSnDih-Fr",
    "expiresAt": "2025-11-30T17:50:35.468Z"
  }
}
```

**Access Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "File accessed via public link",
  "data": {
    "id": 9,
    "filename": "sample_api_image.png",
    "mimeType": "image/png",
    "sizeKB": 5,
    "cloudUrl": "https://secure-share-buckets3.s3.amazonaws.com/...",
    "uploadedAt": "2025-11-17T18:11:01.768Z",
    "folderId": null
  }
}
```

### Avatar Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/avatar/upload-url` | POST | Generate presigned URL for avatar upload |
| `/api/v1/avatar/complete` | POST | Save avatar metadata after upload |
| `/api/v1/avatar` | GET | Get user's avatar URL |

**Avatar Upload Workflow:**

**Step 1: Generate Presigned URL**
```json
POST /api/v1/avatar/upload-url
{
  "mimeType": "image/png"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "avatarKey": "users/16/avatar.png",
    "uploadUrl": "https://secure-share-buckets3.s3.ap-south-1.amazonaws.com/..."
  }
}
```

**Step 2: Upload to S3 (Frontend)**
```
PUT <uploadUrl>
Body: Binary image data
```

**Step 3: Complete Avatar Upload**
```json
POST /api/v1/avatar/complete
{
  "avatarKey": "users/16/avatar.png"
}
```

**Get Avatar:**
```
GET /api/v1/avatar
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Avatar fetched",
  "data": {
    "url": "https://secure-share-buckets3.s3.amazonaws.com/users/16/avatar.png"
  }
}
```

## Response Format

**Success:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "timestamp": "2025-11-18T12:30:25.123Z",
  "data": {}
}
```

**Error:**
```json
{
  "success": false,
  "status": 400,
  "error_name": "VALIDATION_ERROR",
  "error_message": "Folder name is required",
  "error_code": "FOLDER_NAME_REQUIRED",
  "route": "/api/v1/folders",
  "timestamp": "2025-11-18T12:40:15.123Z"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Route not found",
  "statusCode": 404,
  "timestamp": "2025-11-18T12:30:25.123Z"
}
```

Handles: StorageError, S3 errors, native JS errors, and unknown errors.

## Environment Variables

```env
NODE_ENV=
PORT=
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=
S3_SECRET_KEY=
S3_ACCESS_KEY=
AWS_REGION=
S3_BUCKET=
MAX_FILE_SIZE_MB=
ALLOWED_MIME_TYPES=
MAX_JSON_SIZE_MB=
BCRYPT_SALT_ROUNDS=
BASE_URL=
FRONTEND_URL=
```

## Installation & Setup

1. **Clone Repository:**
   ```bash
   git clone https://github.com/dvlprkaushik/SecureShare-Backend-API.git
   cd secureshare-backend-api
   npm install
   ```

2. **Database Setup:**
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

3. **Environment Configuration:**
   - Create `.env` file in root directory
   - Add all required environment variables
   - Configure AWS S3 credentials and bucket name

4. **AWS S3 Setup:**
   - Create an S3 bucket in AWS Console
   - Configure CORS policy for frontend uploads
   - Set up IAM user with S3 access permissions
   - Add credentials to `.env` file

5. **Development:**
   ```bash
   npm run dev
   ```

6. **Production Build:**
   ```bash
   npm run build
   npm start
   ```

## Testing with Postman

Import collection: `/postman/SecureShareAPI.postman_collection.json`

**Collection Structure:**
- Health_Check
- Auth_Module
- Files_Module (with presigned upload workflow)
- Folders_Module
- Share_Module
- Avatar_Module (NEW)

**Environment Variables:**
- `base_url`: Server URL (e.g., `http://localhost:3000`)
- `routes_url`: API version path (e.g., `/api/v1`)
- `auth_token`: JWT token (paste after login)

## Deployment Guide

### Database (Neon - Recommended)
- Free tier with connection pooling
- Set `DATABASE_URL` in environment variables

### Backend (Render/Railway)
**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
node dist/index.js
```

Add all environment variables in hosting dashboard, including AWS credentials.

### Storage (AWS S3)
**Setup Steps:**
1. Create S3 bucket in AWS Console
2. Configure bucket CORS policy:
```json
[
  {
    "AllowedOrigins": ["*"] or ["http://your-frontend-domain.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```
3. Create IAM user with `your_custom_policy` policy (S3 access with only necessary permissions getObject, putObject, deleteObject)
4. Generate access keys and add to environment variables

## Architecture Highlights

- **Controller-Service Pattern:** Separation of concerns
- **Presigned URLs:** Secure direct-to-S3 uploads without exposing credentials
- **Custom Error Classes:** Type-safe error handling
- **Middleware Pipeline:** Authentication, validation, error handling
- **Prisma ORM:** Type-safe database queries
- **JWT Authentication:** Secure token-based auth
- **AWS S3 Integration:** Scalable cloud storage with SDK v3

## Key Changes from Previous Version

### ✅ AWS S3 SDK Integration
- **Replaced Cloudinary** with AWS S3 for file storage
- Implemented presigned URL upload workflow
- Direct frontend-to-S3 uploads for better performance and scalability

### ✅ New Avatar Module
- Dedicated avatar management system
- Separate S3 storage path for user avatars
- Three-step upload process (presign → upload → complete)

### ✅ Enhanced File Upload Flow
- **Old:** Direct multipart upload via backend
- **New:** Presigned URL generation → Frontend uploads to S3 → Backend saves metadata
- Reduced server load and improved upload speeds

### ✅ Flexible Share Link Expiry
- Support for multiple time units: minutes, hours, days
- More granular control over link expiration

## Author

**Kaushik**
Backend Developer specializing in Node.js, TypeScript, and Cloud Architecture

---
                               