export const capitalize = (str: string | null): string => {

    if (!str) return "-"
    const lower = str.toLowerCase();
    return str.charAt(0).toUpperCase() + lower.slice(1);
};

/**  MySQL Database'den gelen created/updated gibi date'leri <1 Ocak 2022 12:00> formatina cevirir */
export const formatDateTR = (date: Date | null | undefined): string => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
    });

};

export const numberWithCommas = (num: string | number | undefined | null) => {
    if (!num) return num = 0;
    // const num = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(x));
    return new Intl.NumberFormat('tr-TR').format(Number(num));

};

export const range = (end: number, start = 0, step = 1) => {
    function* generateRange() {
        let x = start - step;

        while (x < end - step) yield (x += step);
    }

    return {
        [Symbol.iterator]: generateRange,
    };
};

/**
 * 
 * @param ibanNo with TR or not takes string "12341 2341234 1234..." or 123415645646456.."
 * @returns "TR 1234 1234 1234 1234 1234 1234" or <""> if not iban
 */
export const formatIban = (ibanNo: string | null) => {

    if (!ibanNo) return ""

    ibanNo = removeSpaces(ibanNo)

    if (ibanNo.toLowerCase().startsWith('tr')) ibanNo = ibanNo.slice(2);

    if (ibanNo.length !== 24) return ""

    return ibanNo.replace(/(\d{4})(\d{4})(\d{4})(\d{4})(\d{4})(\d{4})/, "TR $1 $2 $3 $4 $5 $6");

};

/**
 * 
 * @param str " xxxx xxxx  xxxx..."
 * @returns "xxxxxxxxxxxx"
 */
export const removeSpaces = (str: string | undefined) => {

    if (!str) return ""

    return str.replace(/\s+/g, '');

};