const numberService = {
    /**
 * Validates a string against a regex pattern and required length.
 *
 * @param {string} value - The input string to validate
 * @param {RegExp} pattern - The regex pattern the string must match
 * @param {number} length - The exact length the string must be
 * @returns {boolean} - Returns true if valid, false if not
 */
    validateByPattern(value, pattern, length) {
        if (typeof value !== 'string') return false;

        const trimmed = value.trim();
        return trimmed.length === length && pattern.test(trimmed);
    }

}
export default numberService;