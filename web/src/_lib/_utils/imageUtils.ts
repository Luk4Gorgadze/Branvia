// Utility functions for image processing

/**
 * Calculate aspect ratio from image dimensions
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 * @returns Aspect ratio (width / height)
 */
export function calculateAspectRatio(width: number, height: number): number {
    return width / height;
}

/**
 * Get image dimensions from a File object
 * @param file - Image file
 * @returns Promise with { width, height } or null if failed
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            resolve({ width: img.width, height: img.height });
        };
        img.onerror = () => {
            resolve(null);
        };
        img.src = URL.createObjectURL(file);
    });
}

/**
 * Get aspect ratio from an image file
 * @param file - Image file
 * @returns Promise with aspect ratio or null if failed
 */
export async function getImageAspectRatio(file: File): Promise<number | null> {
    const dimensions = await getImageDimensions(file);
    if (dimensions) {
        return calculateAspectRatio(dimensions.width, dimensions.height);
    }
    return null;
} 