import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and merges Tailwind classes.
 * @param  {...any} inputs - Class values to combine.
 * @returns {string} - The merged class string.
 */
export function cn(...inputs) {
    return twMerge(clsx(...inputs));
}