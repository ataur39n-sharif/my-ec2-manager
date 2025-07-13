# AWS EC2 Manager Setup

This application manages AWS EC2 instances using the AWS SDK. Follow these steps to set up your AWS credentials.

## Prerequisites

1. **AWS Account** - You need an active AWS account
2. **EC2 Instances** - At least one EC2 instance in your AWS account
3. **AWS Credentials** - Access key and secret key with EC2 permissions

## AWS Credentials Setup

### Option 1: Environment Variables (Recommended)

Create a `.env.local` file in the root directory:

```bash
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1

# Optional: AWS Session Token (if using temporary credentials)
# AWS_SESSION_TOKEN=your_session_token_here
```

### Option 2: AWS CLI Configuration

If you have AWS CLI installed, you can configure credentials:

```bash
aws configure
```

This will create credentials in `~/.aws/credentials` which the SDK will automatically use.

## Required AWS Permissions

Your AWS credentials need the following EC2 permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeInstances",
        "ec2:StartInstances",
        "ec2:StopInstances",
        "ec2:DescribeInstanceStatus"
      ],
      "Resource": "*"
    }
  ]
}
```

## Getting AWS Credentials

### For IAM Users:
1. Go to AWS Console → IAM → Users
2. Select your user → Security credentials tab
3. Create access key
4. Copy Access Key ID and Secret Access Key

### For Root User (Not Recommended):
1. Go to AWS Console → Account → Security credentials
2. Create access key
3. Copy Access Key ID and Secret Access Key

## Instance Tagging (Optional but Recommended)

For better instance identification, tag your EC2 instances:

- **Name tag**: Used as the instance name in the UI
- **Description tag**: Used as the instance description

Example tags:
```
Name: Web Server
Description: Production web application server
```

## Testing the Setup

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Navigate to `/applications`
3. You should see your EC2 instances listed
4. Test start/stop functionality

## Troubleshooting

### Common Issues:

1. **"Failed to fetch EC2 instances"**
   - Check your AWS credentials
   - Verify the region is correct
   - Ensure you have EC2 instances in the specified region

2. **"Access Denied"**
   - Verify your IAM permissions
   - Check if your access key is active
   - Ensure you have the required EC2 permissions

3. **"No instances found"**
   - Check if you have EC2 instances in the specified region
   - Verify the region in your AWS configuration

### Security Best Practices:

1. **Never commit credentials** to version control
2. **Use IAM roles** instead of access keys when possible
3. **Rotate access keys** regularly
4. **Use least privilege** principle for IAM permissions
5. **Enable MFA** for your AWS account

## Environment Variables Reference

| Variable                | Description                             | Required | Default   |
| ----------------------- | --------------------------------------- | -------- | --------- |
| `AWS_ACCESS_KEY_ID`     | Your AWS access key                     | Yes      | -         |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret key                     | Yes      | -         |
| `AWS_REGION`            | AWS region for EC2 instances            | No       | us-east-1 |
| `AWS_SESSION_TOKEN`     | Session token for temporary credentials | No       | -         |