# SecureShare Backend API

A secure and scalable backend API for file sharing built with Node.js, Express, TypeScript, Prisma, and Cloudinary. Features file uploads, nested folder hierarchies, metadata management, file movement, and secure shareable links with expiration.

Implements a clean controller-service architecture with strict validation, custom error handling, and consistent API responses.

## Tech Stack

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

## Key Features

- **Secure File Management:** Upload, retrieve, delete, move, and rename files
- **Nested Folder Hierarchy:** Create and manage multi-level folder structures
- **Shareable Links:** Generate time-limited public links with expiration
- **JWT Authentication:** Secure user authentication and authorization
- **Cloud Storage:** Cloudinary integration for scalable file storage
- **Type-Safe:** Full TypeScript implementation with Prisma ORM
- **Error Handling:** Custom error classes with consistent API responses

## Project Structure

```
src/
├── config/           # Cloudinary and environment configurations
├── controllers/      # Request handlers (auth, file, folder, share)
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

- **User:** Authentication and file ownership
- **Folder:** Self-referential nested hierarchy
- **FileMetaData:** Cloudinary URLs, share tokens, and metadata

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
  "description": "A secure and scalable file-sharing backend API built with Express, TypeScript, Prisma, and Cloudinary. Supports file uploads, folder hierarchy, JWT auth, and shareable links with expiry.",
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
  "description": "Secure file sharing API",
  "author": "Kaushik",
  "repository": "https://github.com/username/repo",
  "license": "MIT"
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

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/files/upload` | POST | Upload file (multipart/form-data) |
| `/api/v1/files` | GET | List all user files |
| `/api/v1/files/:fileId` | GET | Get file details |
| `/api/v1/files/:fileId` | DELETE | Delete file permanently |
| `/api/v1/files/:fileId/move` | PATCH | Move file to folder |
| `/api/v1/files/:fileId/rename` | PATCH | Rename file |

**Upload Request:**
```
Form Data:
- file: <binary>
- folderId: 10 (optional)
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
  "filename": "newname.png"
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

**Generate Request:**
```json
{
  "fileId": 12,
  "expiryHours": 24
}
```

**Access Response:**
```json
{
  "id": 12,
  "filename": "image.png",
  "mimeType": "image/png",
  "sizeKB": 482,
  "cloudUrl": "https://cloudinary.com/...",
  "uploadedAt": "2025-11-18T10:00:00.000Z",
  "folderId": null
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

Handles: StorageError, MulterError, native JS errors, and unknown errors.

## Environment Variables

```env
NODE_ENV=
PORT=
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_URL=
MAX_FILE_SIZE_MB=
ALLOWED_MIME_TYPES=
MAX_JSON_SIZE_MB=
BCRYPT_SALT_ROUNDS=
BASE_URL=
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

4. **Development:**
   ```bash
   npm run dev
   ```

5. **Production Build:**
   ```bash
   npm run build
   npm start
   ```

## Testing with Postman

Import collection: `/postman/SecureShareAPI.postman_collection.json`

**Collection Structure:**
- Health_Check
- Auth_Module
- Files_Module
- Folders_Module
- Share_Module

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

Add all environment variables in hosting dashboard.

### Storage (Cloudinary)
- No additional setup required
- Works globally with API credentials

## Architecture Highlights

- **Controller-Service Pattern:** Separation of concerns
- **Custom Error Classes:** Type-safe error handling
- **Middleware Pipeline:** Authentication, validation, error handling
- **Prisma ORM:** Type-safe database queries
- **JWT Authentication:** Secure token-based auth
- **Cloudinary Integration:** Scalable cloud storage

## Author

**Kaushik**
Backend Developer specializing in Node.js, TypeScript, and API design

---

Built with best practices for production-ready applications.
