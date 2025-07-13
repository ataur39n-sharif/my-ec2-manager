import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client
const dynamoClient = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

export interface AWSCredentials {
    id: string;
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    profileName?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Settings {
    id: string;
    username: string;
    password: string;
    ec2Secret: string;
    ec2SecretEnabled: boolean;
    createdAt: string;
    updatedAt: string;
}

// DynamoDB table name
const TABLE_NAME = 'ec2-manager';

// AWS Credentials operations
export async function saveAWSCredentials(credentials: Omit<AWSCredentials, 'id' | 'createdAt' | 'updatedAt'>): Promise<AWSCredentials> {
    const id = credentials.profileName || 'default';
    const now = new Date().toISOString();

    const item: AWSCredentials = {
        id,
        ...credentials,
        createdAt: now,
        updatedAt: now,
    };

    try {
        await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: {
                PK: `CREDENTIALS#${id}`,
                SK: `CREDENTIALS#${id}`,
                ...item,
            },
        }));

        return item;
    } catch (error) {
        console.error('Error saving AWS credentials:', error);
        throw new Error('Failed to save AWS credentials');
    }
}

export async function getAWSCredentials(id: string = 'default'): Promise<AWSCredentials | null> {
    try {
        const response = await docClient.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: `CREDENTIALS#${id}`,
                SK: `CREDENTIALS#${id}`,
            },
        }));

        if (!response.Item) {
            return null;
        }

        // Remove DynamoDB keys and return the credentials
        const { PK, SK, ...credentials } = response.Item;
        return credentials as AWSCredentials;
    } catch (error) {
        console.error('Error getting AWS credentials:', error);
        throw new Error('Failed to get AWS credentials');
    }
}

export async function getAllAWSCredentials(): Promise<AWSCredentials[]> {
    try {
        const response = await docClient.send(new ScanCommand({
            TableName: TABLE_NAME,
            FilterExpression: 'begins_with(PK, :pk)',
            ExpressionAttributeValues: {
                ':pk': 'CREDENTIALS#',
            },
        }));

        return (response.Items || []).map(item => {
            const { PK, SK, ...credentials } = item;
            return credentials as AWSCredentials;
        });
    } catch (error) {
        console.error('Error getting all AWS credentials:', error);
        throw new Error('Failed to get AWS credentials');
    }
}

export async function updateAWSCredentials(id: string, updates: Partial<AWSCredentials>): Promise<AWSCredentials> {
    const now = new Date().toISOString();

    try {
        const updateExpression: string[] = [];
        const expressionAttributeNames: Record<string, string> = {};
        const expressionAttributeValues: Record<string, any> = {};

        // Build update expression dynamically
        Object.entries(updates).forEach(([key, value]) => {
            if (key !== 'id' && key !== 'createdAt') {
                updateExpression.push(`#${key} = :${key}`);
                expressionAttributeNames[`#${key}`] = key;
                expressionAttributeValues[`:${key}`] = value;
            }
        });

        // Always update the updatedAt timestamp
        updateExpression.push('#updatedAt = :updatedAt');
        expressionAttributeNames['#updatedAt'] = 'updatedAt';
        expressionAttributeValues[':updatedAt'] = now;

        const response = await docClient.send(new UpdateCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: `CREDENTIALS#${id}`,
                SK: `CREDENTIALS#${id}`,
            },
            UpdateExpression: `SET ${updateExpression.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW',
        }));

        if (!response.Attributes) {
            throw new Error('Failed to update AWS credentials');
        }

        const { PK, SK, ...credentials } = response.Attributes;
        return credentials as AWSCredentials;
    } catch (error) {
        console.error('Error updating AWS credentials:', error);
        throw new Error('Failed to update AWS credentials');
    }
}

export async function deleteAWSCredentials(id: string): Promise<void> {
    try {
        await docClient.send(new DeleteCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: `CREDENTIALS#${id}`,
                SK: `CREDENTIALS#${id}`,
            },
        }));
    } catch (error) {
        console.error('Error deleting AWS credentials:', error);
        throw new Error('Failed to delete AWS credentials');
    }
}

// Settings operations
export async function saveSettings(settings: Omit<Settings, 'id' | 'createdAt' | 'updatedAt'>): Promise<Settings> {
    const id = 'default';
    const now = new Date().toISOString();

    const item: Settings = {
        id,
        ...settings,
        createdAt: now,
        updatedAt: now,
    };

    try {
        await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: {
                PK: `SETTINGS#${id}`,
                SK: `SETTINGS#${id}`,
                ...item,
            },
        }));

        return item;
    } catch (error) {
        console.error('Error saving settings:', error);
        throw new Error('Failed to save settings');
    }
}

export async function getSettings(id: string = 'default'): Promise<Settings | null> {
    try {
        const response = await docClient.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: `SETTINGS#${id}`,
                SK: `SETTINGS#${id}`,
            },
        }));

        if (!response.Item) {
            return null;
        }

        const { PK, SK, ...settings } = response.Item;
        return settings as Settings;
    } catch (error) {
        console.error('Error getting settings:', error);
        throw new Error('Failed to get settings');
    }
}

export async function updateSettings(id: string, updates: Partial<Settings>): Promise<Settings> {
    const now = new Date().toISOString();

    try {
        const updateExpression: string[] = [];
        const expressionAttributeNames: Record<string, string> = {};
        const expressionAttributeValues: Record<string, any> = {};

        Object.entries(updates).forEach(([key, value]) => {
            if (key !== 'id' && key !== 'createdAt') {
                updateExpression.push(`#${key} = :${key}`);
                expressionAttributeNames[`#${key}`] = key;
                expressionAttributeValues[`:${key}`] = value;
            }
        });

        updateExpression.push('#updatedAt = :updatedAt');
        expressionAttributeNames['#updatedAt'] = 'updatedAt';
        expressionAttributeValues[':updatedAt'] = now;

        const response = await docClient.send(new UpdateCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: `SETTINGS#${id}`,
                SK: `SETTINGS#${id}`,
            },
            UpdateExpression: `SET ${updateExpression.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW',
        }));

        if (!response.Attributes) {
            throw new Error('Failed to update settings');
        }

        const { PK, SK, ...settings } = response.Attributes;
        return settings as Settings;
    } catch (error) {
        console.error('Error updating settings:', error);
        throw new Error('Failed to update settings');
    }
}

// Test DynamoDB connection
export async function testDynamoDBConnection(): Promise<boolean> {
    try {
        await docClient.send(new ScanCommand({
            TableName: TABLE_NAME,
            Limit: 1,
        }));
        return true;
    } catch (error) {
        console.error('DynamoDB connection test failed:', error);
        return false;
    }
} 