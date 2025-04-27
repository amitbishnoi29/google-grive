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
- Static serving of React app through Node.js backend

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

3. Environment Configuration:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Update the `.env` file with your actual credentials:
     ```env
     # Server Configuration
     PORT=3000
     NODE_ENV=development

     # MongoDB Configuration
     MONGODB_URI=your-mongodb-uri

     # Google OAuth Configuration
     GOOGLE_CLIENT_ID=your_google_client_id
     GOOGLE_CLIENT_SECRET=your_google_client_secret

     # AWS S3 Configuration
     AWS_ACCESS_KEY_ID=your_aws_access_key_id
     AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
     AWS_REGION=your_aws_region
     AWS_BUCKET_NAME=your_s3_bucket_name

     # Session Configuration
     SESSION_SECRET=your_session_secret
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

### Development Setup

1. Build the React app:
```bash
cd google-drive-ui
npm install
npm run build
```

2. Start the Node.js server (from root directory):
```bash
npm run dev
```
This will:
- Serve the backend API on port 3000
- Serve the built React app statically
- Handle all API requests through the same server

### Production Build

1. From the root directory, run:
```bash
npm run build
```
This will:
- Install backend dependencies
- Install frontend dependencies
- Build the React app for production

2. Start the production server:
```bash
npm start
```
This will serve both the backend API and the static React app from the same server.

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