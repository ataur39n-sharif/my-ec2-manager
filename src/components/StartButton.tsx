'use client';

import { startApplication } from '@/app/actions/applications';
import { useModal } from '@/contexts/ModalContext';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

interface StartButtonProps {
    instanceId: string;
    instanceName: string;
}

export default function StartButton({ instanceId, instanceName }: StartButtonProps) {
    const router = useRouter();
    const { showSuccess, showError, showInfo } = useModal();
    const [isStarting, setIsStarting] = useState(false);

    const handleStart = useCallback(async () => {
        setIsStarting(true);

        try {
            const result = await startApplication(instanceId);

            if (result.success) {
                showSuccess(
                    'Instance Starting',
                    `Instance "${instanceName}" is now starting. This may take a few minutes to complete.`
                );
                // Refresh the page to show updated status
                setTimeout(() => {
                    router.refresh();
                }, 1000);
            } else {
                showError(
                    'Start Failed',
                    `Failed to start instance: ${result.message}`
                );
            }
        } catch (error) {
            showError(
                'Error Occurred',
                'An unexpected error occurred while starting the instance. Please try again.'
            );
        } finally {
            setIsStarting(false);
        }
    }, [instanceId, instanceName, router, showSuccess, showError, showInfo]);

    return (
        <button
            onClick={handleStart}
            disabled={isStarting}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isStarting ? (
                <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Starting...
                </>
            ) : (
                'Start Now'
            )}
        </button>
    );
} 