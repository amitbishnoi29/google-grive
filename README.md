# Google Drive Clone

A Node.js application that mimics the core functionalities of Google Drive, allowing users to authenticate with Google and manage their files.

## Repository Link
[GitHub Repository](https://github.com/amitbishnoi29/google-grive)

## Features

- Google OAuth authentication
- File upload, download, and management using AWS S3
- File search functionality
- Secure file storage
- User session management
- Modern React frontend with responsive design

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- Google OAuth credentials
- AWS account with S3 access

## Setup

### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/amitbishnoi29/google-grive.git
cd google-grive
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
PORT=3000
MONGODB_URI=your-mongodb-uri
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
SESSION_SECRET=your-session-secret
JWT_SECRET=your-jwt-secret
NODE_ENV=development

# AWS Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=your-aws-region
AWS_BUCKET_NAME=your-s3-bucket-name
```

4. Set up Google OAuth:
   - Go to the Google Cloud Console
   - Create a new project
   - Enable the Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs (e.g., http://localhost:3000/api/auth/google/callback)

5. Set up AWS S3:
   - Create an S3 bucket in your AWS account
   - Configure bucket permissions:
     ```json
     {
         "Version": "2012-10-17",
         "Statement": [
             {
                 "Sid": "PublicReadGetObject",
                 "Effect": "Allow",
                 "Principal": "*",
                 "Action": "s3:GetObject",
                 "Resource": "arn:aws:s3:::your-bucket-name/*"
             }
         ]
     }
     ```
   - Create an IAM user with S3 access
   - Get the access key and secret key

6. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd google-drive-ui
```

2. Install frontend dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` by default.

## API Endpoints

### Authentication
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/current` - Get current user
- `GET /api/auth/logout` - Logout user

### Files
- `POST /api/files/upload` - Upload a file to S3
- `GET /api/files` - Get all files with signed URLs
- `GET /api/files/search?query=searchTerm` - Search files
- `PUT /api/files/:id/rename` - Rename a file
- `DELETE /api/files/:id` - Delete a file from S3

## Security

- All file operations require authentication
- Files are stored securely in AWS S3
- User sessions are managed securely
- File size limits are enforced
- S3 URLs are signed and expire after 1 hour

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License. 