import { EC2Client } from '@aws-sdk/client-ec2';

// AWS Configuration
const awsConfig = {
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
};

// Create EC2 client
export const ec2Client = new EC2Client(awsConfig);

// EC2 Instance State mapping
export const INSTANCE_STATES = {
    'pending': 'pending',
    'running': 'running',
    'stopping': 'stopping',
    'stopped': 'stopped',
    'shutting-down': 'shutting-down',
    'terminated': 'terminated',
} as const;

export type InstanceState = keyof typeof INSTANCE_STATES;

// Helper function to check if instance is active (running)
export function isInstanceActive(state: string): boolean {
    return state === 'running';
}

// Helper function to get readable state name
export function getReadableState(state: string): string {
    const stateMap: Record<string, string> = {
        'pending': 'Starting',
        'running': 'Running',
        'stopping': 'Stopping',
        'stopped': 'Stopped',
        'shutting-down': 'Shutting Down',
        'terminated': 'Terminated',
    };
    return stateMap[state] || state;
} 