"use client"
import styles from "@/app/prompt-card/[id]/pcard.module.css"
import Image from "next/image";
import { Copy } from 'lucide-react';
import { useState } from 'react';

const PromptCardPage = () => {
    const [copied, setCopied] = useState(false);
    const promptText = "Create a stunning luxury brand photography image featuring a premium product in an elegant setting. Use soft, professional lighting with a sophisticated color palette. The composition should convey exclusivity and high-end appeal, perfect for premium marketing campaigns.";

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(promptText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <div className={styles.promptCardPage}>
            <div className={styles.promptVisual}>
                <h1>Luxury Brand Photography</h1>
                <div className={styles.imageContainer}>
                    <Image
                        src="/example.png"
                        alt="Prompt Visual"
                        fill
                        style={{ objectFit: 'cover' }}
                    />
                </div>
            </div>
            <div className={styles.promptInfo}>
                <div className={styles.promptText}>
                    <div className={styles.promptHeader}>
                        <h3>Prompt:</h3>
                        <button
                            onClick={copyToClipboard}
                            className={styles.copyButton}
                            title="Copy prompt to clipboard"
                        >
                            <Copy size={18} />
                            {copied && <span className={styles.copiedText}>Copied!</span>}
                        </button>
                    </div>
                    <p>{promptText}</p>
                </div>
                <div className={styles.tokenCost}>
                    <span className={styles.costLabel}>Cost:</span>
                    <span className={styles.costValue}>40 tokens</span>
                </div>
            </div>
        </div>
    )
}

export default PromptCardPage;