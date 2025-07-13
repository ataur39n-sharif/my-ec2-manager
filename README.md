# EC2 Manager

A modern web application for managing AWS EC2 instances with real-time monitoring, credential management, and intuitive user interface.

## 🚀 Features

### Authentication & Security
- **NextAuth.js Integration**: Professional authentication system with JWT sessions
- **Username/Password Login**: Secure login with settings-based credentials
- **Protected Routes**: All pages except login protected with middleware-based authentication
- **Session Management**: Persistent sessions with automatic logout
- **Navigation with User Menu**: User dropdown with logout functionality
- **Login Page**: Clean, responsive login interface with validation

### Dashboard
- **Real-time EC2 Instance Data**: Fetches and displays actual AWS EC2 instances
- **Live Statistics**: Shows total instances, running instances, and stopped instances
- **Recent Instances**: Displays the 5 most recently launched instances
- **Instance Type Distribution**: Visual chart showing distribution across instance types
- **Status Indicators**: Color-coded status badges for easy identification
- **Quick Actions**: Start/stop instances directly from the dashboard

### Credential Management
- **Modal-based Form**: Add new credentials through a clean modal interface
- **Saved Credentials List**: Full-space display of all stored AWS credentials
- **Quick Actions**: Add new credential button with refresh functionality
- **Profile Management**: Support for multiple AWS credential profiles
- **Secure Storage**: Credentials stored securely in DynamoDB
- **Status Management**: Activate/deactivate credential profiles with confirmation
- **Real-time Updates**: Automatic refresh after adding new credentials
- **Enhanced Security**: Confirmation modals for all destructive actions
- **Type-to-Delete**: Delete confirmation requires typing "delete" for security

### Application Settings
- **Username/Password Configuration**: Authentication credentials stored in settings
- **Password Security**: Passwords hashed using bcrypt before storage
- **Password Validation**: Real-time password strength validation with comprehensive rules
- **EC2 Secret Protection**: Optional 6-character secret for start/stop operations
- **Settings Persistence**: All settings saved to DynamoDB
- **Default Values**: Automatic loading of saved settings
- **Protected Access**: Settings page requires authentication

### EC2 Secret Protection
- **6-Character Secret**: Exactly 6 characters required when enabled
- **Individual Input Boxes**: Modern 6-box input interface for secret entry
- **Auto-focus Navigation**: Seamless keyboard navigation between boxes
- **Paste Support**: Paste functionality for easy secret entry
- **Start/Stop Protection**: Required for critical EC2 operations when enabled
- **Security Modal**: Professional modal for secret verification
- **Optional Feature**: Can be enabled/disabled in settings
- **Real-time Validation**: Immediate feedback on secret length

### Enhanced User Experience
- **Professional Navigation**: Clean navigation with clickable logo and consistent layout
- **Confirmation Modals**: Secure confirmation dialogs for all important actions
- **Interactive Elements**: All clickable elements show pointer cursor
- **Modal System**: Comprehensive modal system with 5 different types
- **Loading States**: Visual feedback for all operations
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Password Requirements**: Clear password strength requirements and validation
- **Secret Input UX**: Intuitive 6-box secret input with keyboard shortcuts

### Technical Features
- **DynamoDB Integration**: Secure storage for credentials and settings
- **AWS SDK Integration**: Real EC2 instance management
- **NextAuth.js**: Professional authentication with JWT sessions
- **Password Hashing**: bcrypt with 12 salt rounds for maximum security
- **Secret Verification**: Server-side secret validation for EC2 operations
- **Middleware Protection**: All routes except login protected with automatic redirects
- **Validation System**: Comprehensive validation utilities for forms and data
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Type Safety**: Full TypeScript support
- **Component Architecture**: Modular, reusable components

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: AWS DynamoDB
- **AWS Integration**: AWS SDK v3
- **Authentication**: NextAuth.js with JWT sessions
- **Security**: bcryptjs for password hashing
- **Package Manager**: pnpm
- **State Management**: React Hooks & Context
- **UI Components**: Custom components with modern design

## 📋 Prerequisites

- Node.js 18+ 
- pnpm package manager
- AWS Account with EC2 access
- DynamoDB table configured
- AWS credentials with appropriate permissions

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ec2-manager
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:
```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# DynamoDB Configuration
DYNAMODB_TABLE_NAME=ec2-manager
```

### 4. DynamoDB Setup
Follow the [DynamoDB Setup Guide](./DYNAMODB_SETUP.md) to configure your DynamoDB table.

### 5. Authentication Setup
Follow the [Authentication Setup Guide](./AUTH_SETUP.md) to configure NextAuth.js and set up your credentials.

### 6. Run the Application
```bash
# Development mode
pnpm dev

# Production build
pnpm build
pnpm start
```

The application will be available at `http://localhost:3000`

