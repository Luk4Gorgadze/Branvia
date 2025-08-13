import styles from "./PricingSection.module.css";

interface PriceCardProps {
    title: string;
    price: number;
    period?: string;
    features: string[];
    isFeatured?: boolean;
    featuredBadge?: string;
    onButtonClick?: () => void;
    disabled?: boolean;
    hasActiveSubscription?: boolean;
    subscriptionStatus?: 'current' | 'upgrade' | 'downgrade' | null;
}

const PriceCard = ({
    title,
    price,
    period = "/month",
    features,
    isFeatured = false,
    featuredBadge = "Most Popular",
    onButtonClick,
    disabled = false,
    hasActiveSubscription = false,
    subscriptionStatus
}: PriceCardProps) => {
    const getButtonText = () => {
        switch (subscriptionStatus) {
            case 'current':
                return 'Current Plan';
            case 'upgrade':
                return 'Upgrade';
            case 'downgrade':
                return 'Downgrade';
            default:
                return 'Get Started';
        }
    };

    const getButtonClassName = () => {
        let className = styles.pricingButton;

        if (hasActiveSubscription) {
            className += ` ${styles.currentPlan}`;
        } else if (disabled) {
            className += ` ${styles.disabled}`;
        }

        return className;
    };

    return (
        <div className={`${styles.pricingCard} ${isFeatured ? styles.featured : ''}`}>
            {isFeatured && (
                <div className={styles.featuredBadge}>{featuredBadge}</div>
            )}
            <h3 className={styles.pricingTitle}>{title}</h3>
            <div className={styles.pricingPrice}>
                <span className={styles.currency}>$</span>
                <span className={styles.amount}>{price}</span>
                <span className={styles.period}>{period}</span>
            </div>
            <ul className={styles.pricingFeatures}>
                {features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                ))}
            </ul>
            <button
                className={getButtonClassName()}
                onClick={disabled ? undefined : onButtonClick}
                disabled={disabled || (hasActiveSubscription && subscriptionStatus === 'current')}
            >
                {getButtonText()}
            </button>
        </div>
    );
};

export default PriceCard; 