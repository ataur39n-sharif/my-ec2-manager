import { getApplications } from '@/app/actions/applications';
import AutoRefresh from '@/components/AutoRefresh';
import CancelButton from '@/components/CancelButton';
import StartButton from '@/components/StartButton';
import StopButton from '@/components/StopButton';
import Link from 'next/link';

export default async function ApplicationsPage() {
    // Fetch applications data from server actions
    const applications = await getApplications();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'initializing':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'stopping':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'inactive':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return '🟢';
            case 'initializing':
                return '🔵';
            case 'pending':
                return '🟡';
            case 'stopping':
                return '🟠';
            case 'inactive':
                return '🔴';
            default:
                return '⚪';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active':
                return 'Running';
            case 'initializing':
                return 'Initializing';
            case 'pending':
                return 'Starting';
            case 'stopping':
                return 'Stopping';
            case 'inactive':
                return 'Stopped';
            default:
                return 'Unknown';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <h1 className="text-2xl font-bold text-gray-900">EC2 Manager</h1>
                            </div>
                        </div>
                        <nav className="hidden md:flex space-x-8">
                            <Link
                                href="/"
                                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/applications"
                                className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
                            >
                                Applications
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">EC2 Instance Status</h2>
                            <p className="mt-2 text-gray-600">
                                Monitor and manage your AWS EC2 instances with real-time status
                            </p>
                        </div>
                        <AutoRefresh intervalSeconds={30} />
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">📊</span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Instances</p>
                                <p className="text-2xl font-semibold text-gray-900">{applications.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">🟢</span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Running</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {applications.filter(app => app.status === 'active').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">🔵</span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Initializing</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {applications.filter(app => app.status === 'initializing').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">🔴</span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Stopped</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {applications.filter(app => app.status === 'inactive').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Summary */}
                {(applications.filter(app => app.status === 'pending' || app.status === 'stopping' || app.status === 'initializing').length > 0) && (
                    <div className="mb-6">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <span className="text-yellow-400">⚠️</span>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-yellow-800">
                                        {applications.filter(app => app.status === 'pending').length} instance(s) starting,{' '}
                                        {applications.filter(app => app.status === 'stopping').length} instance(s) stopping,{' '}
                                        {applications.filter(app => app.status === 'initializing').length} instance(s) initializing
                                    </p>
                                    <p className="text-sm text-yellow-600 mt-1">
                                        These operations may take a few minutes to complete. Page will auto-refresh every 30 seconds.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Applications List */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">EC2 Instances</h2>
                    </div>

                    <div className="divide-y divide-gray-200">
                        {applications.map((app) => (
                            <div key={app.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <span className="text-xl">🚀</span>
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2">
                                                <h3 className="text-lg font-medium text-gray-900 truncate">
                                                    {app.name}
                                                </h3>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(app.status)}`}>
                                                    <span className="mr-1">{getStatusIcon(app.status)}</span>
                                                    {getStatusText(app.status)}
                                                </span>
                                                {app.currentState && app.currentState !== 'running' && app.currentState !== 'stopped' && (
                                                    <span className="text-xs text-gray-500">
                                                        ({app.currentState})
                                                    </span>
                                                )}
                                                {app.instanceStatus && app.instanceStatus !== 'ok' && app.status === 'initializing' && (
                                                    <span className="text-xs text-blue-500">
                                                        (Status: {app.instanceStatus})
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">{app.description}</p>

                                            {/* Instance Details */}
                                            <div className="mt-2 space-y-1">
                                                {app.instanceType && (
                                                    <p className="text-xs text-gray-400">
                                                        Type: <span className="font-medium text-gray-600">{app.instanceType}</span>
                                                    </p>
                                                )}
                                                {app.publicIp && (
                                                    <p className="text-xs text-gray-400">
                                                        Public IP: <span className="font-medium text-gray-600">{app.publicIp}</span>
                                                    </p>
                                                )}
                                                {app.privateIp && (
                                                    <p className="text-xs text-gray-400">
                                                        Private IP: <span className="font-medium text-gray-600">{app.privateIp}</span>
                                                    </p>
                                                )}
                                                {app.launchTime && (
                                                    <p className="text-xs text-gray-400">
                                                        Launched: <span className="font-medium text-gray-600">{formatDate(app.launchTime)}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        {app.status === 'active' ? (
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm text-green-600 font-medium">Running</span>
                                                <StopButton instanceId={app.id} instanceName={app.name} />
                                            </div>
                                        ) : app.status === 'pending' ? (
                                            <div className="flex items-center space-x-2">
                                                <div className="flex items-center">
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span className="text-sm text-yellow-600 font-medium">Starting...</span>
                                                </div>
                                                <CancelButton instanceId={app.id} instanceName={app.name} />
                                            </div>
                                        ) : app.status === 'initializing' ? (
                                            <div className="flex items-center space-x-2">
                                                <div className="flex items-center">
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span className="text-sm text-blue-600 font-medium">Initializing...</span>
                                                </div>
                                            </div>
                                        ) : app.status === 'stopping' ? (
                                            <div className="flex items-center space-x-2">
                                                <div className="flex items-center">
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-orange-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span className="text-sm text-orange-600 font-medium">Stopping...</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <StartButton instanceId={app.id} instanceName={app.name} />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
} 