'use client';

import { stopApplication } from '@/app/actions/applications';
import { useModal } from '@/contexts/ModalContext';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

interface StopButtonProps {
    instanceId: string;
    instanceName: string;
}

export default function StopButton({ instanceId, instanceName }: StopButtonProps) {
    const router = useRouter();
    const { showSuccess, showError, showWarning } = useModal();
    const [isStopping, setIsStopping] = useState(false);

    const handleStop = useCallback(async () => {
        setIsStopping(true);

        try {
            const result = await stopApplication(instanceId);

            if (result.success) {
                showSuccess(
                    'Instance Stopping',
                    `Instance "${instanceName}" is now stopping. This may take a few minutes to complete.`
                );
                // Refresh the page to show updated status
                setTimeout(() => {
                    router.refresh();
                }, 1000);
            } else {
                showError(
                    'Stop Failed',
                    `Failed to stop instance: ${result.message}`
                );
            }
        } catch (error) {
            showError(
                'Error Occurred',
                'An unexpected error occurred while stopping the instance. Please try again.'
            );
        } finally {
            setIsStopping(false);
        }
    }, [instanceId, instanceName, router, showSuccess, showError, showWarning]);

    return (
        <button
            onClick={handleStop}
            disabled={isStopping}
            className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isStopping ? (
                <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Stopping...
                </>
            ) : (
                'Stop'
            )}
        </button>
    );
} 