'use client'
import React, { useState } from "react";
import styles from "./Navbar.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { signInGoogle, signOut } from "@/_lib/_auth/authClient";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/_lib/_providers";
import Link from "next/link";

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const router = useRouter()
    const { user, setUser } = useUser();

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
                <div className={styles.logo}><Link href="/">Branvia</Link></div>
                <div className={styles.navLinks}>
                    <button onClick={() => router.push('/#prompts')}>Prompts</button>
                    <button onClick={() => router.push('/#about')}>About</button>
                    <button onClick={() => router.push('/#pricing')}>Pricing</button>
                </div>
                <div className={styles.authNav}>
                    {user ? <button className={styles.ctaNav} onClick={async () => {
                        await signOut()
                        setUser(undefined)
                        // router.refresh()
                    }}>Sign Out</button> : <button className={styles.ctaNav} onClick={() => signInGoogle()}>Continue with Google</button>}
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
                        <div className={styles.logoMenu}><Link href="/" onClick={() => setMenuOpen(false)}>Branvia</Link></div>
                        <div className={styles.navLinks}>
                            <button
                                onClick={() => {
                                    setMenuOpen(false);
                                    router.push('/#prompts');
                                }}
                            >
                                Prompts
                            </button>
                            <button onClick={() => {
                                setMenuOpen(false);
                                router.push('/#about');
                            }}>About</button>
                            <button onClick={() => {
                                setMenuOpen(false);
                                router.push('/#pricing');
                            }}>Pricing</button>
                        </div>
                        <div className={styles.authNav}>
                            {user ? <button className={styles.ctaNav} onClick={async () => {
                                await signOut()
                                setUser(undefined)
                                // router.refresh()
                            }}>Sign Out</button> : <button className={styles.ctaNav} onClick={() => signInGoogle()}>Continue with Google</button>}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar; 