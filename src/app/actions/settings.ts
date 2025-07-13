'use server';

import {
    deleteAWSCredentials,
    getAWSCredentials,
    getAllAWSCredentials,
    getSettings,
    saveAWSCredentials,
    saveSettings,
    testDynamoDBConnection,
    updateAWSCredentials,
    updateSettings,
    type AWSCredentials,
    type Settings
} from '@/lib/dynamodb-config';
import { hashPassword, validatePassword } from '@/lib/password-utils';
import { revalidatePath } from 'next/cache';

// AWS Credentials Actions
export async function saveCredentialsAction(formData: FormData): Promise<{ success: boolean; message: string; data?: AWSCredentials }> {
    try {
        const accessKeyId = formData.get('accessKeyId') as string;
        const secretAccessKey = formData.get('secretAccessKey') as string;
        const region = formData.get('region') as string;
        const profileName = formData.get('profileName') as string || 'default';

        if (!accessKeyId || !secretAccessKey || !region) {
            return {
                success: false,
                message: 'Access Key ID, Secret Access Key, and Region are required'
            };
        }

        const credentials = await saveAWSCredentials({
            accessKeyId,
            secretAccessKey,
            region,
            profileName,
            isActive: true,
        });

        revalidatePath('/settings');

        return {
            success: true,
            message: `AWS credentials saved successfully for profile: ${profileName}`,
            data: credentials
        };
    } catch (error) {
        console.error('Error saving credentials:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to save AWS credentials'
        };
    }
}

export async function getCredentialsAction(profileName: string = 'default'): Promise<{ success: boolean; message: string; data?: AWSCredentials }> {
    try {
        const credentials = await getAWSCredentials(profileName);

        if (!credentials) {
            return {
                success: false,
                message: `No credentials found for profile: ${profileName}`
            };
        }

        return {
            success: true,
            message: 'Credentials retrieved successfully',
            data: credentials
        };
    } catch (error) {
        console.error('Error getting credentials:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to get AWS credentials'
        };
    }
}

export async function getAllCredentialsAction(): Promise<{ success: boolean; message: string; data?: AWSCredentials[] }> {
    try {
        const credentials = await getAllAWSCredentials();

        return {
            success: true,
            message: `Retrieved ${credentials.length} credential profiles`,
            data: credentials
        };
    } catch (error) {
        console.error('Error getting all credentials:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to get AWS credentials'
        };
    }
}

export async function updateCredentialsAction(formData: FormData): Promise<{ success: boolean; message: string; data?: AWSCredentials }> {
    try {
        const id = formData.get('id') as string;
        const accessKeyId = formData.get('accessKeyId') as string;
        const secretAccessKey = formData.get('secretAccessKey') as string;
        const region = formData.get('region') as string;
        const isActive = formData.get('isActive') === 'true';

        if (!id) {
            return {
                success: false,
                message: 'Credential ID is required'
            };
        }

        const updates: Partial<AWSCredentials> = {};
        if (accessKeyId) updates.accessKeyId = accessKeyId;
        if (secretAccessKey) updates.secretAccessKey = secretAccessKey;
        if (region) updates.region = region;
        updates.isActive = isActive;

        const credentials = await updateAWSCredentials(id, updates);

        revalidatePath('/settings');

        return {
            success: true,
            message: `AWS credentials updated successfully for profile: ${id}`,
            data: credentials
        };
    } catch (error) {
        console.error('Error updating credentials:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to update AWS credentials'
        };
    }
}

export async function deleteCredentialsAction(formData: FormData): Promise<{ success: boolean; message: string }> {
    try {
        const id = formData.get('id') as string;

        if (!id) {
            return {
                success: false,
                message: 'Credential ID is required'
            };
        }

        await deleteAWSCredentials(id);

        revalidatePath('/settings');

        return {
            success: true,
            message: `AWS credentials deleted successfully for profile: ${id}`
        };
    } catch (error) {
        console.error('Error deleting credentials:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to delete AWS credentials'
        };
    }
}

// Settings Actions
export async function saveSettingsAction(formData: FormData): Promise<{ success: boolean; message: string; data?: Settings }> {
    try {
        const username = formData.get('username') as string || '';
        const password = formData.get('password') as string || '';
        const ec2Secret = formData.get('ec2Secret') as string || '';
        const ec2SecretEnabled = formData.get('ec2SecretEnabled') === 'true';

        // Validate password if provided
        if (password) {
            const validation = validatePassword(password);
            if (!validation.isValid) {
                return {
                    success: false,
                    message: `Password validation failed: ${validation.errors.join(', ')}`
                };
            }
        }

        // Validate EC2 secret if enabled
        if (ec2SecretEnabled && ec2Secret.length !== 6) {
            return {
                success: false,
                message: 'EC2 secret must be exactly 6 characters long'
            };
        }

        // Hash password before storing
        const hashedPassword = await hashPassword(password);

        const settings = await saveSettings({
            username,
            password: hashedPassword,
            ec2Secret: ec2SecretEnabled ? ec2Secret : '',
            ec2SecretEnabled,
        });

        revalidatePath('/settings');

        return {
            success: true,
            message: 'Application settings saved successfully',
            data: settings
        };
    } catch (error) {
        console.error('Error saving settings:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to save settings'
        };
    }
}

export async function getSettingsAction(): Promise<{ success: boolean; message: string; data?: Settings }> {
    try {
        const settings = await getSettings();

        if (!settings) {
            return {
                success: false,
                message: 'No settings found'
            };
        }

        return {
            success: true,
            message: 'Settings retrieved successfully',
            data: settings
        };
    } catch (error) {
        console.error('Error getting settings:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to get settings'
        };
    }
}

export async function updateSettingsAction(formData: FormData): Promise<{ success: boolean; message: string; data?: Settings }> {
    try {
        const id = formData.get('id') as string || 'default';
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;
        const ec2Secret = formData.get('ec2Secret') as string;
        const ec2SecretEnabled = formData.get('ec2SecretEnabled') === 'true';

        const updates: Partial<Settings> = {};
        if (username !== null) updates.username = username;
        if (ec2SecretEnabled !== null) updates.ec2SecretEnabled = ec2SecretEnabled;

        // Only hash password if a new one is provided
        if (password !== null && password !== '') {
            const validation = validatePassword(password);
            if (!validation.isValid) {
                return {
                    success: false,
                    message: `Password validation failed: ${validation.errors.join(', ')}`
                };
            }
            updates.password = await hashPassword(password);
        }

        // Handle EC2 secret
        if (ec2Secret !== null) {
            if (ec2SecretEnabled && ec2Secret.length !== 6) {
                return {
                    success: false,
                    message: 'EC2 secret must be exactly 6 characters long'
                };
            }
            updates.ec2Secret = ec2SecretEnabled ? ec2Secret : '';
        }

        const settings = await updateSettings(id, updates);

        revalidatePath('/settings');

        return {
            success: true,
            message: 'Application settings updated successfully',
            data: settings
        };
    } catch (error) {
        console.error('Error updating settings:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to update settings'
        };
    }
}

// Test Actions
export async function testDynamoDBConnectionAction(): Promise<{ success: boolean; message: string }> {
    try {
        const isConnected = await testDynamoDBConnection();

        if (isConnected) {
            return {
                success: true,
                message: 'DynamoDB connection successful'
            };
        } else {
            return {
                success: false,
                message: 'DynamoDB connection failed'
            };
        }
    } catch (error) {
        console.error('Error testing DynamoDB connection:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to test DynamoDB connection'
        };
    }
} 