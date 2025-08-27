'use client'

import { useCallback } from 'react';

// Umami tracking hook that only works in production
export const useUmami = () => {
    const isProd = process.env.NEXT_PUBLIC_APP_URL === "https://branvia.art";

    const trackEvent = useCallback((
        eventName: string,
        eventData?: Record<string, string | number | boolean>
    ) => {
        if (!isProd || typeof window === 'undefined') return;

        // Check if Umami is loaded
        if (typeof (window as any).umami !== 'undefined') {
            (window as any).umami.track(eventName, eventData);
        }
    }, [isProd]);

    const trackClick = useCallback((
        elementName: string,
        location: string,
        additionalData?: Record<string, string | number | boolean>
    ) => {
        trackEvent('click', {
            element: elementName,
            location,
            ...additionalData
        });
    }, [trackEvent]);

    const trackView = useCallback((
        sectionName: string,
        additionalData?: Record<string, string | number | boolean>
    ) => {
        trackEvent('view', {
            section: sectionName,
            ...additionalData
        });
    }, [trackEvent]);

    const trackInteraction = useCallback((
        interactionType: string,
        elementName: string,
        additionalData?: Record<string, string | number | boolean>
    ) => {
        trackEvent('interaction', {
            type: interactionType,
            element: elementName,
            ...additionalData
        });
    }, [trackEvent]);

    return {
        trackEvent,
        trackClick,
        trackView,
        trackInteraction,
        isProd
    };
};
