import {
    getAllCredentialsAction,
    getSettingsAction,
    testDynamoDBConnectionAction
} from '@/app/actions/settings';
import CredentialsList from '@/components/settings/CredentialsList';
import SettingsForm from '@/components/settings/SettingsForm';
import Link from 'next/link';

export default async function SettingsPage() {
    // Fetch initial data
    const [credentialsResult, settingsResult, connectionResult] = await Promise.all([
        getAllCredentialsAction(),
        getSettingsAction(),
        testDynamoDBConnectionAction()
    ]);

    const credentials = credentialsResult.data || [];
    const settings = settingsResult.data;
    const isDynamoDBConnected = connectionResult.success;

    return (
        <div className="min-h-screen bg-gray-50 transition-colors duration-200">
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors cursor-pointer">
                                    EC2 Manager
                                </Link>
                            </div>
                        </div>
                        <nav className="hidden md:flex space-x-8">
                            <Link href="/applications" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">Applications</Link>
                            <Link href="/settings" className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">Settings</Link>
                        </nav>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
                    <p className="mt-2 text-gray-600">
                        Manage AWS credentials and application preferences
                    </p>
                </div>

                {/* DynamoDB Connection Status */}
                <div className="mb-8">
                    <div className={`rounded-lg p-4 border transition-colors ${isDynamoDBConnected
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                        }`}>
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <span className={isDynamoDBConnected ? 'text-green-400' : 'text-red-400'}>
                                    {isDynamoDBConnected ? '✅' : '❌'}
                                </span>
                            </div>
                            <div className="ml-3">
                                <h3 className={`text-sm font-medium ${isDynamoDBConnected
                                    ? 'text-green-800'
                                    : 'text-red-800'
                                    }`}>
                                    DynamoDB Connection Status
                                </h3>
                                <p className={`text-sm mt-1 ${isDynamoDBConnected
                                    ? 'text-green-700'
                                    : 'text-red-700'
                                    }`}>
                                    {isDynamoDBConnected
                                        ? 'Successfully connected to DynamoDB table "ec2-manager"'
                                        : 'Failed to connect to DynamoDB. Please check your AWS credentials and table configuration.'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* AWS Credentials Section - Takes 2/3 of the space */}
                    <div className="lg:col-span-2">
                        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                            <div className="p-6">
                                <CredentialsList initialCredentials={credentials} />
                            </div>
                        </div>
                    </div>

                    {/* Application Settings Section - Takes 1/3 of the space */}
                    <div>
                        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Application Settings</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Configure application username and password
                                </p>
                            </div>
                            <div className="p-6">
                                <SettingsForm initialSettings={settings} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 