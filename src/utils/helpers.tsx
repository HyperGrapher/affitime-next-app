export const capitalize = (str: string | null): string => {

    if(!str) return "-"
    const lower = str.toLowerCase();
    return str.charAt(0).toUpperCase() + lower.slice(1);
};

export const removeFirstWordIfStartsWithYaklasik = (str: string | undefined): string => {
    if (str === undefined) return "";

    if (!str.toLowerCase().startsWith("yaklaşık")) {
        return str;
    }
    return str.slice(9);
};

/* Database'den gelen created/updated gibi alanlari <3 Ocak 2022> formatina cevirir */
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

export const numberWithCommas = (x: string | number | undefined | null) => {
    if (!x) return x = 0;
    // const num = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(x));
    const num = new Intl.NumberFormat('tr-TR').format(Number(x));
    return num
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