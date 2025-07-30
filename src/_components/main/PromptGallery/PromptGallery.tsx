'use client'
import { useUser } from "@/_lib/_providers";
import styles from "./PromptGallery.module.css";
import Image from "next/image";
import Link from "next/link";


const PromptGallery = () => {
    const { user } = useUser();
    return (
        <section className={styles.promptSection} id="prompts">
            {user && (<div className={styles.userWelcome}>
                Welcome, {user.name}!
            </div>)}
            <div className={styles.platformReference}>
                <h2 className={styles.promptHeadline}>
                    Use our prompts to create stunning images on:
                </h2>
                <div className={styles.platformLogos}>
                    <div className={styles.platformLogo}>
                        <a href="https://openai.com/dall-e" target="_blank" rel="noopener noreferrer">DALL·E</a>
                    </div>
                    <div className={styles.platformLogo}>
                        <a href="https://www.midjourney.com/" target="_blank" rel="noopener noreferrer">Midjourney</a>
                    </div>
                    <div className={styles.platformLogo}>
                        <a href="https://stablediffusionweb.com/" target="_blank" rel="noopener noreferrer">Stable Diffusion</a>
                    </div>
                    <div className={styles.platformLogo}>
                        <a href="https://www.adobe.com/sensei/generative-ai/firefly.html" target="_blank" rel="noopener noreferrer">Adobe Firefly</a>
                    </div>
                </div>
            </div>
            <div className={styles.promptCardHolder}>
                {Array.from({ length: 10 }).map((_, i) => (
                    <Link key={i} href={`/prompt-card/${i}`} className={styles.promptImageCard}>
                        <Image
                            src="/example.png"
                            alt="AI Generated Image"
                            fill
                            sizes="(max-width: 400px) 50vw, (max-width: 900px) 33vw, 20vw"
                            className={styles.promptImage}
                        />
                        <div className={styles.promptOverlay}>View Prompt</div>
                    </Link>
                ))}
            </div>
        </section >
    )
}

export default PromptGallery; 