**Note**: You'll need to configure authentication credentials before accessing the application. See the [Authentication Setup Guide](./AUTH_SETUP.md) for details.

## 📁 Project Structure

```
ec2-manager/
├── src/
│   ├── app/
│   │   ├── actions/          # Server actions for data operations
│   │   │   ├── applications.ts    # EC2 instance operations
│   │   │   ├── settings.ts        # Settings management
│   │   │   └── ec2-secret.ts      # EC2 secret verification
│   │   ├── api/              # API routes
│   │   │   └── auth/         # NextAuth.js API routes
│   │   ├── login/            # Login page
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout with session provider
│   │   ├── page.tsx          # Dashboard page
│   │   ├── applications/     # Applications page
│   │   └── settings/         # Settings page
│   ├── components/
│   │   ├── settings/         # Settings-related components
│   │   │   ├── CredentialsForm.tsx      # Credentials form (modal)
│   │   │   ├── CredentialsList.tsx      # Credentials list with confirmations
│   │   │   ├── SettingsForm.tsx         # Application settings form with validation
│   │   │   └── SecretInput.tsx          # 6-character secret input component
│   │   ├── Navigation.tsx    # Navigation with user menu
│   │   ├── SessionProvider.tsx # NextAuth session provider
│   │   ├── Modal.tsx         # Enhanced modal component
│   │   ├── EC2SecretModal.tsx # EC2 secret verification modal
│   │   ├── StartButton.tsx   # Start instance button with secret verification
│   │   ├── StopButton.tsx    # Stop instance button with secret verification
│   │   ├── CancelButton.tsx  # Cancel operation button
│   │   └── AutoRefresh.tsx   # Auto-refresh component
│   ├── contexts/
│   │   └── ModalContext.tsx  # Modal state management
│   ├── lib/
│   │   ├── auth.ts           # NextAuth.js configuration
│   │   ├── aws-config.ts     # AWS SDK configuration
│   │   ├── dynamodb-config.ts # DynamoDB utilities
│   │   ├── password-utils.ts # Password hashing utilities
│   │   └── validation-utils.ts # Validation utilities
│   ├── middleware.ts         # Route protection middleware
│   └── types/
│       └── next-auth.d.ts    # NextAuth TypeScript declarations
├── public/                   # Static assets
├── AUTH_SETUP.md            # Authentication setup guide
├── package.json
└── README.md
```

## 🔧 Configuration

### AWS Permissions
Ensure your AWS credentials have the following permissions:
- `ec2:DescribeInstances`
- `ec2:StartInstances`
- `ec2:StopInstances`
- `dynamodb:*` (for the ec2-manager table)

### DynamoDB Table Schema
The application expects a DynamoDB table with the following structure:
- **Table Name**: `ec2-manager`
- **Partition Key**: `id` (String)
- **Sort Key**: `type` (String)

## 🎯 Usage

### Authentication
1. **First Time Setup**: Configure credentials in settings (requires database access)
2. **Login**: Navigate to `/login` and enter your username and password
3. **Access**: All pages except login require authentication
4. **Logout**: Use the user menu in the navigation to sign out

### Dashboard
1. Navigate to the dashboard to view all EC2 instances
2. Use the statistics cards to get an overview
3. Click on instance actions to start/stop instances
4. View recent instances and instance type distribution

### Adding Credentials
1. Go to Settings page (requires authentication)
2. Click "Add New Credential" button
3. Fill in the modal form with your AWS credentials
4. Click "Save Credentials" to store them

### Managing Credentials
1. View all saved credentials in the expanded list
2. Use the refresh button to update the list
3. **Activate/Deactivate**: Click button → Confirm in modal
4. **Delete**: Click delete → Type "delete" → Confirm deletion
5. All actions show confirmation modals for safety

### Application Settings
1. Configure username and password in the settings panel (requires authentication)
2. **Password Requirements**:
   - At least 8 characters long
   - Contains uppercase and lowercase letters
   - Contains at least one number
   - Contains at least one special character
3. Real-time password validation with visual feedback
4. Passwords are securely hashed before storage
5. Settings are automatically saved to DynamoDB
6. Default values are loaded on page refresh

### EC2 Secret Protection
1. **Enable Secret Protection**: Check the "Enable EC2 secret for start/stop operations" checkbox
2. **Set 6-Character Secret**: Use the 6-box input interface to enter your secret
3. **Secret Requirements**:
   - Exactly 6 characters long
   - Can be any combination of letters, numbers, and symbols
   - Required when starting or stopping EC2 instances
4. **Using the Secret Input**:
   - Type in each box individually
   - Use arrow keys to navigate between boxes
   - Paste functionality supported
   - Backspace works intelligently
5. **Start/Stop Operations**: When secret is enabled, you'll be prompted to enter it before any EC2 operation

