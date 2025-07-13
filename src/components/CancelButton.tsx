'use client';

import { cancelStartOperation } from '@/app/actions/applications';
import { useModal } from '@/contexts/ModalContext';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

interface CancelButtonProps {
    instanceId: string;
    instanceName: string;
}

export default function CancelButton({ instanceId, instanceName }: CancelButtonProps) {
    const router = useRouter();
    const { showSuccess, showError } = useModal();
    const [isCanceling, setIsCanceling] = useState(false);

    const handleCancel = useCallback(async () => {
        setIsCanceling(true);

        try {
            const result = await cancelStartOperation(instanceId);

            if (result.success) {
                showSuccess(
                    'Operation Canceled',
                    result.message || `Start operation for "${instanceName}" has been canceled successfully.`
                );
                // Refresh the page to show updated status
                setTimeout(() => {
                    router.refresh();
                }, 1000);
            } else {
                showError(
                    'Cancel Failed',
                    result.message || `Failed to cancel start operation for "${instanceName}".`
                );
            }
        } catch (error) {
            showError(
                'Error Occurred',
                'An unexpected error occurred while canceling the operation. Please try again.'
            );
        } finally {
            setIsCanceling(false);
        }
    }, [instanceId, instanceName, router, showSuccess, showError]);

    return (
        <button
            onClick={handleCancel}
            disabled={isCanceling}
            className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md shadow-sm text-xs font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={`Cancel start operation for ${instanceName}`}
        >
            {isCanceling ? (
                <>
                    <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Canceling...
                </>
            ) : (
                'Cancel'
            )}
        </button>
    );
} 