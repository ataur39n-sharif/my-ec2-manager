'use server';

import { getSettings } from '@/lib/dynamodb-config';

export async function verifyEC2SecretAction(secret: string): Promise<{ success: boolean; message: string }> {
    try {
        const settings = await getSettings();

        if (!settings) {
            return {
                success: false,
                message: 'Application settings not found'
            };
        }

        if (!settings.ec2SecretEnabled) {
            return {
                success: false,
                message: 'EC2 secret protection is not enabled'
            };
        }

        if (settings.ec2Secret !== secret) {
            return {
                success: false,
                message: 'Invalid EC2 secret'
            };
        }

        return {
            success: true,
            message: 'EC2 secret verified successfully'
        };
    } catch (error) {
        console.error('Error verifying EC2 secret:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to verify EC2 secret'
        };
    }
}

export async function isEC2SecretRequiredAction(): Promise<{ success: boolean; required: boolean; message: string }> {
    try {
        const settings = await getSettings();

        if (!settings) {
            return {
                success: true,
                required: false,
                message: 'No settings found, EC2 secret not required'
            };
        }

        return {
            success: true,
            required: settings.ec2SecretEnabled && settings.ec2Secret.length === 6,
            message: settings.ec2SecretEnabled ? 'EC2 secret is required' : 'EC2 secret is not required'
        };
    } catch (error) {
        console.error('Error checking EC2 secret requirement:', error);
        return {
            success: false,
            required: false,
            message: error instanceof Error ? error.message : 'Failed to check EC2 secret requirement'
        };
    }
} 