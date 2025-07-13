# DynamoDB Setup Guide for EC2 Manager

This guide will help you set up the DynamoDB table required for the EC2 Manager application to store AWS credentials and application settings.

## Table Structure

The application uses a DynamoDB table named `ec2-manager` with the following structure:

### Table Name
```
ec2-manager
```

### Primary Key Structure
- **Partition Key (PK)**: String - Used to categorize items
- **Sort Key (SK)**: String - Used for unique identification

### Item Types

#### 1. AWS Credentials
```
PK: "CREDENTIALS#{profileName}"
SK: "CREDENTIALS#{profileName}"
```

**Attributes:**
- `id`: String (profile name or "default")
- `accessKeyId`: String (AWS Access Key ID)
- `secretAccessKey`: String (AWS Secret Access Key)
- `region`: String (AWS Region)
- `profileName`: String (optional profile name)
- `isActive`: Boolean (whether this credential is active)
- `createdAt`: String (ISO timestamp)
- `updatedAt`: String (ISO timestamp)

#### 2. Application Settings
```
PK: "SETTINGS#default"
SK: "SETTINGS#default"
```

**Attributes:**
- `id`: String (always "default")
- `autoRefreshInterval`: Number (seconds for auto-refresh)
- `defaultRegion`: String (default AWS region)
- `theme`: String ("light" or "dark")
- `notifications`: Boolean (enable notifications)
- `createdAt`: String (ISO timestamp)
- `updatedAt`: String (ISO timestamp)

## Setup Instructions

### Option 1: AWS Console

1. **Open DynamoDB Console**
   - Go to AWS Console → DynamoDB
   - Click "Create table"

2. **Table Configuration**
   - **Table name**: `ec2-manager`
   - **Partition key**: `PK` (String)
   - **Sort key**: `SK` (String)
   - **Table settings**: Customize settings
   - **Capacity mode**: On-demand (recommended for development)

3. **Advanced Settings**
   - **Point-in-time recovery**: Enabled (recommended)
   - **Tags**: Add appropriate tags for cost tracking

4. **Create Table**
   - Click "Create table"
   - Wait for table creation to complete

### Option 2: AWS CLI

```bash
# Create the DynamoDB table
aws dynamodb create-table \
    --table-name ec2-manager \
    --attribute-definitions \
        AttributeName=PK,AttributeType=S \
        AttributeName=SK,AttributeType=S \
    --key-schema \
        AttributeName=PK,KeyType=HASH \
        AttributeName=SK,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true
```

### Option 3: CloudFormation Template

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'DynamoDB table for EC2 Manager application'

Resources:
  EC2ManagerTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: ec2-manager
      AttributeDefinitions:
        - AttributeName: PK
          AttributeType: S
        - AttributeName: SK
          AttributeType: S
      KeySchema:
        - AttributeName: PK
          KeyType: HASH
        - AttributeName: SK
          KeyType: RANGE
      BillingMode: PAY_PER_REQUEST
      PointInTimeRecoverySpecification:
        PointInTimeRecoveryEnabled: true
      Tags:
        - Key: Application
          Value: EC2-Manager
        - Key: Environment
          Value: Production
```

## Required IAM Permissions

Your AWS credentials need the following DynamoDB permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:GetItem",
                "dynamodb:PutItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem",
                "dynamodb:Scan",
                "dynamodb:Query"
            ],
            "Resource": "arn:aws:dynamodb:*:*:table/ec2-manager"
        }
    ]
}
```

## Security Considerations

### 1. Encryption
- DynamoDB tables are encrypted at rest by default
- Consider using AWS KMS for additional encryption control

### 2. Access Control
- Use IAM roles with least privilege access
- Consider using DynamoDB Streams for audit logging
- Enable CloudTrail for API call logging

### 3. Credential Storage
- AWS credentials are stored in DynamoDB
- Consider using AWS Secrets Manager for production environments
- Implement proper access controls and encryption

## Testing the Setup

1. **Test Connection**
   - The application will automatically test the DynamoDB connection
   - Check the connection status on the Settings page

2. **Add Test Credentials**
   - Go to Settings page
   - Add your AWS credentials
   - Verify they are saved successfully

3. **Verify Data**
   - Check DynamoDB console to see the saved items
   - Verify the data structure matches the expected format

## Troubleshooting

### Common Issues

1. **Table Not Found**
   - Verify table name is exactly `ec2-manager`
   - Check AWS region matches your credentials

2. **Access Denied**
   - Verify IAM permissions include DynamoDB access
   - Check that credentials have the required permissions

3. **Connection Timeout**
   - Check network connectivity
   - Verify AWS region is correct
   - Check VPC settings if applicable

### Monitoring

1. **CloudWatch Metrics**
   - Monitor DynamoDB table metrics
   - Set up alarms for errors and throttling

2. **CloudTrail**
   - Enable CloudTrail for API call logging
   - Monitor for unauthorized access attempts

## Cost Optimization

1. **Billing Mode**
   - Use On-Demand for development/testing
   - Consider Provisioned Capacity for production with predictable workloads

2. **Data Lifecycle**
   - Implement TTL for old credentials
   - Archive old settings data

3. **Monitoring**
   - Set up CloudWatch alarms for costs
   - Monitor read/write capacity usage

## Next Steps

After setting up the DynamoDB table:

1. Configure your AWS credentials in the application
2. Test the connection and functionality
3. Set up monitoring and alerting
4. Review security settings
5. Consider backup and disaster recovery options

For production deployments, consider:
- Using AWS Secrets Manager for credential storage
- Implementing proper backup strategies
- Setting up monitoring and alerting
- Reviewing security best practices 