'use client'
import React, { useState } from "react";
import styles from "@/app/page.module.css";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className={styles.nav}>
            {/* Mobile: logo + hamburger in a row */}
            <div className={styles.mobileOnly} style={{ width: '100%', alignItems: 'center' }}>
                <div className={styles.logo}>Branvia</div>
                <button
                    className={styles.hamburger}
                    aria-label="Open menu"
                    onClick={() => setMenuOpen(true)}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
            {/* Desktop: logo, nav links, auth all in a row */}
            <div className={styles.desktopOnly} style={{ width: '100%', alignItems: 'center', display: 'flex' }}>
                <div className={styles.logo}><a href="#">Branvia</a></div>
                <div className={styles.navLinks}>
                    <a href="#prompts">Prompts</a>
                    <a href="#about">About</a>
                    <a href="#pricing">Pricing</a>
                </div>
                <div className={styles.authNav}>
                    <a href="#discovery" className={styles.ctaNav}>Sign Up</a>
                    <a href="#discovery" className={styles.ctaNav}>Login</a>
                </div>
            </div>
            {/* Mobile dropdown menu with Framer Motion */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        className={styles.mobileDropdownMenu}
                        initial={{ y: -60, opacity: 0, height: 0 }}
                        animate={{ y: 0, opacity: 1, height: 'auto' }}
                        exit={{ y: -60, opacity: 0, height: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                        style={{ overflow: 'hidden', position: 'fixed', top: 0, left: 0, width: '100vw', zIndex: 1000 }}
                    >
                        <button
                            className={styles.closeButton}
                            aria-label="Close menu"
                            onClick={() => setMenuOpen(false)}
                        >
                            &times;
                        </button>
                        <div className={styles.logoMenu}>Branvia</div>
                        <div className={styles.navLinks}>
                            <a
                                href="#prompts"
                                onClick={e => {
                                    e.preventDefault();
                                    setMenuOpen(false);
                                    setTimeout(() => {
                                        const el = document.getElementById('prompts');
                                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                                    }, 200); // Wait for menu to close
                                }}
                            >
                                Prompts
                            </a>
                            <a href="#about" onClick={e => {
                                e.preventDefault();
                                setMenuOpen(false);
                                setTimeout(() => {
                                    const el = document.getElementById('about');
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                }, 200); // Wait for menu to close
                            }}>About</a>
                            <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
                        </div>
                        <div className={styles.authNav}>
                            <a href="#discovery" className={styles.ctaNav} onClick={() => setMenuOpen(false)}>Sign Up</a>
                            <a href="#discovery" className={styles.ctaNav} onClick={() => setMenuOpen(false)}>Login</a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
