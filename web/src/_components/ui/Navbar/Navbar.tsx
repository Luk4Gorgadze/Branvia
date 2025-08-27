'use client'
import React, { useState } from "react";
import styles from "./Navbar.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { signInGoogle, signOut } from "@/_lib/_auth/authClient";

import { useUser } from "@/_lib/_providers";
import Link from "next/link";
import { Settings } from "lucide-react";
import { useUmami } from "@/_lib/_hooks/useUmami";

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, setUser } = useUser();
    const { trackClick, trackInteraction } = useUmami();

    return (
        <>
            <nav className={styles.nav}>
                {/* Mobile: logo + hamburger in a row */}
                <div className={styles.mobileOnly} style={{ width: '100%', alignItems: 'center' }}>
                    <Link href="/#hero" className={styles.logo}>Branvia</Link>
                    <button
                        className={styles.hamburger}
                        aria-label="Open menu"
                        onClick={() => {
                            setMenuOpen(true);
                            trackClick('hamburger_menu', 'navbar', { action: 'open' });
                        }}
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
                {/* Desktop: logo, nav links, auth all in a row */}
                <div className={styles.desktopOnly} style={{ width: '100%', alignItems: 'center', display: 'flex' }}>
                    <Link href="/#hero" className={styles.logo}>Branvia</Link>
                    <div className={styles.navLinks}>
                        {user && <Link href="/gallery">Gallery</Link>}
                        {!user && <Link href="/#gallery" onClick={() => setMenuOpen(false)}>Examples</Link>}
                        <Link href="/#about">About</Link>
                        <Link href="/#pricing">Pricing</Link>
                        {user && <Link href="/campaign/generate">Generate</Link>}
                    </div>
                    <div className={styles.authNav}>
                        {user ? (
                            <>
                                <Link href="/settings" className={styles.settingsIcon} title="Settings">
                                    <Settings size={20} />
                                </Link>
                                <button className={styles.ctaNav} onClick={async () => {
                                    trackClick('sign_out', 'navbar', { location: 'desktop' });
                                    await signOut()
                                    setUser(undefined)
                                    window.location.reload()
                                }}>Sign Out</button>
                            </>
                        ) : (
                            <button className={styles.ctaNav} onClick={() => {
                                trackClick('sign_in_google', 'navbar', { location: 'desktop' });
                                signInGoogle();
                            }}>Continue with Google</button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Mobile dropdown menu with Framer Motion */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        className={styles.mobileDropdownMenu}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        <button
                            className={styles.closeButton}
                            aria-label="Close menu"
                            onClick={() => {
                                setMenuOpen(false);
                                trackClick('close_menu', 'navbar', { action: 'close' });
                            }}
                        >
                            &times;
                        </button>
                        <Link href="/#hero" className={styles.logoMenu} onClick={() => setMenuOpen(false)}>
                            Branvia
                        </Link>
                        <div className={styles.navLinks}>
                            {user && <Link href="/gallery" onClick={() => setMenuOpen(false)}>Gallery</Link>}
                            {!user && <Link href="/#gallery" onClick={() => setMenuOpen(false)}>Examples</Link>}
                            <Link href="/#about" onClick={() => setMenuOpen(false)}>About</Link>
                            <Link href="/#pricing" onClick={() => setMenuOpen(false)}>Pricing</Link>
                            {user && <Link href="/campaign/generate" onClick={() => setMenuOpen(false)}>Generate</Link>}
                        </div>
                        <div className={styles.authNav}>
                            {user ? (
                                <>
                                    <Link href="/settings" className={styles.settingsIcon} onClick={() => setMenuOpen(false)} title="Settings">
                                        <Settings size={20} />
                                        <span>Settings</span>
                                    </Link>
                                    <button className={styles.ctaNav} onClick={async () => {
                                        trackClick('sign_out', 'navbar', { location: 'mobile' });
                                        await signOut()
                                        setUser(undefined)
                                        window.location.reload()
                                    }}>Sign Out</button>
                                </>
                            ) : (
                                <button className={styles.ctaNav} onClick={() => {
                                    trackClick('sign_in_google', 'navbar', { location: 'mobile' });
                                    signInGoogle();
                                }}>Continue with Google</button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar; 