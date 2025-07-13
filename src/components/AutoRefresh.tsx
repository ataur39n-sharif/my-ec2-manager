'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface AutoRefreshProps {
    intervalSeconds?: number;
}

export default function AutoRefresh({ intervalSeconds = 30 }: AutoRefreshProps) {
    const router = useRouter();
    const [countdown, setCountdown] = useState(intervalSeconds);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const triggerRefresh = useCallback(() => {
        setIsRefreshing(true);
        router.refresh();
        setCountdown(intervalSeconds);
    }, [router, intervalSeconds]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    // Use setTimeout to avoid calling router.refresh during render
                    setTimeout(() => {
                        triggerRefresh();
                    }, 0);
                    return intervalSeconds;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [intervalSeconds, triggerRefresh]);

    const handleManualRefresh = useCallback(() => {
        triggerRefresh();
    }, [triggerRefresh]);

    // Reset refreshing state after a short delay
    useEffect(() => {
        if (isRefreshing) {
            const timer = setTimeout(() => {
                setIsRefreshing(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isRefreshing]);

    return (
        <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
                <div className="text-sm text-gray-500">
                    Auto-refresh in <span className="font-mono font-medium text-blue-600">{countdown}s</span>
                </div>
                {isRefreshing && (
                    <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
            </div>
            <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
        </div>
    );
} 