'use client';

import { saveCredentialsAction } from '@/app/actions/settings';
import { useModal } from '@/contexts/ModalContext';
import { useState } from 'react';

interface CredentialsFormModalProps {
    onSuccess?: () => void;
}

export function CredentialsFormModal({ onSuccess }: CredentialsFormModalProps) {
    const { showSuccess, showError } = useModal();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSecret, setShowSecret] = useState(false);
    const [formData, setFormData] = useState({
        profileName: '',
        accessKeyId: '',
        secretAccessKey: '',
        region: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.accessKeyId.trim()) {
            newErrors.accessKeyId = 'Access Key ID is required';
        } else if (!formData.accessKeyId.startsWith('AKIA')) {
            newErrors.accessKeyId = 'Access Key ID should start with AKIA';
        }

        if (!formData.secretAccessKey.trim()) {
            newErrors.secretAccessKey = 'Secret Access Key is required';
        } else if (formData.secretAccessKey.length < 20) {
            newErrors.secretAccessKey = 'Secret Access Key should be at least 20 characters';
        }

        if (!formData.region) {
            newErrors.region = 'Please select a region';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const formDataObj = new FormData();
            formDataObj.append('profileName', formData.profileName);
            formDataObj.append('accessKeyId', formData.accessKeyId);
            formDataObj.append('secretAccessKey', formData.secretAccessKey);
            formDataObj.append('region', formData.region);

            const result = await saveCredentialsAction(formDataObj);

            if (result.success) {
                showSuccess('Credentials Saved', result.message);
                // Reset form
                setFormData({
                    profileName: '',
                    accessKeyId: '',
                    secretAccessKey: '',
                    region: ''
                });
                setErrors({});
                // Call onSuccess callback if provided
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                showError('Save Failed', result.message);
            }
        } catch (error) {
            showError('Error', 'An unexpected error occurred while saving credentials');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClasses = (field: string) => `
        mt-1 block w-full px-4 py-3 rounded-lg border transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        ${errors[field]
            ? 'border-red-300 bg-red-50 focus:ring-red-500'
            : 'border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500'
        }
        placeholder-gray-400 text-gray-900
    `;

    const labelClasses = (field: string) => `
        block text-sm font-medium mb-2
        ${errors[field] ? 'text-red-600' : 'text-gray-700'}
    `;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="modal-profileName" className={labelClasses('profileName')}>
                    Profile Name
                </label>
                <input
                    type="text"
                    id="modal-profileName"
                    value={formData.profileName}
                    onChange={(e) => handleInputChange('profileName', e.target.value)}
                    placeholder="e.g., production, development, staging"
                    className={inputClasses('profileName')}
                />
                <p className="mt-2 text-sm text-gray-500">
                    Optional. Leave empty for default profile. Use descriptive names like "production" or "development".
                </p>
            </div>

            <div>
                <label htmlFor="modal-accessKeyId" className={labelClasses('accessKeyId')}>
                    Access Key ID *
                </label>
                <input
                    type="text"
                    id="modal-accessKeyId"
                    value={formData.accessKeyId}
                    onChange={(e) => handleInputChange('accessKeyId', e.target.value)}
                    placeholder="AKIAIOSFODNN7EXAMPLE"
                    className={inputClasses('accessKeyId')}
                    maxLength={20}
                />
                {errors.accessKeyId && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.accessKeyId}
                    </p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                    Your AWS Access Key ID (20 characters, starts with AKIA)
                </p>
            </div>

            <div>
                <label htmlFor="modal-secretAccessKey" className={labelClasses('secretAccessKey')}>
                    Secret Access Key *
                </label>
                <div className="relative">
                    <input
                        type={showSecret ? 'text' : 'password'}
                        id="modal-secretAccessKey"
                        value={formData.secretAccessKey}
                        onChange={(e) => handleInputChange('secretAccessKey', e.target.value)}
                        placeholder="••••••••••••••••••••••••••••••••••••••••"
                        className={`${inputClasses('secretAccessKey')} pr-12`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowSecret(!showSecret)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                        title={showSecret ? 'Hide secret key' : 'Show secret key'}
                    >
                        {showSecret ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        )}
                    </button>
                </div>
                {errors.secretAccessKey && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.secretAccessKey}
                    </p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                    Your AWS Secret Access Key (40 characters)
                </p>
            </div>

            <div>
                <label htmlFor="modal-region" className={labelClasses('region')}>
                    AWS Region *
                </label>
                <select
                    id="modal-region"
                    value={formData.region}
                    onChange={(e) => handleInputChange('region', e.target.value)}
                    className={inputClasses('region')}
                >
                    <option value="">Select a region</option>
                    <optgroup label="US East">
                        <option value="us-east-1">US East (N. Virginia) - us-east-1</option>
                        <option value="us-east-2">US East (Ohio) - us-east-2</option>
                    </optgroup>
                    <optgroup label="US West">
                        <option value="us-west-1">US West (N. California) - us-west-1</option>
                        <option value="us-west-2">US West (Oregon) - us-west-2</option>
                    </optgroup>
                    <optgroup label="Europe">
                        <option value="eu-west-1">Europe (Ireland) - eu-west-1</option>
                        <option value="eu-west-2">Europe (London) - eu-west-2</option>
                        <option value="eu-central-1">Europe (Frankfurt) - eu-central-1</option>
                        <option value="eu-west-3">Europe (Paris) - eu-west-3</option>
                        <option value="eu-south-1">Europe (Milan) - eu-south-1</option>
                        <option value="eu-north-1">Europe (Stockholm) - eu-north-1</option>
                    </optgroup>
                    <optgroup label="Asia Pacific">
                        <option value="ap-southeast-1">Asia Pacific (Singapore) - ap-southeast-1</option>
                        <option value="ap-southeast-2">Asia Pacific (Sydney) - ap-southeast-2</option>
                        <option value="ap-northeast-1">Asia Pacific (Tokyo) - ap-northeast-1</option>
                        <option value="ap-northeast-2">Asia Pacific (Seoul) - ap-northeast-2</option>
                        <option value="ap-south-1">Asia Pacific (Mumbai) - ap-south-1</option>
                        <option value="ap-east-1">Asia Pacific (Hong Kong) - ap-east-1</option>
                    </optgroup>
                    <optgroup label="Other Regions">
                        <option value="ca-central-1">Canada (Central) - ca-central-1</option>
                        <option value="af-south-1">Africa (Cape Town) - af-south-1</option>
                        <option value="me-south-1">Middle East (Bahrain) - me-south-1</option>
                        <option value="sa-east-1">South America (São Paulo) - sa-east-1</option>
                    </optgroup>
                </select>
                {errors.region && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.region}
                    </p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                    Choose the AWS region where your resources are located
                </p>
            </div>

            <div className="pt-6 flex space-x-3">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                >
                    {isSubmitting ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving Credentials...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Save Credentials
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}

// Legacy component for backward compatibility
export default function CredentialsForm() {
    return <CredentialsFormModal />;
} 