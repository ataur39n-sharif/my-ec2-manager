'use client';

import { useModal } from '@/contexts/ModalContext';
import React, { useState } from 'react'; // Added missing import for React.useEffect
import SecretInput from './SecretInput';

interface EC2SecretManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (secret: string, enabled: boolean) => void;
    currentSecret: string;
    isEnabled: boolean;
    mode: 'enable' | 'update' | 'disable'; // new prop to control modal mode
}

export default function EC2SecretManagementModal({
    isOpen,
    onClose,
    onSave,
    currentSecret,
    isEnabled,
    mode
}: EC2SecretManagementModalProps) {
    const { showError } = useModal();
    const [step, setStep] = useState<'current' | 'new'>((mode === 'update') ? 'current' : 'new');
    const [currentInput, setCurrentInput] = useState('');
    const [newSecret, setNewSecret] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Reset state when modal opens/closes or mode changes
    React.useEffect(() => {
        setStep((mode === 'update') ? 'current' : 'new');
        setCurrentInput('');
        setNewSecret('');
    }, [isOpen, mode]);

    const handleSave = async () => {
        if (mode === 'enable') {
            if (newSecret.length !== 6) {
                showError('Invalid Secret', 'EC2 secret must be exactly 6 characters long');
                return;
            }
            setIsSaving(true);
            await onSave(newSecret, true);
            setIsSaving(false);
            onClose();
        } else if (mode === 'update') {
            if (step === 'current') {
                if (currentInput !== currentSecret) {
                    showError('Invalid Secret', 'Current secret is incorrect');
                    return;
                }
                setStep('new');
                return;
            } else {
                if (newSecret.length !== 6) {
                    showError('Invalid Secret', 'EC2 secret must be exactly 6 characters long');
                    return;
                }
                setIsSaving(true);
                await onSave(newSecret, true);
                setIsSaving(false);
                onClose();
            }
        } else if (mode === 'disable') {
            if (currentInput !== currentSecret) {
                showError('Invalid Secret', 'Current secret is incorrect');
                return;
            }
            setIsSaving(true);
            await onSave('', false);
            setIsSaving(false);
            onClose();
        }
    };

    const handleClose = () => {
        setStep((mode === 'update') ? 'current' : 'new');
        setCurrentInput('');
        setNewSecret('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {mode === 'enable' && 'Enable EC2 Secret Protection'}
                        {mode === 'update' && 'Update EC2 Secret'}
                        {mode === 'disable' && 'Disable EC2 Secret Protection'}
                    </h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                        disabled={isSaving}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Enable: Only new secret input */}
                    {mode === 'enable' && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-700">Set New Secret</h4>
                            <SecretInput
                                value={newSecret}
                                onChange={setNewSecret}
                                disabled={isSaving}
                                placeholder="Enter 6-character secret for EC2 operations"
                            />
                            <div className="text-xs text-gray-400 space-y-1">
                                <p><strong>Requirements:</strong></p>
                                <ul className="list-disc list-inside space-y-0.5">
                                    <li>Exactly 6 characters long</li>
                                    <li>Required when starting or stopping EC2 instances</li>
                                    <li>Can be any combination of letters, numbers, and symbols</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Update: Step 1 - current secret, Step 2 - new secret */}
                    {mode === 'update' && step === 'current' && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-700">Enter Current Secret</h4>
                            <SecretInput
                                value={currentInput}
                                onChange={setCurrentInput}
                                disabled={isSaving}
                                placeholder="Enter your current 6-character secret"
                            />
                        </div>
                    )}
                    {mode === 'update' && step === 'new' && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-700">Set New Secret</h4>
                            <SecretInput
                                value={newSecret}
                                onChange={setNewSecret}
                                disabled={isSaving}
                                placeholder="Enter new 6-character secret for EC2 operations"
                            />
                            <div className="text-xs text-gray-400 space-y-1">
                                <p><strong>Requirements:</strong></p>
                                <ul className="list-disc list-inside space-y-0.5">
                                    <li>Exactly 6 characters long</li>
                                    <li>Required when starting or stopping EC2 instances</li>
                                    <li>Can be any combination of letters, numbers, and symbols</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Disable: Only current secret input */}
                    {mode === 'disable' && (
                        <div className="space-y-3 p-4 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <h4 className="text-sm font-medium text-red-800">Confirm Disable</h4>
                            </div>
                            <p className="text-sm text-red-700">
                                To disable EC2 secret protection, please enter your current secret to confirm.
                            </p>
                            <SecretInput
                                value={currentInput}
                                onChange={setCurrentInput}
                                disabled={isSaving}
                                placeholder="Enter current secret to confirm"
                            />
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSaving}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving || (mode === 'enable' && newSecret.length !== 6) || (mode === 'update' && ((step === 'current' && currentInput.length !== 6) || (step === 'new' && newSecret.length !== 6))) || (mode === 'disable' && currentInput.length !== 6)}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                        >
                            {isSaving ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {mode === 'enable' && 'Enable'}
                                    {mode === 'update' && (step === 'current' ? 'Next' : 'Update Secret')}
                                    {mode === 'disable' && 'Disable'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 