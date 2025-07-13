'use client';

import Modal from '@/components/Modal';
import { createContext, ReactNode, useCallback, useContext, useState } from 'react';

interface ModalState {
    isOpen: boolean;
    title: string;
    message?: string;
    children?: ReactNode;
    type: 'error' | 'success' | 'info' | 'warning' | 'confirmation';
    showCloseButton: boolean;
    autoClose: boolean;
    autoCloseDelay: number;
    size: 'sm' | 'md' | 'lg' | 'xl';
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
    showCancelButton?: boolean;
}

interface ModalContextType {
    showModal: (config: Omit<ModalState, 'isOpen'>) => void;
    hideModal: () => void;
    showError: (title: string, message: string) => void;
    showSuccess: (title: string, message: string) => void;
    showInfo: (title: string, message: string) => void;
    showWarning: (title: string, message: string) => void;
    showContentModal: (title: string, children: ReactNode, size?: 'sm' | 'md' | 'lg' | 'xl') => void;
    showConfirmationModal: (title: string, message: string, onConfirm: () => void, confirmText?: string, cancelText?: string) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
    const [modalState, setModalState] = useState<ModalState>({
        isOpen: false,
        title: '',
        message: '',
        children: undefined,
        type: 'info',
        showCloseButton: true,
        autoClose: true,
        autoCloseDelay: 5000,
        size: 'md',
        onConfirm: undefined,
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        showCancelButton: false
    });

    const showModal = useCallback((config: Omit<ModalState, 'isOpen'>) => {
        setModalState({
            ...config,
            isOpen: true
        });
    }, []);

    const hideModal = useCallback(() => {
        setModalState(prev => ({
            ...prev,
            isOpen: false
        }));
    }, []);

    const showError = useCallback((title: string, message: string) => {
        showModal({
            title,
            message,
            type: 'error',
            showCloseButton: true,
            autoClose: true,
            autoCloseDelay: 5000,
            size: 'md'
        });
    }, [showModal]);

    const showSuccess = useCallback((title: string, message: string) => {
        showModal({
            title,
            message,
            type: 'success',
            showCloseButton: true,
            autoClose: true,
            autoCloseDelay: 5000,
            size: 'md'
        });
    }, [showModal]);

    const showInfo = useCallback((title: string, message: string) => {
        showModal({
            title,
            message,
            type: 'info',
            showCloseButton: true,
            autoClose: true,
            autoCloseDelay: 5000,
            size: 'md'
        });
    }, [showModal]);

    const showWarning = useCallback((title: string, message: string) => {
        showModal({
            title,
            message,
            type: 'warning',
            showCloseButton: true,
            autoClose: true,
            autoCloseDelay: 5000,
            size: 'md'
        });
    }, [showModal]);

    const showContentModal = useCallback((title: string, children: ReactNode, size: 'sm' | 'md' | 'lg' | 'xl' = 'md') => {
        showModal({
            title,
            children,
            type: 'info',
            showCloseButton: true,
            autoClose: false,
            autoCloseDelay: 5000,
            size
        });
    }, [showModal]);

    const showConfirmationModal = useCallback((title: string, message: string, onConfirm: () => void, confirmText: string = 'Confirm', cancelText: string = 'Cancel') => {
        showModal({
            title,
            message,
            type: 'confirmation',
            showCloseButton: false,
            autoClose: false,
            autoCloseDelay: 5000,
            size: 'md',
            onConfirm,
            confirmText,
            cancelText,
            showCancelButton: true
        });
    }, [showModal]);

    const value = {
        showModal,
        hideModal,
        showError,
        showSuccess,
        showInfo,
        showWarning,
        showContentModal,
        showConfirmationModal
    };

    return (
        <ModalContext.Provider value={value}>
            {children}
            <Modal
                isOpen={modalState.isOpen}
                onClose={hideModal}
                title={modalState.title}
                message={modalState.message}
                children={modalState.children}
                type={modalState.type}
                showCloseButton={modalState.showCloseButton}
                autoClose={modalState.autoClose}
                autoCloseDelay={modalState.autoCloseDelay}
                size={modalState.size}
                onConfirm={modalState.onConfirm}
                confirmText={modalState.confirmText}
                cancelText={modalState.cancelText}
                showCancelButton={modalState.showCancelButton}
            />
        </ModalContext.Provider>
    );
}

export function useModal() {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
} 