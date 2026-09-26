/**
 * Removes leading and trailing spaces from a string and collapses multiple spaces, tabs, or newlines into a single space.
 *
 * @param {string} str - The input string to normalize.
 * @returns {string} - The normalized string with single spaces.
 * @example
 * normalizeWhitespace("  Hello   World \n") // "Hello World"
 */
export function normalizeWhitespace(str: string): string {
    return str.trim().replace(/\s+/g, ' ');
}

/**
 * Converts a string into a URL-friendly slug by removing diacritics, converting to lowercase, and replacing spaces with dashes.
 *
 * @param {string} str - The input string to slugify.
 * @returns {string} - The slugified string.
 * @example
 * slugify("Hello World!") // "hello-world"
 * slugify("Crème brûlée") // "creme-brulee"
 */
export function slugify(str: string): string {
    return removeDiacritics(str)
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with dashes
        .replace(/[^\w-]+/g, '') // Remove non-word characters
        .replace(/--+/g, '-') // Replace multiple dashes with one
        .replace(/^-+|-+$/g, ''); // Trim dashes from start/end
}

/**
 * Capitalizes the first character of a string.
 *
 * @param {string} str - The input string to capitalize.
 * @returns {string} - The string with the first character capitalized.
 * @example
 * capitalize("hello") // "Hello"
 * capitalize("world") // "World"
 */
export function capitalize(str: string): string {
    if (!str) return '';
    return str[0]?.toUpperCase() + str.slice(1);
}

/**
 * Converts the entire string to uppercase.
 *
 * @param {string} str - The input string to convert.
 * @returns {string} - The string in uppercase.
 * @example
 * toUpperCase("hello") // "HELLO"
 */
export function toUpperCase(str: string): string {
    return str.toUpperCase();
}

/**
 * Converts the entire string to lowercase.
 *
 * @param {string} str - The input string to convert.
 * @returns {string} - The string in lowercase.
 * @example
 * toLowerCase("HELLO") // "hello"
 */
export function toLowerCase(str: string): string {
    return str.toLowerCase();
}

/**
 * Converts a string to title case, where the first letter of each word is capitalized.
 *
 * @param {string} str - The input string to convert.
 * @returns {string} - The string in title case.
 * @example
 * toTitleCase("hello world") // "Hello World"
 */
export function toTitleCase(str: string): string {
    return str
        .toLowerCase()
        .split(' ')
        .map((word) => capitalize(word))
        .join(' ');
}

/**
 * Removes diacritics (accents) from characters in a string.
 * Example: "Crème brûlée" → "Creme brulee".
 *
 * @param {string} str - The input string to process.
 * @returns {string} - The string without diacritics.
 * @example
 * removeDiacritics("Crème brûlée") // "Creme brulee"
 */
export function removeDiacritics(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Truncates a string to a specified length, appending "…" if the string exceeds the maximum length.
 *
 * @param {string} str - The input string to truncate.
 * @param {number} maxLength - The maximum allowed length of the string.
 * @returns {string} - The truncated string.
 * @example
 * truncate("Hello World", 5) // "Hello…"
 */
export function truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Pads the start of a string with a specified character until it reaches the desired length.
 *
 * @param {string} str - The input string to pad.
 * @param {number} length - The desired total length of the string.
 * @param {string} [char=' '] - The character to use for padding (default is a space).
 * @returns {string} - The padded string.
 * @example
 * padLeft("42", 5, "0") // "00042"
 */
export function padLeft(str: string, length: number, char: string = ' '): string {
    return str.padStart(length, char);
}

/**
 * Pads the end of a string with a specified character until it reaches the desired length.
 *
 * @param {string} str - The input string to pad.
 * @param {number} length - The desired total length of the string.
 * @param {string} [char=' '] - The character to use for padding (default is a space).
 * @returns {string} - The padded string.
 * @example
 * padRight("42", 5, "0") // "42000"
 */
export function padRight(str: string, length: number, char: string = ' '): string {
    return str.padEnd(length, char);
}

/**
 * Converts a string to camelCase by removing spaces, dashes, and underscores, and capitalizing the first letter of each word except the first.
 *
 * @param {string} str - The input string to convert.
 * @returns {string} - The string in camelCase.
 * @example
 * toCamelCase("hello world") // "helloWorld"
 * toCamelCase("snake_case_example") // "snakeCaseExample"
 */
export function toCamelCase(str: string): string {
    return str.replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : '')).replace(/^(.)/, (m) => m.toLowerCase());
}

/**
 * Converts a string to snake_case by replacing spaces and dashes with underscores and converting to lowercase.
 *
 * @param {string} str - The input string to convert.
 * @returns {string} - The string in snake_case.
 * @example
 * toSnakeCase("Hello World") // "hello_world"
 */
export function toSnakeCase(str: string): string {
    return removeDiacritics(str)
        .replace(/[\s-]+/g, '_')
        .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
        .toLowerCase()
        .replace(/^_+|_+$/g, '');
}

/**
 * Converts a string to kebab-case by replacing spaces and underscores with dashes and converting to lowercase.
 *
 * @param {string} str - The input string to convert.
 * @returns {string} - The string in kebab-case.
 * @example
 * toKebabCase("Hello World") // "hello-world"
 */
export function toKebabCase(str: string): string {
    return removeDiacritics(str)
        .replace(/[\s_]+/g, '-')
        .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
        .toLowerCase()
        .replace(/^-+|-+$/g, '');
}

/**
 * Normalizes a given string by performing the following operations:
 * - Converts the string to Unicode Normalization Form D (NFD).
 * - Removes diacritical marks (accents) from the string.
 * - Converts the string to lowercase.
 * - Trims leading and trailing whitespace.
 *
 * @param str - The input string to normalize.
 * @returns The normalized string.
 */
export function normalizeString(str: string): string {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

