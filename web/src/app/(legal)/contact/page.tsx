'use client'
import { useState } from "react";
import styles from "./page.module.css";

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        console.log('Form submitted:', formData);
        // Reset form
        setFormData({ name: '', email: '', message: '' });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.title}>Contact Us</h1>
                <p className={styles.subtitle}>Get in touch with our team for support, questions, or feedback</p>

                <div className={styles.contactGrid}>
                    <div className={styles.contactInfo}>
                        <h2>Get in Touch</h2>
                        <p>We're here to help! Reach out to us through any of these channels:</p>

                        <div className={styles.contactMethod}>
                            <h3>Email Support</h3>
                            <p><a href="mailto:info@branvia.art">info@branvia.art</a></p>
                            <p>For general inquiries and support</p>
                        </div>

                        <div className={styles.contactMethod}>
                            <h3>Response Time</h3>
                            <p>• General inquiries: 24 hours</p>
                            <p>• Technical issues: 12 hours</p>
                            <p>• Billing questions: 6 hours</p>
                        </div>

                        <div className={styles.contactMethod}>
                            <h3>Business Hours</h3>
                            <p>Monday - Friday: 9:00 AM - 6:00 PM EST</p>
                            <p>Weekend support available for urgent issues</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 