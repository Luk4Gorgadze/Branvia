"use client";
import { motion, useInView } from "framer-motion";
import * as React from "react";
import styles from "@/app/page.module.css";

export function WordsPullUp({
    text,
    className = "",
}: {
    text: string;
    className?: string;
}) {
    // Split into words, but keep track of indices for accent
    const splittedText = text.split(" ");

    const pullupVariant = {
        initial: { y: 20, opacity: 0 },
        animate: (i: number) => ({
            y: 0,
            opacity: 1,
            transition: {
                delay: i * 0.1,
            },
        }),
    };
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true });

    // Find indices for 'visual' and 'identity'
    const accentIndices = splittedText.reduce<number[]>((acc, word, i) => {
        if (
            (word === "visual" && splittedText[i + 1] === "identity") ||
            (word === "identity" && splittedText[i - 1] === "visual")
        ) {
            acc.push(i);
        }
        return acc;
    }, []);

    return (
        <div className={className} style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-start" }}>
            {splittedText.map((current, i) => (
                <motion.span
                    key={i}
                    ref={ref}
                    variants={pullupVariant}
                    initial="initial"
                    animate={isInView ? "animate" : ""}
                    custom={i}
                    style={{ display: "inline-block", marginRight: "0.5ch" }}
                    className={accentIndices.includes(i) ? styles.heroTitleAccent : undefined}
                >
                    {current === "" ? <span>&nbsp;</span> : current}
                </motion.span>
            ))}
        </div>
    );
} 