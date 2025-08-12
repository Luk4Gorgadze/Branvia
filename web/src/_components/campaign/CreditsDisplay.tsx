import { useEffect, useState } from 'react';
import styles from '@/app/campaign/generate/generate.module.css';

export const CreditsDisplay = () => {
    const [credits, setCredits] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const fetchCredits = async () => {
            try {
                const res = await fetch('/api/users/me/credits');
                if (!res.ok) {
                    throw new Error('Failed to fetch credits');
                }
                const data = await res.json();
                if (isMounted) setCredits(typeof data.availableCredits === 'number' ? data.availableCredits : 0);
            } catch (e) {
                if (isMounted) setError('Unable to load credits');
            }
        };
        fetchCredits();
        return () => { isMounted = false; };
    }, []);

    return (
        <div className={styles.creditsDisplay}>
            <div className={styles.creditsInfo}>
                <span className={styles.creditsLabel}>Your Credits:</span>
                <span className={styles.creditsAmount}>{credits ?? '—'}</span>
            </div>
            <div className={styles.generationCost}>
                <span className={styles.costLabel}>Generation Cost:</span>
                <span className={styles.costAmount}>50 credits</span>
            </div>
            {error && (
                <div style={{ color: '#ff6b6b', marginTop: '8px', fontSize: '0.9rem' }}>{error}</div>
            )}
        </div>
    );
};