import styles from '../../app/campaign/generate/generate.module.css';

interface ProgressBarProps {
    currentStep: number;
}

export const ProgressBar = ({ currentStep }: ProgressBarProps) => {
    const steps = [
        { number: 1, label: 'Upload' },
        { number: 2, label: 'Describe' },
        { number: 3, label: 'Style' },
        { number: 4, label: 'Format' },
        { number: 5, label: 'Generate' }
    ];

    return (
        <div className={styles.progressBar}>
            {steps.map((step) => (
                <div
                    key={step.number}
                    className={`${styles.progressStep} ${step.number <= currentStep ? styles.active : ''}`}
                >
                    <div className={styles.stepNumber}>{step.number}</div>
                    <span className={styles.stepLabel}>{step.label}</span>
                </div>
            ))}
        </div>
    );
}; 