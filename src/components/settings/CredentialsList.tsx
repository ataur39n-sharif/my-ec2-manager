'use client';

import { deleteCredentialsAction, getAllCredentialsAction, updateCredentialsAction } from '@/app/actions/settings';
import { useModal } from '@/contexts/ModalContext';
import type { AWSCredentials } from '@/lib/dynamodb-config';
import { useState } from 'react';
import { CredentialsFormModal } from './CredentialsForm';

interface CredentialsListProps {
    initialCredentials: AWSCredentials[];
}

// Delete Confirmation Modal Component
function DeleteConfirmationModal({
    credentialName,
    onConfirm,
    onCancel
}: {
    credentialName: string;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    const [deleteText, setDeleteText] = useState('');
    const isDeleteEnabled = deleteText.toLowerCase() === 'delete';

    return (
        <div className="space-y-4">
            <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Delete Credentials
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                    Are you sure you want to delete the credentials for profile <strong>"{credentialName}"</strong>?
                    This action cannot be undone.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                    To confirm deletion, please type <strong>"delete"</strong> in the field below:
                </p>
            </div>

            <div>
                <input
                    type="text"
                    value={deleteText}
                    onChange={(e) => setDeleteText(e.target.value)}
                    placeholder="Type 'delete' to confirm"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    disabled={!isDeleteEnabled}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Delete Credentials
                </button>
            </div>
        </div>
    );
}

export default function CredentialsList({ initialCredentials }: CredentialsListProps) {
    const { showSuccess, showError, showContentModal, showConfirmationModal, hideModal } = useModal();
    const [credentials, setCredentials] = useState(initialCredentials);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const refreshCredentials = async () => {
        setIsRefreshing(true);
        try {
            const result = await getAllCredentialsAction();
            if (result.success) {
                setCredentials(result.data || []);
            } else {
                showError('Refresh Failed', result.message);
            }
        } catch (error) {
            showError('Error', 'An unexpected error occurred while refreshing credentials');
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleAddNewCredential = () => {
        showContentModal(
            'Add New AWS Credentials',
            <CredentialsFormModal onSuccess={() => {
                hideModal();
                refreshCredentials();
            }} />,
            'xl'
        );
    };

    const handleDelete = async (id: string, credentialName: string) => {
        showContentModal(
            'Delete Credentials',
            <DeleteConfirmationModal
                credentialName={credentialName}
                onConfirm={async () => {
                    hideModal();
                    setIsDeleting(id);

                    try {
                        const formData = new FormData();
                        formData.append('id', id);

                        const result = await deleteCredentialsAction(formData);

                        if (result.success) {
                            showSuccess('Credentials Deleted', result.message);
                            setCredentials(prev => prev.filter(cred => cred.id !== id));
                        } else {
                            showError('Delete Failed', result.message);
                        }
                    } catch (error) {
                        showError('Error', 'An unexpected error occurred while deleting credentials');
                    } finally {
                        setIsDeleting(null);
                    }
                }}
                onCancel={() => hideModal()}
            />,
            'md'
        );
    };

    const handleToggleActive = async (credential: AWSCredentials) => {
        const action = credential.isActive ? 'deactivate' : 'activate';
        const actionText = credential.isActive ? 'Deactivate' : 'Activate';

        showConfirmationModal(
            `${actionText} Credentials`,
            `Are you sure you want to ${action} the credentials for profile "${credential.profileName || 'default'}"?`,
            async () => {
                try {
                    const formData = new FormData();
                    formData.append('id', credential.id);
                    formData.append('isActive', (!credential.isActive).toString());

                    const result = await updateCredentialsAction(formData);

                    if (result.success) {
                        showSuccess('Status Updated', result.message);
                        setCredentials(prev => prev.map(cred =>
                            cred.id === credential.id
                                ? { ...cred, isActive: !cred.isActive }
                                : cred
                        ));
                    } else {
                        showError('Update Failed', result.message);
                    }
                } catch (error) {
                    showError('Error', 'An unexpected error occurred while updating credentials');
                }
            },
            actionText,
            'Cancel'
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const maskAccessKey = (accessKey: string) => {
        if (accessKey.length <= 8) return '••••••••';
        return accessKey.substring(0, 4) + '••••' + accessKey.substring(accessKey.length - 4);
    };

    return (
        <div className="space-y-6">
            {/* Header with Add New button */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">Saved Credentials</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage your stored AWS credential profiles
                    </p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={refreshCredentials}
                        disabled={isRefreshing}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isRefreshing ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Refreshing...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleAddNewCredential}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02] cursor-pointer"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add New Credential
                    </button>
                </div>
            </div>

            {/* Credentials List */}
            {credentials.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">🔐</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Credentials Found</h3>
                    <p className="text-gray-500 mb-6">
                        Get started by adding your first AWS credentials.
                    </p>
                    <button
                        onClick={handleAddNewCredential}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02] cursor-pointer"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Your First Credential
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {credentials.map((credential) => (
                        <div key={credential.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <h4 className="text-sm font-medium text-gray-900">
                                            Profile: {credential.profileName || 'default'}
                                        </h4>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${credential.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {credential.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                        <div>
                                            <span className="font-medium">Access Key:</span> {maskAccessKey(credential.accessKeyId)}
                                        </div>
                                        <div>
                                            <span className="font-medium">Region:</span> {credential.region}
                                        </div>
                                        <div>
                                            <span className="font-medium">Created:</span> {formatDate(credential.createdAt)}
                                        </div>
                                        <div>
                                            <span className="font-medium">Updated:</span> {formatDate(credential.updatedAt)}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 ml-4">
                                    <button
                                        onClick={() => handleToggleActive(credential)}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${credential.isActive
                                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                                            }`}
                                    >
                                        {credential.isActive ? 'Deactivate' : 'Activate'}
                                    </button>

                                    <button
                                        onClick={() => handleDelete(credential.id, credential.profileName || 'default')}
                                        disabled={isDeleting === credential.id}
                                        className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isDeleting === credential.id ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 