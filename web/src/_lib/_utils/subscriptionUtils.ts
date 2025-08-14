export const getStatusColor = (status: string): string => {
    switch (status) {
        case 'ACTIVE': return '#10b981';
        case 'PAST_DUE': return '#f59e0b';
        case 'SUSPENDED': return '#ef4444';
        case 'CANCELED': return '#6b7280';
        default: return '#6b7280';
    }
};

export const getStatusIconName = (status: string): string => {
    switch (status) {
        case 'ACTIVE': return 'CheckCircle';
        case 'PAST_DUE': return 'AlertTriangle';
        case 'SUSPENDED': return 'X';
        case 'CANCELED': return 'X';
        default: return 'AlertTriangle';
    }
};

export const getStatusExplanation = (status: string): string => {
    switch (status) {
        case 'ACTIVE':
            return '✅ Your subscription is active and billing normally.';
        case 'PAST_DUE':
            return '⚠️ Your payment is overdue. Please update your payment method to avoid suspension.';
        case 'SUSPENDED':
            return '❌ Your subscription is suspended due to payment issues. Please update your payment method to reactivate.';
        case 'CANCELED':
            return '⏹️ Your subscription has been cancelled. You can still use your remaining credits.';
        default:
            return 'Unknown subscription status.';
    }
};

export const shouldShowCancelButton = (status: string): boolean => {
    return status === 'ACTIVE';
};

export const shouldShowResubscribeButton = (status: string): boolean => {
    return ['CANCELED', 'SUSPENDED', 'PAST_DUE'].includes(status);
}; 