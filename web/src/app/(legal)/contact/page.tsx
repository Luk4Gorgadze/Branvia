'use client'
import React from 'react';
import styles from './page.module.css';

export default function ContactPage() {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.title}>Contact Us</h1>
                <p className={styles.subtitle}>We'd love to hear from you. Reach us via email or socials.</p>

                <div className={styles.contactGrid}>
                    <section className={styles.contactMethod}>
                        <h3>Email</h3>
                        <p>For general inquiries and support:</p>
                        <p>
                            <a href="mailto:info@branvia.art">info@branvia.art</a>
                        </p>
                    </section>

                    <section className={styles.contactMethod}>
                        <h3>Socials</h3>
                        <p>Follow and reach out on our social channels:</p>
                        <p>
                            Facebook:{' '}
                            <a href="https://www.facebook.com/people/Branvia/61579682373134/" target="_blank" rel="noopener noreferrer">
                                @branvia
                            </a>
                        </p>
                        <p>
                            Instagram:{' '}
                            <a href="https://www.instagram.com/branvia.art/" target="_blank" rel="noopener noreferrer">
                                @branvia
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
} 