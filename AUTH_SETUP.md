# Authentication Setup Guide

This guide will help you set up NextAuth.js with username/password authentication for the EC2 Manager application using the existing settings system.

## Overview

The EC2 Manager uses a single admin account system where authentication credentials are stored in the application settings. Users configure their username and password through the Settings page, and these credentials are used for login authentication.

## Prerequisites

1. AWS DynamoDB table for storing settings and AWS credentials
2. AWS credentials with DynamoDB access
3. NextAuth secret key

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key

# EC2 Manager Settings
EC2_SECRET_ENABLED=false
EC2_SECRET=123456
```

## DynamoDB Table Setup

### Main Table

Create a DynamoDB table named `ec2-manager` with the following structure:

```json
{
  "TableName": "ec2-manager",
  "KeySchema": [
    {
      "AttributeName": "PK",
      "KeyType": "HASH"
    },
    {
      "AttributeName": "SK",
      "KeyType": "RANGE"
    }
  ],
  "AttributeDefinitions": [
    {
      "AttributeName": "PK",
      "AttributeType": "S"
    },
    {
      "AttributeName": "SK",
      "AttributeType": "S"
    }
  ],
  "ProvisionedThroughput": {
    "ReadCapacityUnits": 5,
    "WriteCapacityUnits": 5
  }
}
```

### Data Structure

The table will store:
- **Settings**: `PK=SETTINGS#default, SK=SETTINGS#default` (contains username, password, EC2 secret)
- **AWS Credentials**: `PK=CREDENTIALS#{profileName}, SK=CREDENTIALS#{profileName}`
- **NextAuth Sessions**: `PK=next-auth#{sessionId}, SK=next-auth#{sessionId}`

## Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up environment variables (see above)

3. Create DynamoDB table (see above)

4. Start the development server:
   ```bash
   pnpm dev
   ```

## Initial Setup

1. Navigate to `/login` to sign in (you'll need to configure credentials first)
2. If no credentials are configured, you'll need to set them up programmatically or through the database
3. Configure your username and password in the settings
4. Configure AWS credentials if needed

## Usage

1. **First Time Setup**: Configure username/password in settings (requires database access)
2. **Login**: Navigate to `/login` and sign in with your credentials
3. **Access**: All pages including settings are protected and require authentication

## Features

- ✅ Single admin account system
- ✅ Username/password authentication
- ✅ Settings-based credential storage
- ✅ Protected routes
- ✅ Session management
- ✅ DynamoDB integration
- ✅ Password hashing with bcrypt
- ✅ Responsive navigation with user dropdown
- ✅ Automatic redirect to login for unauthenticated users

## Security Features

- Passwords are hashed using bcrypt with 12 rounds
- JWT-based sessions
- Protected API routes
- Middleware-based route protection
- Secure password validation (minimum 8 characters)
- All pages protected including settings

## File Structure

```
src/
├── app/
│   ├── api/auth/
│   │   └── [...nextauth]/route.ts    # NextAuth API routes
│   ├── login/page.tsx                # Login page
│   └── settings/page.tsx             # Settings page (account setup)
├── components/
│   ├── Navigation.tsx                # Navigation with user menu
│   └── SessionProvider.tsx           # NextAuth session provider
├── lib/
│   ├── auth.ts                       # NextAuth configuration
│   └── dynamodb-config.ts            # DynamoDB operations
├── middleware.ts                     # Route protection middleware
└── types/
    └── next-auth.d.ts               # TypeScript declarations
```

## Authentication Flow

1. **Initial Setup**: Credentials must be configured in settings (requires database access)
2. **Login**: User visits `/login` and enters credentials
3. **Validation**: NextAuth checks credentials against settings data
4. **Session**: JWT session is created and stored
5. **Access**: User can access all protected pages including settings

## Troubleshooting

### Common Issues

1. **"Invalid username or password" error**
   - Check if settings are configured in `/settings`
   - Verify the username and password match what's in settings
   - Ensure DynamoDB connection is working

2. **DynamoDB connection errors**
   - Verify AWS credentials are correct
   - Check if the DynamoDB table exists
   - Ensure the AWS user has DynamoDB permissions

3. **NextAuth secret errors**
   - Generate a new secret: `openssl rand -base64 32`
   - Update the NEXTAUTH_SECRET environment variable

4. **Session not persisting**
   - Check if NEXTAUTH_URL is set correctly
   - Verify the domain matches your deployment URL

5. **Settings not saving**
   - Check DynamoDB connection status
   - Verify AWS credentials have write permissions
   - Check browser console for errors

### Generating NextAuth Secret

```bash
openssl rand -base64 32
```

### Testing Authentication

1. Ensure credentials are configured in settings
2. Sign in at `/login`
3. Verify you can access protected pages including settings
4. Test logout functionality
5. Verify unauthenticated users are redirected to login

## Data Structure

### Settings Record
```json
{
  "id": "default",
  "username": "admin",
  "password": "hashed_password",
  "ec2Secret": "123456",
  "ec2SecretEnabled": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### AWS Credentials Record
```json
{
  "id": "default",
  "accessKeyId": "AKIA...",
  "secretAccessKey": "...",
  "region": "us-east-1",
  "profileName": "default",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
``` 