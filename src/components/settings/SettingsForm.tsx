'use client';

import { saveSettingsAction, updateSettingsAction } from '@/app/actions/settings';
import { useModal } from '@/contexts/ModalContext';
import type { Settings } from '@/lib/dynamodb-config';
import { validatePassword } from '@/lib/password-utils';
import { validateEC2Secret, validateSettingsForm, validateUsername } from '@/lib/validation-utils';
import { useEffect, useState } from 'react';
import EC2SecretManagementModal from './EC2SecretManagementModal';

interface SettingsFormProps {
    initialSettings?: Settings | null;
}

type SecretModalMode = 'enable' | 'update' | 'disable' | null;

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
    const { showSuccess, showError } = useModal();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [secretModalMode, setSecretModalMode] = useState<SecretModalMode>(null);
    const [settings, setSettings] = useState({
        username: '',
        password: '',
        ec2Secret: '',
        ec2SecretEnabled: false,
    });

    // Validation states
    const [usernameValidation, setUsernameValidation] = useState<{ isValid: boolean; errors: string[] }>({ isValid: true, errors: [] });
    const [passwordValidation, setPasswordValidation] = useState<{ isValid: boolean; errors: string[] }>({ isValid: true, errors: [] });
    const [ec2SecretValidation, setEc2SecretValidation] = useState<{ isValid: boolean; errors: string[] }>({ isValid: true, errors: [] });

    useEffect(() => {
        if (initialSettings) {
            setSettings({
                username: initialSettings.username || '',
                password: '', // Don't show hashed password
                ec2Secret: initialSettings.ec2Secret || '',
                ec2SecretEnabled: initialSettings.ec2SecretEnabled || false,
            });
        }
    }, [initialSettings]);

    const handleUsernameChange = (username: string) => {
        setSettings(prev => ({ ...prev, username }));

        // Validate username if it's not empty
        if (username) {
            const validation = validateUsername(username);
            setUsernameValidation(validation);
        } else {
            setUsernameValidation({ isValid: true, errors: [] });
        }
    };

    const handlePasswordChange = (password: string) => {
        setSettings(prev => ({ ...prev, password }));

        // Validate password if it's not empty
        if (password) {
            const validation = validatePassword(password);
            setPasswordValidation(validation);
        } else {
            setPasswordValidation({ isValid: true, errors: [] });
        }
    };

    const handleEC2SecretChange = (secret: string) => {
        setSettings(prev => ({ ...prev, ec2Secret: secret }));

        // Validate EC2 secret if it's not empty
        if (secret) {
            const validation = validateEC2Secret(secret);
            setEc2SecretValidation(validation);
        } else {
            setEc2SecretValidation({ isValid: true, errors: [] });
        }
    };

    const handleSecretSave = async (secret: string, enabled: boolean) => {
        setSettings(prev => ({
            ...prev,
            ec2Secret: secret,
            ec2SecretEnabled: enabled,
        }));

        // Validate EC2 secret if enabled
        if (enabled && secret) {
            const validation = validateEC2Secret(secret);
            if (!validation.isValid) {
                showError('Validation Error', `EC2 secret validation failed: ${validation.errors.join(', ')}`);
                return;
            }
        }

        // Save to database
        const formData = new FormData();
        if (initialSettings) {
            formData.append('id', initialSettings.id);
        }
        formData.append('username', settings.username);
        formData.append('password', ''); // Don't change password
        formData.append('ec2Secret', secret);
        formData.append('ec2SecretEnabled', enabled.toString());

        const result = initialSettings
            ? await updateSettingsAction(formData)
            : await saveSettingsAction(formData);

        if (result.success) {
            showSuccess('EC2 Secret Updated', 'EC2 secret protection settings saved successfully');
        } else {
            showError('Save Failed', result.message);
        }
        setSecretModalMode(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate all fields before submission
        const formValidation = validateSettingsForm({
            username: settings.username,
            password: settings.password,
            ec2Secret: settings.ec2Secret,
            ec2SecretEnabled: settings.ec2SecretEnabled
        });

        if (!formValidation.isValid) {
            showError('Validation Error', `Please fix the following errors: ${formValidation.errors.join(', ')}`);
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            if (initialSettings) {
                formData.append('id', initialSettings.id);
            }
            formData.append('username', settings.username);
            formData.append('password', settings.password);
            formData.append('ec2Secret', settings.ec2Secret);
            formData.append('ec2SecretEnabled', settings.ec2SecretEnabled.toString());

            const result = initialSettings
                ? await updateSettingsAction(formData)
                : await saveSettingsAction(formData);

            if (result.success) {
                showSuccess('Settings Saved', result.message);
                // Clear password field after successful save
                setSettings(prev => ({ ...prev, password: '' }));
                setPasswordValidation({ isValid: true, errors: [] });
            } else {
                showError('Save Failed', result.message);
            }
        } catch (error) {
            showError('Error', 'An unexpected error occurred while saving settings');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getInputClasses = (field: 'username' | 'password' | 'ec2Secret') => {
        const validation = field === 'username' ? usernameValidation :
            field === 'password' ? passwordValidation :
                ec2SecretValidation;

        return `
            mt-1 block w-full px-4 py-3 rounded-lg border transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${validation.errors.length > 0 && settings[field]
                ? 'border-red-300 bg-red-50 focus:ring-red-500'
                : 'border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500'
            }
            placeholder-gray-400 text-gray-900
        `;
    };

    const getLabelClasses = (field: 'username' | 'password' | 'ec2Secret') => {
        const validation = field === 'username' ? usernameValidation :
            field === 'password' ? passwordValidation :
                ec2SecretValidation;

        return `
            block text-sm font-medium mb-2
            ${validation.errors.length > 0 && settings[field] ? 'text-red-600' : 'text-gray-700'}
        `;
    };

    const isFormValid = () => {
        const formValidation = validateSettingsForm({
            username: settings.username,
            password: settings.password,
            ec2Secret: settings.ec2Secret,
            ec2SecretEnabled: settings.ec2SecretEnabled
        });
        return formValidation.isValid;
    };

    // Handler for secret management button
    const handleSecretManage = () => {
        if (!settings.ec2SecretEnabled) {
            setSecretModalMode('enable');
        } else {
            setSecretModalMode('update');
        }
    };

    // Handler for disable protection
    const handleSecretDisable = () => {
        setSecretModalMode('disable');
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-6">
                {initialSettings && (
                    <input type="hidden" name="id" value={initialSettings.id} />
                )}

                <div>
                    <label htmlFor="username" className={getLabelClasses('username')}>
                        Username <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={settings.username}
                        onChange={(e) => handleUsernameChange(e.target.value)}
                        placeholder="Enter your username"
                        className={getInputClasses('username')}
                        required
                    />

                    {/* Username validation feedback */}
                    {settings.username && (
                        <div className="mt-2">
                            {usernameValidation.isValid ? (
                                <p className="text-sm text-green-600 flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Username is valid
                                </p>
                            ) : (
                                <div className="space-y-1">
                                    {usernameValidation.errors.map((error, index) => (
                                        <p key={index} className="text-sm text-red-600 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            {error}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <p className="mt-2 text-sm text-gray-500">
                        Your application username for authentication
                    </p>
                    <div className="text-xs text-gray-400 mt-1">
                        <p><strong>Username Requirements:</strong></p>
                        <ul className="list-disc list-inside space-y-0.5">
                            <li>3-50 characters long</li>
                            <li>Letters, numbers, underscores, and hyphens only</li>
                            <li>Must start with a letter</li>
                        </ul>
                    </div>
                </div>

                <div>
                    <label htmlFor="password" className={getLabelClasses('password')}>
                        Password {!initialSettings && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            value={settings.password}
                            onChange={(e) => handlePasswordChange(e.target.value)}
                            placeholder={initialSettings ? "Enter new password (leave blank to keep current)" : "Enter your password"}
                            className={`${getInputClasses('password')} pr-12`}
                            required={!initialSettings}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                            title={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? (
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

                    {/* Password validation feedback */}
                    {settings.password && (
                        <div className="mt-2">
                            {passwordValidation.isValid ? (
                                <p className="text-sm text-green-600 flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Password meets all requirements
                                </p>
                            ) : (
                                <div className="space-y-1">
                                    {passwordValidation.errors.map((error, index) => (
                                        <p key={index} className="text-sm text-red-600 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            {error}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-2">
                        <p className="text-sm text-gray-500 mb-2">
                            {initialSettings ? "Leave blank to keep current password" : "Your application password for authentication"}
                        </p>
                        <div className="text-xs text-gray-400 space-y-1">
                            <p><strong>Password Requirements:</strong></p>
                            <ul className="list-disc list-inside space-y-0.5">
                                <li>At least 8 characters long</li>
                                <li>Contains at least one uppercase letter</li>
                                <li>Contains at least one lowercase letter</li>
                                <li>Contains at least one number</li>
                                <li>Contains at least one special character (!@#$%^&*)</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-medium text-gray-700">
                            EC2 Secret Protection
                        </label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleSecretManage}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer"
                            >
                                {settings.ec2SecretEnabled ? (
                                    <>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        </svg>
                                        Update Secret
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        </svg>
                                        Enable Secret
                                    </>
                                )}
                            </button>
                            {settings.ec2SecretEnabled && (
                                <button
                                    type="button"
                                    onClick={handleSecretDisable}
                                    className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors cursor-pointer"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Disable
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-700">
                                    Status: {settings.ec2SecretEnabled ? 'Enabled' : 'Disabled'}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {settings.ec2SecretEnabled
                                        ? 'EC2 secret protection is active. Secret required for start/stop operations.'
                                        : 'EC2 secret protection is disabled. No secret required for operations.'
                                    }
                                </p>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${settings.ec2SecretEnabled
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                                }`}>
                                {settings.ec2SecretEnabled ? 'Active' : 'Inactive'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-6">
                    <button
                        type="submit"
                        disabled={isSubmitting || !isFormValid()}
                        className="w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving Settings...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {initialSettings ? 'Update Settings' : 'Save Settings'}
                            </>
                        )}
                    </button>
                </div>
            </form>

            <EC2SecretManagementModal
                isOpen={!!secretModalMode}
                onClose={() => setSecretModalMode(null)}
                onSave={handleSecretSave}
                currentSecret={settings.ec2Secret}
                isEnabled={settings.ec2SecretEnabled}
                mode={secretModalMode as any}
            />
        </>
    );
} 