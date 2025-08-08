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
        <>
            <nav className={styles.nav}>
                {/* Mobile: logo + hamburger in a row */}
                <div className={styles.mobileOnly} style={{ width: '100%', alignItems: 'center' }}>
                    <Link href="/#hero" className={styles.logo}>Branvia</Link>
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
                    <Link href="/#hero" className={styles.logo}>Branvia</Link>
                    <div className={styles.navLinks}>
                        {user && <Link href="/#gallery">Gallery</Link>}
                        {!user && <Link href="/#gallery" onClick={() => setMenuOpen(false)}>Examples</Link>}
                        <Link href="/#about">About</Link>
                        <Link href="/#pricing">Pricing</Link>
                        {user && <Link href="/campaign/generate">Generate</Link>}
                    </div>
                    <div className={styles.authNav}>
                        {user ? <button className={styles.ctaNav} onClick={async () => {
                            await signOut()
                            setUser(undefined)
                            // router.refresh()
                        }}>Sign Out</button> : <button className={styles.ctaNav} onClick={() => signInGoogle()}>Continue with Google</button>}
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
                            onClick={() => setMenuOpen(false)}
                        >
                            &times;
                        </button>
                        <Link href="/#hero" className={styles.logoMenu} onClick={() => setMenuOpen(false)}>
                            Branvia
                        </Link>
                        <div className={styles.navLinks}>
                            {user && <Link href="/#gallery" onClick={() => setMenuOpen(false)}>Gallery</Link>}
                            {!user && <Link href="/#gallery" onClick={() => setMenuOpen(false)}>Examples</Link>}
                            <Link href="/#about" onClick={() => setMenuOpen(false)}>About</Link>
                            <Link href="/#pricing" onClick={() => setMenuOpen(false)}>Pricing</Link>
                            {user && <Link href="/campaign/generate" onClick={() => setMenuOpen(false)}>Generate</Link>}
                        </div>
                        <div className={styles.authNav}>
                            {user ? (
                                <button className={styles.ctaNav} onClick={async () => {
                                    await signOut()
                                    setUser(undefined)
                                }}>Sign Out</button>
                            ) : (
                                <button className={styles.ctaNav} onClick={() => signInGoogle()}>Continue with Google</button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar; 