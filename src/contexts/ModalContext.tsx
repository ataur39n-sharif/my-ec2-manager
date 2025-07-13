'use client';

import Modal from '@/components/Modal';
import { createContext, ReactNode, useCallback, useContext, useState } from 'react';

interface ModalState {
    isOpen: boolean;
    title: string;
    message: string;
    type: 'error' | 'success' | 'info' | 'warning';
    showCloseButton: boolean;
    autoClose: boolean;
    autoCloseDelay: number;
}

interface ModalContextType {
    showModal: (config: Omit<ModalState, 'isOpen'>) => void;
    hideModal: () => void;
    showError: (title: string, message: string) => void;
    showSuccess: (title: string, message: string) => void;
    showInfo: (title: string, message: string) => void;
    showWarning: (title: string, message: string) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
    const [modalState, setModalState] = useState<ModalState>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        showCloseButton: true,
        autoClose: true,
        autoCloseDelay: 5000
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
            autoCloseDelay: 5000
        });
    }, [showModal]);

    const showSuccess = useCallback((title: string, message: string) => {
        showModal({
            title,
            message,
            type: 'success',
            showCloseButton: true,
            autoClose: true,
            autoCloseDelay: 5000
        });
    }, [showModal]);

    const showInfo = useCallback((title: string, message: string) => {
        showModal({
            title,
            message,
            type: 'info',
            showCloseButton: true,
            autoClose: true,
            autoCloseDelay: 5000
        });
    }, [showModal]);

    const showWarning = useCallback((title: string, message: string) => {
        showModal({
            title,
            message,
            type: 'warning',
            showCloseButton: true,
            autoClose: true,
            autoCloseDelay: 5000
        });
    }, [showModal]);

    const value = {
        showModal,
        hideModal,
        showError,
        showSuccess,
        showInfo,
        showWarning
    };

    return (
        <ModalContext.Provider value={value}>
            {children}
            <Modal
                isOpen={modalState.isOpen}
                onClose={hideModal}
                title={modalState.title}
                message={modalState.message}
                type={modalState.type}
                showCloseButton={modalState.showCloseButton}
                autoClose={modalState.autoClose}
                autoCloseDelay={modalState.autoCloseDelay}
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