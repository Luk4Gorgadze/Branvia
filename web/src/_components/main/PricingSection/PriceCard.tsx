import styles from "./PricingSection.module.css";

interface PriceCardProps {
    title: string;
    price: number;
    period?: string;
    features: string[];
    buttonText: string;
    isFeatured?: boolean;
    featuredBadge?: string;
    onButtonClick?: () => void;
    disabled?: boolean;
}

const PriceCard = ({
    title,
    price,
    period = "/month",
    features,
    buttonText,
    isFeatured = false,
    featuredBadge = "Most Popular",
    onButtonClick,
    disabled = false
}: PriceCardProps) => {
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
                className={`${styles.pricingButton} ${disabled ? styles.disabled : ''}`}
                onClick={disabled ? undefined : onButtonClick}
                disabled={disabled}
            >
                {buttonText}
            </button>
        </div>
    );
};

export default PriceCard; 