### Navigation
- **Logo Click**: Click "EC2 Manager" to return to dashboard
- **Applications**: Navigate to EC2 instances management
- **Settings**: Access credentials and application settings
- **User Menu**: Click username to access logout option
- **Consistent Layout**: Same navigation across all pages

## 🔒 Security Features

### Authentication Security
- **NextAuth.js**: Professional authentication with JWT sessions
- **Protected Routes**: All pages except login protected with middleware
- **Session Management**: Secure session handling with automatic logout
- **Login Validation**: Comprehensive form validation with error handling
- **Automatic Redirects**: Unauthenticated users redirected to login when accessing protected routes

### Password Security
- **bcrypt Hashing**: Passwords hashed with 12 salt rounds
- **Password Validation**: Real-time strength validation
- **Secure Storage**: Hashed passwords stored in DynamoDB
- **No Plain Text**: Passwords never stored or transmitted in plain text
- **Strong Requirements**: Enforced password complexity rules

### EC2 Secret Protection
- **6-Character Secret**: Exactly 6 characters required when enabled
- **Server-side Verification**: Secret verified on server before EC2 operations
- **Optional Security Layer**: Can be enabled/disabled per user preference
- **Critical Operation Protection**: Required for start/stop operations when enabled
- **Professional UI**: Modern 6-box input with keyboard navigation
- **Secure Modal**: Dedicated modal for secret verification

### Credential Management
- **Confirmation Modals**: All destructive actions require confirmation
- **Type-to-Delete**: Delete action requires typing "delete" for security
- **Secure Storage**: AWS credentials encrypted and stored in DynamoDB
- **No Client Exposure**: No credentials logged or exposed in client-side code
- **Server-side Operations**: All AWS operations performed server-side

### User Experience Security
- **Clear Warnings**: Explicit messaging about irreversible actions
- **Visual Feedback**: Different modal types for different actions
- **Loading States**: Clear indication of ongoing operations
- **Error Handling**: Comprehensive error messages and recovery
- **Secret Input UX**: Intuitive interface with keyboard shortcuts

## 🎨 User Interface Features

### Modal System
- **6 Modal Types**: Error, Success, Info, Warning, Confirmation, EC2 Secret
- **Content Modals**: Support for custom content and forms
- **Confirmation Modals**: Secure action confirmations
- **Secret Verification Modal**: Professional interface for EC2 secret entry
- **Auto-close**: Configurable auto-close for notifications
- **Responsive**: Works on all screen sizes

### Secret Input Component
- **6 Individual Boxes**: Modern interface for 6-character secret entry
- **Keyboard Navigation**: Arrow keys, Home, End, Backspace support
- **Paste Functionality**: Paste entire secret at once
- **Auto-focus**: Automatic focus progression as user types
- **Visual Feedback**: Clear focus states and validation
- **Accessibility**: Full keyboard and screen reader support

### Interactive Elements
- **Pointer Cursors**: All clickable elements show hand cursor
- **Hover Effects**: Smooth transitions and visual feedback
- **Loading States**: Spinners and disabled states during operations
- **Status Indicators**: Color-coded badges for different states

### Navigation
- **Clickable Logo**: EC2 Manager text/logo navigates to dashboard
- **Consistent Layout**: Same navigation structure across pages
- **Active States**: Current page highlighted in navigation
- **Responsive Design**: Mobile-friendly navigation

## 🔍 Troubleshooting

### Common Issues

1. **DynamoDB Connection Failed**
   - Verify AWS credentials in `.env.local`
   - Ensure DynamoDB table exists and is accessible
   - Check AWS region configuration

2. **EC2 Instances Not Loading**
   - Verify EC2 permissions for your AWS credentials
   - Check AWS region matches your instances
   - Ensure instances are in the configured region

3. **Modal Not Opening**
   - Check browser console for JavaScript errors
   - Verify ModalContext is properly configured
   - Ensure all dependencies are installed

4. **Confirmation Modals Not Working**
   - Check that ModalContext is wrapped around the app
   - Verify all modal functions are properly imported
   - Ensure TypeScript types are correct

5. **Password Validation Issues**
   - Ensure password meets all requirements
   - Check that bcryptjs is properly installed
   - Verify password validation functions are working

6. **EC2 Secret Issues**
   - Ensure secret is exactly 6 characters long
   - Check that secret protection is enabled in settings
   - Verify secret is correctly saved in DynamoDB
   - Check server-side verification is working

### Performance Tips
- Use appropriate AWS regions for better latency
- Consider using IAM roles instead of access keys for production
- Monitor AWS API rate limits for large instance counts
- Use pnpm for faster package installation and better dependency management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the DynamoDB setup guide

---

**Note**: This application requires proper AWS credentials and permissions to function correctly. Always follow AWS security best practices when configuring credentials. The enhanced confirmation system, password hashing, and EC2 secret protection help prevent accidental data loss and ensure secure operations while maintaining a smooth user experience.
