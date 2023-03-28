export const calcMonthlyPayment = (price: number | undefined, rate: number | undefined, month: number) => {

    if (!price) return 0;
    if (!rate) return 0;

    const tot = (price * (rate / 100) + price)
    const res = tot / month
    return res.toFixed(2)
}

export const calcTotalPayment = (price: number | undefined, rate: number | undefined) => {

    if (!price) return 0;
    if (!rate) return 0;

    const tot = price * (1 + rate / 100)
    return tot.toFixed(2)
}