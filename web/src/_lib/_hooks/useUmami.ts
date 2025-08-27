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

    // Track specific button/action clicks with descriptive names
    const trackButtonClick = useCallback((
        buttonName: string,
        location: string,
        additionalData?: Record<string, string | number | boolean>
    ) => {
        // Use descriptive event names that will show clearly in Umami dashboard
        const eventName = `${buttonName} clicked`;
        trackEvent(eventName, {
            location,
            ...additionalData
        });
    }, [trackEvent]);

    // Track form interactions with descriptive names
    const trackFormAction = useCallback((
        action: string,
        formName: string,
        additionalData?: Record<string, string | number | boolean>
    ) => {
        const eventName = `${formName} ${action}`;
        trackEvent(eventName, {
            form: formName,
            ...additionalData
        });
    }, [trackEvent]);

    // Track page/section views with descriptive names
    const trackPageView = useCallback((
        pageName: string,
        additionalData?: Record<string, string | number | boolean>
    ) => {
        const eventName = `${pageName} viewed`;
        trackEvent(eventName, {
            page: pageName,
            ...additionalData
        });
    }, [trackEvent]);

    // Track user actions with descriptive names
    const trackUserAction = useCallback((
        action: string,
        context: string,
        additionalData?: Record<string, string | number | boolean>
    ) => {
        const eventName = `${action} ${context}`;
        trackEvent(eventName, {
            context,
            ...additionalData
        });
    }, [trackEvent]);

    // Legacy methods for backward compatibility (but with better naming)
    const trackClick = useCallback((
        elementName: string,
        location: string,
        additionalData?: Record<string, string | number | boolean>
    ) => {
        const eventName = `${elementName} clicked`;
        trackEvent(eventName, {
            element: elementName,
            location,
            ...additionalData
        });
    }, [trackEvent]);

    const trackView = useCallback((
        sectionName: string,
        additionalData?: Record<string, string | number | boolean>
    ) => {
        const eventName = `${sectionName} viewed`;
        trackEvent(eventName, {
            section: sectionName,
            ...additionalData
        });
    }, [trackEvent]);

    const trackInteraction = useCallback((
        interactionType: string,
        elementName: string,
        additionalData?: Record<string, string | number | boolean>
    ) => {
        const eventName = `${elementName} ${interactionType}`;
        trackEvent(eventName, {
            type: interactionType,
            element: elementName,
            ...additionalData
        });
    }, [trackEvent]);

    // Helper function to create Umami data attributes for HTML elements
    const createUmamiAttributes = useCallback((
        eventName: string,
        eventData?: Record<string, string | number | boolean>
    ) => {
        const attributes: Record<string, string> = {
            'data-umami-event': eventName
        };

        // Add event data attributes if provided
        if (eventData) {
            Object.entries(eventData).forEach(([key, value]) => {
                attributes[`data-umami-event-${key}`] = String(value);
            });
        }

        return attributes;
    }, []);

    return {
        trackEvent,
        // New descriptive methods
        trackButtonClick,
        trackFormAction,
        trackPageView,
        trackUserAction,
        // Legacy methods (updated for better naming)
        trackClick,
        trackView,
        trackInteraction,
        // Helper for data attributes
        createUmamiAttributes,
        isProd
    };
};
