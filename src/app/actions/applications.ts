'use server';

import { ec2Client, getReadableState } from '@/lib/aws-config';
import {
    DescribeInstancesCommand,
    DescribeInstanceStatusCommand,
    StartInstancesCommand,
    StopInstancesCommand
} from '@aws-sdk/client-ec2';
import { revalidatePath } from 'next/cache';

export interface Application {
    id: string;
    name: string;
    status: 'active' | 'inactive' | 'pending' | 'stopping' | 'initializing';
    description: string;
    lastUpdated: string;
    instanceType?: string;
    publicIp?: string;
    privateIp?: string;
    launchTime?: string;
    tags?: { [key: string]: string };
    currentState?: string;
    instanceStatus?: string;
}

// Get all EC2 instances with detailed status
export async function getApplications(): Promise<Application[]> {
    try {
        const command = new DescribeInstancesCommand({});
        const response = await ec2Client.send(command);

        const applications: Application[] = [];

        if (response.Reservations) {
            for (const reservation of response.Reservations) {
                if (reservation.Instances) {
                    for (const instance of reservation.Instances) {
                        if (instance.InstanceId && instance.State?.Name) {
                            // Get instance name from tags
                            const nameTag = instance.Tags?.find(tag => tag.Key === 'Name');
                            const name = nameTag?.Value || `Instance ${instance.InstanceId}`;

                            // Get description from tags or use instance type
                            const descriptionTag = instance.Tags?.find(tag => tag.Key === 'Description');
                            const description = descriptionTag?.Value || `${instance.InstanceType || 'Unknown'} instance`;

                            // Convert tags to object
                            const tags: { [key: string]: string } = {};
                            instance.Tags?.forEach(tag => {
                                if (tag.Key && tag.Value) {
                                    tags[tag.Key] = tag.Value;
                                }
                            });

                            // Determine status based on instance state and status checks
                            let status: Application['status'] = 'inactive';
                            let instanceStatus = 'unknown';

                            if (instance.State.Name === 'running') {
                                // Check if the instance is actually ready by looking at status checks
                                try {
                                    const statusCommand = new DescribeInstanceStatusCommand({
                                        InstanceIds: [instance.InstanceId],
                                        IncludeAllInstances: true
                                    });
                                    const statusResponse = await ec2Client.send(statusCommand);

                                    if (statusResponse.InstanceStatuses && statusResponse.InstanceStatuses.length > 0) {
                                        const instanceStatusInfo = statusResponse.InstanceStatuses[0];
                                        instanceStatus = instanceStatusInfo.InstanceStatus?.Status || 'unknown';

                                        // If instance is running but status checks are not passed, it's still initializing
                                        if (instanceStatusInfo.InstanceStatus?.Status === 'ok' &&
                                            instanceStatusInfo.SystemStatus?.Status === 'ok') {
                                            status = 'active';
                                        } else {
                                            status = 'initializing';
                                        }
                                    } else {
                                        // If we can't get status, assume it's initializing
                                        status = 'initializing';
                                    }
                                } catch (statusError) {
                                    console.warn(`Could not get status for instance ${instance.InstanceId}:`, statusError);
                                    status = 'initializing';
                                }
                            } else if (instance.State.Name === 'pending') {
                                status = 'pending';
                            } else if (instance.State.Name === 'stopping') {
                                status = 'stopping';
                            }

                            applications.push({
                                id: instance.InstanceId,
                                name,
                                status,
                                description,
                                lastUpdated: new Date().toISOString(),
                                instanceType: instance.InstanceType,
                                publicIp: instance.PublicIpAddress,
                                privateIp: instance.PrivateIpAddress,
                                launchTime: instance.LaunchTime?.toISOString(),
                                tags,
                                currentState: instance.State.Name,
                                instanceStatus
                            });
                        }
                    }
                }
            }
        }

        return applications;
    } catch (error) {
        console.error('Error fetching EC2 instances:', error);
        throw new Error('Failed to fetch EC2 instances');
    }
}

