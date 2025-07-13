'use client';

import { ReactNode, useEffect, useState } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message?: string;
    children?: ReactNode;
    type?: 'error' | 'success' | 'info' | 'warning' | 'confirmation';
    showCloseButton?: boolean;
    autoClose?: boolean;
    autoCloseDelay?: number;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
    showCancelButton?: boolean;
}

export default function Modal({
    isOpen,
    onClose,
    title,
    message,
    children,
    type = 'info',
    showCloseButton = true,
    autoClose = true,
    autoCloseDelay = 5000,
    size = 'md',
    onConfirm,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    showCancelButton = false
}: ModalProps) {
    const [confirmInput, setConfirmInput] = useState('');
    const [isConfirmDisabled, setIsConfirmDisabled] = useState(false);

    useEffect(() => {
        if (isOpen && autoClose && !children && type !== 'confirmation') {
            const timer = setTimeout(() => {
                onClose();
            }, autoCloseDelay);

            return () => clearTimeout(timer);
        }
    }, [isOpen, autoClose, autoCloseDelay, onClose, children, type]);

    const handleClose = () => {
        onClose();
    };

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        }
        onClose();
    };

    useEffect(() => {
        if (isOpen) {
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const getTypeStyles = () => {
        switch (type) {
            case 'error':
                return {
                    icon: '❌',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    iconColor: 'text-red-600',
                    titleColor: 'text-red-800',
                    messageColor: 'text-red-700'
                };
            case 'success':
                return {
                    icon: '✅',
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200',
                    iconColor: 'text-green-600',
                    titleColor: 'text-green-800',
                    messageColor: 'text-green-700'
                };
            case 'warning':
                return {
                    icon: '⚠️',
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-200',
                    iconColor: 'text-yellow-600',
                    titleColor: 'text-yellow-800',
                    messageColor: 'text-yellow-700'
                };
            case 'confirmation':
                return {
                    icon: '❓',
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-200',
                    iconColor: 'text-blue-600',
                    titleColor: 'text-blue-800',
                    messageColor: 'text-blue-700'
                };
            case 'info':
            default:
                return {
                    icon: 'ℹ️',
                    bgColor: 'bg-white',
                    borderColor: 'border-gray-200',
                    iconColor: 'text-blue-600',
                    titleColor: 'text-gray-900',
                    messageColor: 'text-gray-700'
                };
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'max-w-sm';
            case 'md':
                return 'max-w-md';
            case 'lg':
                return 'max-w-lg';
            case 'xl':
                return 'max-w-2xl';
            default:
                return 'max-w-md';
        }
    };

    const styles = getTypeStyles();
    const sizeClasses = getSizeClasses();

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity cursor-pointer"
                onClick={showCloseButton ? handleClose : undefined}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className={`relative w-full ${sizeClasses} transform overflow-hidden rounded-lg ${styles.bgColor} ${styles.borderColor} border shadow-xl transition-all`}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            {!children && (
                                <span className={`text-2xl ${styles.iconColor}`}>
                                    {styles.icon}
                                </span>
                            )}
                            <h3 className={`text-lg font-medium ${styles.titleColor}`}>
                                {title}
                            </h3>
                        </div>
                        {showCloseButton && (
                            <button
                                onClick={handleClose}
                                className="rounded-md p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        {children ? (
                            children
                        ) : (
                            <p className={`text-sm ${styles.messageColor}`}>
                                {message}
                            </p>
                        )}
                    </div>

                    {/* Footer - show for confirmation modals or message-based modals */}
                    {(type === 'confirmation' || (showCloseButton && !children)) && (
                        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                            {type === 'confirmation' && onConfirm && (
                                <button
                                    type="button"
                                    onClick={handleConfirm}
                                    disabled={isConfirmDisabled}
                                    className="inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-red-600 hover:bg-red-500"
                                >
                                    {confirmText}
                                </button>
                            )}
                            {type === 'confirmation' && showCancelButton && (
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto cursor-pointer"
                                >
                                    {cancelText}
                                </button>
                            )}
                            {type !== 'confirmation' && (
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto cursor-pointer ${type === 'error' ? 'bg-red-600 hover:bg-red-500' :
                                        type === 'success' ? 'bg-green-600 hover:bg-green-500' :
                                            type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-500' :
                                                'bg-blue-600 hover:bg-blue-500'
                                        }`}
                                >
                                    Close
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 