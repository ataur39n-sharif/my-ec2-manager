'use client';

import { useModal } from '@/contexts/ModalContext';
import { useState } from 'react';
import SecretInput from './settings/SecretInput';

interface EC2SecretModalProps {
    isOpen: boolean;
    onClose: () => void;
    onVerify: (secret: string) => void;
    operation: 'start' | 'stop';
    instanceId: string;
}

export default function EC2SecretModal({
    isOpen,
    onClose,
    onVerify,
    operation,
    instanceId
}: EC2SecretModalProps) {
    const [secret, setSecret] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const { showError } = useModal();

    const handleVerify = async () => {
        if (secret.length !== 6) {
            showError('Invalid Secret', 'EC2 secret must be exactly 6 characters long');
            return;
        }

        setIsVerifying(true);
        try {
            await onVerify(secret);
            setSecret('');
        } catch (error) {
            // Error handling is done by the parent component
        } finally {
            setIsVerifying(false);
        }
    };

    const handleClose = () => {
        setSecret('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        EC2 Secret Required
                    </h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                        disabled={isVerifying}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="text-center">
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-3">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Security Required
                        </div>
                        <p className="text-gray-600">
                            To {operation} instance <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{instanceId}</span>,
                            please enter your 6-character EC2 secret.
                        </p>
                    </div>

                    <SecretInput
                        value={secret}
                        onChange={setSecret}
                        disabled={isVerifying}
                        placeholder="Enter your 6-character EC2 secret"
                    />

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isVerifying}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleVerify}
                            disabled={isVerifying || secret.length !== 6}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                        >
                            {isVerifying ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {operation === 'start' ? 'Start Instance' : 'Stop Instance'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 