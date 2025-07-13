import { getApplications } from '@/app/actions/applications';
import Link from "next/link";

export default async function Home() {
  // Fetch real EC2 instance data
  const applications = await getApplications();

  // Calculate statistics
  const totalInstances = applications.length;
  const runningInstances = applications.filter(app => app.status === 'active').length;
  const stoppedInstances = applications.filter(app => app.status === 'inactive').length;
  const initializingInstances = applications.filter(app => app.status === 'initializing').length;
  const startingInstances = applications.filter(app => app.status === 'pending').length;
  const stoppingInstances = applications.filter(app => app.status === 'stopping').length;

  // Get recent instances (last 5)
  const recentInstances = applications
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, 5);

  // Get instances by type
  const instanceTypes = applications.reduce((acc, app) => {
    const type = app.instanceType || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'initializing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'stopping':
        return 'bg-orange-100 text-orange-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
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
              <Link
                href="/applications"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
              >
                Applications
              </Link>
              <Link
                href="/settings"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
              >
                Settings
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to EC2 Manager
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Monitor and manage your AWS EC2 instances and applications from a single dashboard.
            Get real-time status updates and control your infrastructure with ease.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">🚀</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Instances</p>
                <p className="text-3xl font-bold text-gray-900">{totalInstances}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">🟢</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Running</p>
                <p className="text-3xl font-bold text-gray-900">{runningInstances}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">🔴</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Stopped</p>
                <p className="text-3xl font-bold text-gray-900">{stoppedInstances}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">💰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Instance Types</p>
                <p className="text-3xl font-bold text-gray-900">{Object.keys(instanceTypes).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        {(initializingInstances > 0 || startingInstances > 0 || stoppingInstances > 0) && (
          <div className="mb-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-yellow-400">⚠️</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-800">
                    {startingInstances > 0 && `${startingInstances} instance(s) starting`}
                    {startingInstances > 0 && stoppingInstances > 0 && ', '}
                    {stoppingInstances > 0 && `${stoppingInstances} instance(s) stopping`}
                    {stoppingInstances > 0 && initializingInstances > 0 && ', '}
                    {initializingInstances > 0 && `${initializingInstances} instance(s) initializing`}
                  </p>
                  <p className="text-sm text-yellow-600 mt-1">
                    These operations may take a few minutes to complete.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link
                href="/applications"
                className="group relative bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                      <span className="text-white text-lg">📊</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      View Applications
                    </h4>
                    <p className="text-sm text-gray-500">
                      Monitor {totalInstances} instances and manage operations
                    </p>
                  </div>
                </div>
              </Link>

              <div className="group relative bg-gray-50 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">➕</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">
                      Launch Instance
                    </h4>
                    <p className="text-sm text-gray-500">
                      Create new EC2 instances (Coming Soon)
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href="/settings"
                className="group relative bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                      <span className="text-white text-lg">⚙️</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                      Settings
                    </h4>
                    <p className="text-sm text-gray-500">
                      Configure AWS credentials and application preferences
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Instances */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Instances</h3>
            </div>
            <div className="p-6">
              {recentInstances.length > 0 ? (
                <div className="space-y-4">
                  {recentInstances.map((instance) => (
                    <div key={instance.id} className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 text-sm">🚀</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {instance.name}
                          </p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(instance.status)}`}>
                            <span className="mr-1">{getStatusIcon(instance.status)}</span>
                            {instance.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {instance.instanceType} • {instance.publicIp ? `IP: ${instance.publicIp}` : 'No public IP'}
                        </p>
                        <p className="text-xs text-gray-400">
                          Updated: {formatDate(instance.lastUpdated)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No instances found</p>
              )}
            </div>
          </div>

          {/* Instance Types Distribution */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Instance Types</h3>
            </div>
            <div className="p-6">
              {Object.keys(instanceTypes).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(instanceTypes)
                    .sort(([, a], [, b]) => b - a)
                    .map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                          <span className="text-sm font-medium text-gray-900">{type}</span>
                        </div>
                        <span className="text-sm text-gray-500">{count} instance{count !== 1 ? 's' : ''}</span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No instance types found</p>
              )}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">System Status</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{runningInstances}</div>
                <div className="text-sm text-gray-500">Running Instances</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{initializingInstances}</div>
                <div className="text-sm text-gray-500">Initializing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stoppedInstances}</div>
                <div className="text-sm text-gray-500">Stopped Instances</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
