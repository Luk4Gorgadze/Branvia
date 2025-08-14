import { useEffect, useState } from 'react';
import { getUserCredits } from '@/_actions/users';
import { useUser } from '@/_lib/_providers/UserProvider';
import styles from '@/app/campaign/generate/generate.module.css';

export const CreditsDisplay = () => {
    const [credits, setCredits] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { user } = useUser();

    useEffect(() => {
        let isMounted = true;
        const fetchCredits = async () => {
            if (!user?.id) return;

            try {
                const result = await getUserCredits({ userId: user.id }, user.id);
                if (result.success && result.data) {
                    if (isMounted) setCredits(result.data.credits);
                } else {
                    if (isMounted) setError(result.error || 'Failed to fetch credits');
                }
            } catch (err) {
                if (isMounted) setError('Unable to load credits');
            }
        };
        fetchCredits();
        return () => { isMounted = false; };
    }, [user?.id]);

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