// Start an EC2 instance
export async function startApplication(id: string): Promise<{ success: boolean; message: string; newState?: string }> {
    try {
        console.log(`Starting EC2 instance: ${id}`);

        const command = new StartInstancesCommand({
            InstanceIds: [id]
        });

        const response = await ec2Client.send(command);

        if (response.StartingInstances && response.StartingInstances.length > 0) {
            const instance = response.StartingInstances[0];
            const state = instance.CurrentState?.Name;

            console.log(`Instance ${id} starting. Current state: ${state}`);

            // Revalidate the applications page to show updated data
            revalidatePath('/applications');

            return {
                success: true,
                message: `Instance ${id} is starting. Current state: ${getReadableState(state || 'unknown')}`,
                newState: state
            };
        } else {
            throw new Error('No instance found to start');
        }
    } catch (error) {
        console.error('Error starting EC2 instance:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to start instance'
        };
    }
}

// Stop an EC2 instance
export async function stopApplication(id: string): Promise<{ success: boolean; message: string; newState?: string }> {
    try {
        console.log(`Stopping EC2 instance: ${id}`);

        const command = new StopInstancesCommand({
            InstanceIds: [id]
        });

        const response = await ec2Client.send(command);

        if (response.StoppingInstances && response.StoppingInstances.length > 0) {
            const instance = response.StoppingInstances[0];
            const state = instance.CurrentState?.Name;

            console.log(`Instance ${id} stopping. Current state: ${state}`);

            // Revalidate the applications page to show updated data
            revalidatePath('/applications');

            return {
                success: true,
                message: `Instance ${id} is stopping. Current state: ${getReadableState(state || 'unknown')}`,
                newState: state
            };
        } else {
            throw new Error('No instance found to stop');
        }
    } catch (error) {
        console.error('Error stopping EC2 instance:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to stop instance'
        };
    }
}

// Cancel start operation (stop an instance that's starting or initializing)
export async function cancelStartOperation(id: string): Promise<{ success: boolean; message: string; newState?: string }> {
    try {
        console.log(`Canceling start operation for EC2 instance: ${id}`);

        // First, check the current state of the instance
        const describeCommand = new DescribeInstancesCommand({
            InstanceIds: [id]
        });

        const describeResponse = await ec2Client.send(describeCommand);

        if (describeResponse.Reservations && describeResponse.Reservations.length > 0) {
            const reservation = describeResponse.Reservations[0];
            if (reservation.Instances && reservation.Instances.length > 0) {
                const instance = reservation.Instances[0];
                const currentState = instance.State?.Name;

                // Check if we can cancel the start operation
                let canCancel = false;
                let cancelReason = '';

                if (currentState === 'pending') {
                    canCancel = true;
                    cancelReason = 'Instance is still in pending state';
                } else if (currentState === 'running') {
                    // Check if the instance is still initializing (status checks not passed)
                    try {
                        const statusCommand = new DescribeInstanceStatusCommand({
                            InstanceIds: [id],
                            IncludeAllInstances: true
                        });
                        const statusResponse = await ec2Client.send(statusCommand);

                        if (statusResponse.InstanceStatuses && statusResponse.InstanceStatuses.length > 0) {
                            const instanceStatusInfo = statusResponse.InstanceStatuses[0];
                            const instanceStatus = instanceStatusInfo.InstanceStatus?.Status;
                            const systemStatus = instanceStatusInfo.SystemStatus?.Status;

                            // If status checks are not "ok", the instance is still initializing
                            if (instanceStatus !== 'ok' || systemStatus !== 'ok') {
                                canCancel = true;
                                cancelReason = 'Instance is running but still initializing (status checks not passed)';
                            } else {
                                cancelReason = 'Instance is fully running and ready';
                            }
                        } else {
                            // If we can't get status, assume it's still initializing
                            canCancel = true;
                            cancelReason = 'Instance is running but status is unknown (assuming still initializing)';
                        }
                    } catch (statusError) {
                        console.warn(`Could not get status for instance ${id}:`, statusError);
                        // If we can't check status, allow cancellation for running instances
                        canCancel = true;
                        cancelReason = 'Instance is running but status check failed (allowing cancellation)';
                    }
                }

                if (canCancel) {
                    // Instance can be stopped, proceed with cancellation
                    const stopCommand = new StopInstancesCommand({
                        InstanceIds: [id]
                    });

                    const response = await ec2Client.send(stopCommand);

                    if (response.StoppingInstances && response.StoppingInstances.length > 0) {
                        const stopInstance = response.StoppingInstances[0];
                        const state = stopInstance.CurrentState?.Name;

                        console.log(`Start operation canceled for instance ${id}. Reason: ${cancelReason}. New state: ${state}`);

                        // Revalidate the applications page to show updated data
                        revalidatePath('/applications');

                        return {
                            success: true,
                            message: `Start operation canceled successfully. ${cancelReason}. Current state: ${getReadableState(state || 'unknown')}`,
                            newState: state
                        };
                    }
                } else {
                    // Instance cannot be canceled
                    return {
                        success: false,
                        message: `Cannot cancel start operation: ${cancelReason}. Current state: ${getReadableState(currentState || 'unknown')}`
                    };
                }
            }
        }

        throw new Error('Instance not found');
    } catch (error) {
        console.error('Error canceling start operation:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to cancel start operation'
        };
    }
}

