# Appwrite Migration Guide

This document explains the Appwrite integration in the portfolio project.

## Overview

The portfolio application now supports **Appwrite** as an alternative cloud-based storage and database solution alongside the existing MongoDB and GridFS setup.

## Features

### ✅ Implemented

1. **Appwrite Client Configuration** (`backend/config/appwrite.js`)
   - Initializes Appwrite SDK with credentials from environment variables
   - Provides access to Databases, Storage, and Users services
   - Gracefully handles missing configuration (optional integration)

2. **Appwrite Storage** (`backend/utils/appwriteStorage.js`)
   - File upload to Appwrite Cloud Storage
   - File download and URL generation
   - File deletion and metadata retrieval
   - File listing with pagination

3. **Hybrid File Controller** (`backend/controllers/fileController.js`)
   - Automatically uses Appwrite Storage if configured
   - Falls back to GridFS if Appwrite is not available
   - Seamless integration with existing API endpoints

4. **Storage Status API** (`/api/storage/status`)
   - Check which storage system is active
   - View configuration status
   - Debugging and monitoring

## Configuration

### Environment Variables

Add the following variables to your `.env` file:

```bash
# Appwrite Configuration
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key

# Optional: For file storage
APPWRITE_BUCKET_ID=your-bucket-id

# Optional: For database features (future)
APPWRITE_DATABASE_ID=your-database-id
```

### Getting Appwrite Credentials

1. **Sign up for Appwrite Cloud**: https://cloud.appwrite.io/

2. **Create a Project**:
   - Go to the Appwrite console
   - Click "Create Project"
   - Note your Project ID

3. **Create an API Key**:
   - Go to Project Settings → API Keys
   - Click "Create API Key"
   - **Important**: Select **ALL scopes** for full functionality
   - Copy the generated API key

4. **Create a Storage Bucket** (for file uploads):
   - Go to Storage → Create Bucket
   - Configure permissions (recommended: read for all, write for authenticated)
   - Note your Bucket ID

### Regional Endpoints

Appwrite Cloud offers regional endpoints for better performance:

- **Sydney**: `https://syd.cloud.appwrite.io/v1`
- **Frankfurt**: `https://fra.cloud.appwrite.io/v1`
- **US**: `https://cloud.appwrite.io/v1`

Choose the endpoint closest to your users.

## Usage

### Storage Priority

The system automatically determines which storage to use:

1. **Appwrite Storage** - Used if `APPWRITE_BUCKET_ID` is configured
2. **GridFS** - Used as fallback or if Appwrite is not configured

### File Upload API

```javascript
// POST /api/upload
// Automatically uses Appwrite if configured, otherwise GridFS

const formData = new FormData();
formData.append('file', fileBlob);

const response = await fetch('/api/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log(result.storage); // 'appwrite' or 'gridfs'
console.log(result.url);     // File URL
```

### Check Storage Status

```javascript
// GET /api/storage/status

const response = await fetch('/api/storage/status');
const status = await response.json();

console.log(status);
/*
{
  gridfs: {
    available: true,
    status: 'ready'
  },
  appwrite: {
    available: true,
    storageAvailable: true,
    endpoint: 'https://syd.cloud.appwrite.io/v1',
    projectId: '68ef61ed0005c49591cf',
    bucketId: 'your-bucket-id',
    status: 'ready'
  },
  primary: 'appwrite'
}
*/
```

### Health Check

```javascript
// GET /api/health

const response = await fetch('/api/health');
const health = await response.json();

console.log(health.storage);
/*
{
  gridfs: true,
  appwrite: true,
  appwriteStorage: true,
  primary: 'appwrite'
}
*/
```

## Architecture

### Hybrid Approach

The application uses a **hybrid architecture** that supports both storage systems:

```
┌─────────────────┐
│  File Upload    │
│   Controller    │
└────────┬────────┘
         │
         ├─── Try Appwrite ───┐
         │                     │
         │                     ▼
         │            ┌──────────────┐
         │            │   Appwrite   │
         │            │   Storage    │
         │            └──────────────┘
         │
         └─── Fallback ───┐
                          │
                          ▼
                 ┌──────────────┐
                 │    GridFS    │
                 │   MongoDB    │
                 └──────────────┘
```

### Benefits

1. **Flexibility**: Can run with or without Appwrite
2. **Reliability**: Automatic fallback to GridFS
3. **Performance**: Use Appwrite CDN for better file delivery
4. **Scalability**: Offload file storage to Appwrite cloud

## Migration Strategies

### Option 1: Appwrite-First (Recommended for New Deployments)

Configure Appwrite from the start:

```bash
APPWRITE_BUCKET_ID=your-bucket-id
```

All new file uploads will use Appwrite Storage.

### Option 2: Gradual Migration

1. Start with GridFS (no Appwrite configuration)
2. Configure Appwrite when ready
3. New uploads automatically use Appwrite
4. Old files remain in GridFS
5. Optionally migrate old files to Appwrite

### Option 3: GridFS-Only

Don't configure `APPWRITE_BUCKET_ID`:

```bash
# APPWRITE_BUCKET_ID=  # Leave commented or unset
```

System will use only GridFS.

## Future Enhancements

### Planned Features

- [ ] **Appwrite Database Integration**: Use Appwrite Databases as alternative to MongoDB
- [ ] **Appwrite Authentication**: Leverage Appwrite's built-in auth system
- [ ] **Real-time Updates**: Use Appwrite's real-time subscriptions
- [ ] **File Migration Script**: Migrate existing GridFS files to Appwrite
- [ ] **Appwrite Functions**: Serverless functions for image processing

### Database Migration (Future)

In the future, you'll be able to use Appwrite Database:

```bash
APPWRITE_DATABASE_ID=your-database-id
```

This will enable:
- Hybrid MongoDB + Appwrite Database
- Complete migration to Appwrite
- Cross-platform data synchronization

## Troubleshooting

### Appwrite Not Initializing

Check the server logs:

```
⚠️  Appwrite configuration not found in environment variables
   Appwrite services will not be available
```

**Solution**: Add required environment variables to `.env`

### File Upload Failing

1. Check bucket permissions in Appwrite console
2. Verify API key has storage write permissions
3. Check file size limits (default: 50MB)

### Storage Status Shows Not Configured

```bash
# Make sure all required variables are set:
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key
APPWRITE_BUCKET_ID=your-bucket-id  # For storage
```

## Security Best Practices

1. **API Key Security**:
   - Never commit API keys to version control
   - Use different keys for development and production
   - Rotate keys periodically

2. **Bucket Permissions**:
   - Set read permissions for public files
   - Restrict write to authenticated users
   - Use role-based access control

3. **File Validation**:
   - Validate file types and sizes
   - Scan for malware (if needed)
   - Implement rate limiting

## Support

For issues with:

- **Appwrite Setup**: https://appwrite.io/docs
- **Appwrite Community**: https://appwrite.io/discord
- **This Integration**: Create an issue in the repository

## Conclusion

The Appwrite integration provides a modern, scalable, and flexible storage solution for your portfolio application. It's designed to work alongside existing systems, giving you the freedom to choose the best storage option for your needs.
