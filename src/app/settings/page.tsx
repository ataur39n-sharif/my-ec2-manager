import {
    getAllCredentialsAction,
    getSettingsAction,
    testDynamoDBConnectionAction
} from '@/app/actions/settings';
import Navigation from '@/components/Navigation';
import CredentialsList from '@/components/settings/CredentialsList';
import SettingsForm from '@/components/settings/SettingsForm';

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
            <Navigation />

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
                                <h3 className="text-lg font-medium text-gray-900">Account Settings</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Configure your username and password for authentication
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