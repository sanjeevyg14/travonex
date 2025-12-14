

"use client";

import { useMemo } from 'react';
import { useMockData } from './use-mock-data';
import { User, Subscription } from '@/lib/types';
import { format, subMonths, startOfMonth } from 'date-fns';

type ProUser = User & {
    activeSubscription: Subscription;
};

type RecentSubscription = {
    user: User;
    subscription: Subscription;
};

export function useSubscriptionAnalytics() {
    const { users, proPriceMonthly, proPriceAnnual } = useMockData();

    const analyticsData = useMemo(() => {
        const proUsers: User[] = users.filter(
            (user) => user.subscriptionTier === 'pro' && user.subscriptionHistory?.some(s => s.status === 'active')
        );

        const totalProSubscribers = proUsers.length;

        const mrr = proUsers.reduce((acc, user) => {
            const activeSub = user.subscriptionHistory?.find(s => s.status === 'active');
            if (activeSub) {
                if (activeSub.planName.includes('Annual')) {
                    // For annual plans, we add the effective monthly rate to MRR
                    return acc + proPriceAnnual;
                }
                return acc + proPriceMonthly;
            }
            return acc;
        }, 0);

        const totalRevenue = users.reduce((total, user) => {
            const userRevenue = user.subscriptionHistory?.reduce((sum, sub) => sum + sub.pricePaid, 0) || 0;
            return total + userRevenue;
        }, 0);
        
        const recentSubscriptions: RecentSubscription[] = users
            .flatMap(user => (user.subscriptionHistory || []).map(subscription => ({ user, subscription })))
            .sort((a, b) => new Date(b.subscription.startDate).getTime() - new Date(a.subscription.startDate).getTime())
            .slice(0, 5);
        

        return {
            stats: {
                totalProSubscribers,
                mrr,
                totalRevenue,
            },
            proUsers,
            recentSubscriptions
        };

    }, [users, proPriceMonthly, proPriceAnnual]);

    return analyticsData;
}
