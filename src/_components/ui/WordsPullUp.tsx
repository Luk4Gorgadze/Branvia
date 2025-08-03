"use client";
import * as React from "react";
import styles from "../main/HeroSection/HeroSection.module.css";

export function WordsPullUp({
    text,
    className = "",
}: {
    text: string;
    className?: string;
}) {
    // Split into words, but keep track of indices for accent
    const splittedText = text.split(" ");

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
                <span
                    key={i}
                    style={{
                        display: "inline-block",
                        marginRight: "0.5ch",
                        position: "relative",
                        animation: `wordPullUp 0.6s ease-out ${i * 0.08}s both`
                    }}
                    className={accentIndices.includes(i) ? styles.heroTitleAccent : undefined}
                >
                    {current === "" ? <span>&nbsp;</span> : current}
                </span>
            ))}
        </div>
    );
} 