// Get instance details by ID
export async function getInstanceDetails(id: string): Promise<Application | null> {
    try {
        const command = new DescribeInstancesCommand({
            InstanceIds: [id]
        });

        const response = await ec2Client.send(command);

        if (response.Reservations && response.Reservations.length > 0) {
            const reservation = response.Reservations[0];
            if (reservation.Instances && reservation.Instances.length > 0) {
                const instance = reservation.Instances[0];

                if (instance.InstanceId && instance.State?.Name) {
                    const nameTag = instance.Tags?.find(tag => tag.Key === 'Name');
                    const name = nameTag?.Value || `Instance ${instance.InstanceId}`;

                    const descriptionTag = instance.Tags?.find(tag => tag.Key === 'Description');
                    const description = descriptionTag?.Value || `${instance.InstanceType || 'Unknown'} instance`;

                    const tags: { [key: string]: string } = {};
                    instance.Tags?.forEach(tag => {
                        if (tag.Key && tag.Value) {
                            tags[tag.Key] = tag.Value;
                        }
                    });

                    // Determine status based on instance state and status checks
                    let status: Application['status'] = 'inactive';
                    let instanceStatus = 'unknown';

                    if (instance.State.Name === 'running') {
                        // Check if the instance is actually ready by looking at status checks
                        try {
                            const statusCommand = new DescribeInstanceStatusCommand({
                                InstanceIds: [instance.InstanceId],
                                IncludeAllInstances: true
                            });
                            const statusResponse = await ec2Client.send(statusCommand);

                            if (statusResponse.InstanceStatuses && statusResponse.InstanceStatuses.length > 0) {
                                const instanceStatusInfo = statusResponse.InstanceStatuses[0];
                                instanceStatus = instanceStatusInfo.InstanceStatus?.Status || 'unknown';

                                // If instance is running but status checks are not passed, it's still initializing
                                if (instanceStatusInfo.InstanceStatus?.Status === 'ok' &&
                                    instanceStatusInfo.SystemStatus?.Status === 'ok') {
                                    status = 'active';
                                } else {
                                    status = 'initializing';
                                }
                            } else {
                                // If we can't get status, assume it's initializing
                                status = 'initializing';
                            }
                        } catch (statusError) {
                            console.warn(`Could not get status for instance ${instance.InstanceId}:`, statusError);
                            status = 'initializing';
                        }
                    } else if (instance.State.Name === 'pending') {
                        status = 'pending';
                    } else if (instance.State.Name === 'stopping') {
                        status = 'stopping';
                    }

                    return {
                        id: instance.InstanceId,
                        name,
                        status,
                        description,
                        lastUpdated: new Date().toISOString(),
                        instanceType: instance.InstanceType,
                        publicIp: instance.PublicIpAddress,
                        privateIp: instance.PrivateIpAddress,
                        launchTime: instance.LaunchTime?.toISOString(),
                        tags,
                        currentState: instance.State.Name,
                        instanceStatus
                    };
                }
            }
        }

        return null;
    } catch (error) {
        console.error('Error fetching instance details:', error);
        throw new Error('Failed to fetch instance details');
    }
} 