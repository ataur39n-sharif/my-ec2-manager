# EC2 Manager

A modern, real-time AWS EC2 instance management application built with Next.js 15, TypeScript, and Tailwind CSS. Monitor and control your EC2 instances with an intuitive web interface featuring real-time status updates, auto-refresh, and comprehensive instance management capabilities.

## 🚀 Features

### **Real-Time Instance Management**
- ✅ **Live Status Monitoring**: Real-time EC2 instance status with accurate state detection
- ✅ **Smart Status Detection**: Distinguishes between "running", "initializing", and "ready" states
- ✅ **Auto-Refresh**: Automatic page refresh every 30 seconds with countdown timer
- ✅ **Manual Refresh**: Instant refresh button with loading indicators

### **Instance Operations**
- ✅ **Start Instances**: Start stopped instances with visual feedback
- ✅ **Stop Instances**: Stop running instances safely
- ✅ **Cancel Start Operations**: Cancel instances that are starting or initializing
- ✅ **Status Checks**: AWS instance status check integration for accurate state reporting

### **Enhanced User Experience**
- ✅ **Modal System**: Professional modal dialogs for all user feedback
- ✅ **Loading States**: Visual loading indicators for all operations
- ✅ **Error Handling**: Comprehensive error handling with user-friendly messages
- ✅ **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- ✅ **Real-Time Updates**: Instant status updates without page reloads

### **Instance Information Display**
- ✅ **Detailed Instance Info**: Instance type, IP addresses, launch time, tags
- ✅ **Status Summary**: Overview of running, stopped, initializing instances
- ✅ **Visual Status Indicators**: Color-coded status badges with icons
- ✅ **Instance Tags**: Display and management of EC2 instance tags
- ✅ **Real-Time Dashboard**: Homepage with live statistics and recent instances
- ✅ **Instance Type Distribution**: Analysis of instance types and resource allocation

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AWS SDK**: AWS SDK v3 for EC2 operations
- **State Management**: React Context for modal management
- **Package Manager**: pnpm
- **Linting**: ESLint (ignored in production builds)

## 📋 Prerequisites

- Node.js 18+ 
- pnpm package manager
- AWS account with EC2 access
- AWS credentials configured

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

### 3. Configure AWS Credentials
Set up your AWS credentials using one of these methods:

**Option A: AWS CLI**
```bash
aws configure
```

**Option B: Environment Variables**
Create a `.env.local` file:
```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
```

**Option C: IAM Roles** (for EC2 deployment)
Attach appropriate IAM role with EC2 permissions.

### 4. Start Development Server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
ec2-manager/
├── src/
│   ├── app/
│   │   ├── actions/
│   │   │   └── applications.ts    # Server actions for EC2 operations
│   │   ├── applications/
│   │   │   └── page.tsx           # Main EC2 instances page
│   │   ├── layout.tsx             # Root layout with modal provider
│   │   └── page.tsx               # Real-time dashboard homepage
│   ├── components/
│   │   ├── AutoRefresh.tsx        # Auto-refresh component with countdown
│   │   ├── CancelButton.tsx       # Cancel start operation button
│   │   ├── Modal.tsx              # Reusable modal component
│   │   ├── StartButton.tsx        # Start instance button
│   │   └── StopButton.tsx         # Stop instance button
│   ├── contexts/
│   │   └── ModalContext.tsx       # Global modal management
│   └── lib/
│       └── aws-config.ts          # AWS SDK configuration
├── public/                        # Static assets
├── next.config.ts                 # Next.js configuration
├── package.json                   # Dependencies and scripts
└── README.md                      # This file
```

## 🔧 Configuration

### AWS Permissions
Your AWS credentials need the following EC2 permissions:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ec2:DescribeInstances",
                "ec2:DescribeInstanceStatus",
                "ec2:StartInstances",
                "ec2:StopInstances"
            ],
            "Resource": "*"
        }
    ]
}
```

### Environment Variables
Create a `.env.local` file for local development:
```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
```

## 🚀 Deployment

### Build for Production
```bash
pnpm build
```

### Start Production Server
```bash
pnpm start
```

### Deploy to Vercel
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

## 🎯 Key Features Explained

### **Smart Status Detection**
The application uses AWS instance status checks to accurately determine instance state:
- **Running**: Instance is running and status checks are passed
- **Initializing**: Instance is running but status checks haven't passed yet
- **Starting**: Instance is in pending state
- **Stopping**: Instance is being stopped
- **Stopped**: Instance is stopped

### **Cancel Start Operation**
Unlike traditional EC2 management tools, this application allows you to cancel start operations even after the instance has transitioned to "running" state, as long as it's still initializing (status checks not passed).

### **Real-Time Updates**
- **Auto-refresh**: Every 30 seconds with countdown timer
- **Manual refresh**: Instant refresh with loading indicators
- **Operation feedback**: Immediate visual feedback for all operations
- **Modal notifications**: Professional modal dialogs for all user interactions
- **Live dashboard**: Homepage with real-time statistics and recent instances
- **Dynamic alerts**: Smart warnings for ongoing operations

### **Modal System**
Comprehensive modal system with:
- **4 Types**: Error, Success, Info, Warning
- **Auto-close**: 5-second default with user override
- **Immediate close**: Users can close modals anytime
- **Context-aware**: Different colors and icons for each type

## 🔍 Troubleshooting

### Common Issues

**1. AWS Credentials Not Found**
```
Error: AWS credentials not configured
```
**Solution**: Configure AWS credentials using AWS CLI or environment variables.

**2. EC2 Permissions Denied**
```
Error: User is not authorized to perform: ec2:DescribeInstances
```
**Solution**: Ensure your AWS user/role has the required EC2 permissions.

**3. Build Errors**
```
Error: ESLint errors found
```
**Solution**: ESLint is ignored in production builds. For development, fix linting issues or run `pnpm lint` to see details.

### Performance Tips
- Use appropriate AWS regions for better latency
- Consider using IAM roles instead of access keys for production
- Monitor AWS API rate limits for large instance counts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- AWS integration with [AWS SDK v3](https://aws.amazon.com/sdk-for-javascript/)
- Icons and UI components from various open-source libraries

---

**Note**: This application requires proper AWS credentials and permissions to function. Always follow AWS security best practices when deploying to production environments.
