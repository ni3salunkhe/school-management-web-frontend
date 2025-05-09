const helper = {
    // Helper function to format YYYYMMDD string to DDMMYYYY (or DD/MM/YYYY)
    formatDOB(yyyymmddString, separator = "") {
        if (!yyyymmddString || typeof yyyymmddString !== 'string' || yyyymmddString.length !== 8) {
            // console.warn("Invalid DOB format or value provided to formatDOB:", yyyymmddString);
            return ""; // Return empty string for invalid input or if DOB is not present
        }

        const year = yyyymmddString.substring(0, 4);
        const month = yyyymmddString.substring(4, 6);
        const day = yyyymmddString.substring(6, 8);

        // Optional: Basic validation to ensure parts are numeric, though substring handles it.
        // If you need stricter validation (e.g., day is 1-31, month 1-12), add more checks.
        if (isNaN(parseInt(year)) || isNaN(parseInt(month)) || isNaN(parseInt(day))) {
            // console.warn("DOB string contains non-numeric parts:", yyyymmddString);
            return ""; // Or return the original string if preferred for debugging
        }

        if (separator) {
            return `${day}${separator}${month}${separator}${year}`;
        }
        return `${day}${month}${year}`; // For DDMMYYYY format as requested
    }

}

export default helper