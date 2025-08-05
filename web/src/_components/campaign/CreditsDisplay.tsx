import styles from '@/app/campaign/generate/generate.module.css';

export const CreditsDisplay = () => {
    return (
        <div className={styles.creditsDisplay}>
            <div className={styles.creditsInfo}>
                <span className={styles.creditsLabel}>Your Credits:</span>
                <span className={styles.creditsAmount}>150</span>
            </div>
            <div className={styles.generationCost}>
                <span className={styles.costLabel}>Generation Cost:</span>
                <span className={styles.costAmount}>50 credits</span>
            </div>
        </div>
    );
}; 