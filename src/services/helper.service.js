const helper = {
    // Helper function to format YYYYMMDD string to DDMMYYYY (or DD/MM/YYYY)
    formatISODateToDMY(isoDateString, outputSeparator = "") {
        // ... (your existing function - no changes needed here)
        if (!isoDateString || typeof isoDateString !== 'string') return "";
        const dateObj = new Date(isoDateString);
        if (isNaN(dateObj.getTime())) return "";
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        return outputSeparator ? `${day}${outputSeparator}${month}${outputSeparator}${year}` : `${day}${month}${year}`;
    },
    formatISODateToYMD(isoDateString, outputSeparator = "") {
    if (!isoDateString || typeof isoDateString !== 'string') return "";
    const dateObj = new Date(isoDateString);
    if (isNaN(dateObj.getTime())) return "";
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return outputSeparator ? `${year}${outputSeparator}${month}${outputSeparator}${day}` : `${year}${month}${day}`;
}


}

export default helper