const helper = {
    convertToYYYYMMDD(dateString){
        if (!dateString) return '';
        // Check if already in YYYYMMDD format
        if (/^\d{4}\d{2}\d{2}$/.test(dateString)) return dateString;

        // Convert from DDMMYYYY to YYYYMMDD
        const matches = dateString.match(/^(\d{2})(\d{2})(\d{4})$/);
        if (!matches) return dateString;
        return `${matches[3]}${matches[2]}${matches[1]}`;
    },
    formatDateToDDMMYYYY (date)  {
        if (!(date instanceof Date)) return '';
    
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
    
        return `${dd}${mm}${yyyy}`;
    }
    
}

export default helper