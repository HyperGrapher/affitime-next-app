import React, { useState } from 'react'
import type { InstallmentType } from '../../interface/payments.interface'
import { numberWithCommas } from '../../utils/helpers'
import { Lira } from '../../components/shared/HtmlCodes'


type Props = {
    price?: number,
    table?: InstallmentType | undefined
    setInstallmentAmount: React.Dispatch<React.SetStateAction<string>>

}


const calcMonthlyPayment = (price: number | undefined, rate: number | undefined, month: number) => {

    if (!price) return 0;
    if (!rate) return 0;

    const tot = (price * (rate / 100) + price)
    const res = tot / month
    return res.toFixed(2)
}

const calcTotalPayment = (price: number | undefined, rate: number | undefined) => {

    if (!price) return 0;
    if (!rate) return 0;

    const tot = (price * (rate / 100) + price)
    return tot.toFixed(2)
}


const InstallmentTable: React.FC<Props> = ({ price, table, setInstallmentAmount }) => {

    const [instAmount, setInstAmount] = useState("0")


    const handleOnchange = (val: string) => {
        setInstallmentAmount(val)
        setInstAmount(val)
    }


    return (
        <section className="text-gray-600 body-font w-full">
            <div className="py-2 mx-auto">
                <div className="flex flex-col text-center w-full mb-4">
                    <h1 className="sm:text-xl text-lg font-medium title-font mb-2 text-gray-900">Taksit Tablosu</h1>
                    <p className="lg:w-2/3 mx-auto leading-relaxed text-base">Tüm kartlar için</p>
                </div>
                <div className="lg:w-2/3 w-full mx-auto overflow-auto">
                    <table className="table-auto w-full text-left whitespace-no-wrap text-sm">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100 rounded-tl rounded-bl">Tutar</th>
                                <th className="px-4 py-2 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Taksit Adedi</th>
                                <th className="px-4 py-2 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Taksit Tutarı</th>
                                <th className="px-4 py-2 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Toplam</th>
                                <th className="w-10 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100 rounded-tr rounded-br">Seçim</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="px-4 py-2">{numberWithCommas(price)} <Lira /> </td>
                                <td className="px-4 py-2 text-center">2</td>
                                <td className="px-4 py-2 text-center">{String(numberWithCommas(calcMonthlyPayment(price, table?.oranlar.advantage['taksit_2'], 2)))} <Lira /></td>
                                <td className="px-4 py-2 text-gray-900 text-center">{String(numberWithCommas(calcTotalPayment(price, table?.oranlar.advantage['taksit_2'])))} <Lira /></td>
                                <td className="w-10 text-center">
                                    <input name="installment_amount" type="radio" value="2" onChange={(e) => handleOnchange(e.currentTarget.value)} />
                                </td>
                            </tr>

                            <tr>
                                <td className="px-4 py-2">{numberWithCommas(price)} <Lira /> </td>
                                <td className="px-4 py-2 text-center">3</td>
                                <td className="px-4 py-2 text-center">{String(numberWithCommas(calcMonthlyPayment(price, table?.oranlar.advantage['taksit_3'], 3)))} <Lira /></td>
                                <td className="px-4 py-2 text-gray-900 text-center">{String(numberWithCommas(calcTotalPayment(price, table?.oranlar.advantage['taksit_3'])))} <Lira /></td>
                                <td className="w-10 text-center">
                                    <input name="installment_amount" type="radio" value="3" onChange={(e) => handleOnchange(e.currentTarget.value)} />
                                </td>
                            </tr>


                            <tr>
                                <td className="px-4 py-2">{numberWithCommas(price)} <Lira /> </td>
                                <td className="px-4 py-2 text-center">4</td>
                                <td className="px-4 py-2 text-center">{String(numberWithCommas(calcMonthlyPayment(price, table?.oranlar.advantage['taksit_4'], 4)))} <Lira /></td>
                                <td className="px-4 py-2 text-gray-900 text-center">{String(numberWithCommas(calcTotalPayment(price, table?.oranlar.advantage['taksit_4'])))} <Lira /></td>
                                <td className="w-10 text-center">
                                    <input name="installment_amount" type="radio" value="4" onChange={(e) => handleOnchange(e.currentTarget.value)} />
                                </td>
                            </tr>


                            <tr>
                                <td className="px-4 py-2">{numberWithCommas(price)} <Lira /> </td>
                                <td className="px-4 py-2 text-center">5</td>
                                <td className="px-4 py-2 text-center">{String(numberWithCommas(calcMonthlyPayment(price, table?.oranlar.advantage['taksit_5'], 5)))} <Lira /></td>
                                <td className="px-4 py-2 text-gray-900 text-center">{String(numberWithCommas(calcTotalPayment(price, table?.oranlar.advantage['taksit_5'])))} <Lira /></td>
                                <td className="w-10 text-center">
                                    <input name="installment_amount" type="radio" value="5" onChange={(e) => handleOnchange(e.currentTarget.value)} />
                                </td>
                            </tr>



                            <tr>
                                <td className="px-4 py-2">{numberWithCommas(price)} <Lira /> </td>
                                <td className="px-4 py-2 text-center">6</td>
                                <td className="px-4 py-2 text-center">{String(numberWithCommas(calcMonthlyPayment(price, table?.oranlar.advantage['taksit_6'], 6)))} <Lira /></td>
                                <td className="px-4 py-2 text-gray-900 text-center">{String(numberWithCommas(calcTotalPayment(price, table?.oranlar.advantage['taksit_6'])))} <Lira /></td>
                                <td className="w-10 text-center">
                                    <input name="installment_amount" type="radio" value="6" onChange={(e) => handleOnchange(e.currentTarget.value)} />
                                </td>
                            </tr>



                            <tr>
                                <td className="px-4 py-2">{numberWithCommas(price)} <Lira /> </td>
                                <td className="px-4 py-2 text-center">7</td>
                                <td className="px-4 py-2 text-center">{String(numberWithCommas(calcMonthlyPayment(price, table?.oranlar.advantage['taksit_7'], 7)))} <Lira /></td>
                                <td className="px-4 py-2 text-gray-900 text-center">{String(numberWithCommas(calcTotalPayment(price, table?.oranlar.advantage['taksit_7'])))} <Lira /></td>
                                <td className="w-10 text-center">
                                    <input name="installment_amount" type="radio" value="7" onChange={(e) => handleOnchange(e.currentTarget.value)} />
                                </td>
                            </tr>



                            <tr>
                                <td className="px-4 py-2">{numberWithCommas(price)} <Lira /> </td>
                                <td className="px-4 py-2 text-center">8</td>
                                <td className="px-4 py-2 text-center">{String(numberWithCommas(calcMonthlyPayment(price, table?.oranlar.advantage['taksit_8'], 8)))} <Lira /></td>
                                <td className="px-4 py-2 text-gray-900 text-center">{String(numberWithCommas(calcTotalPayment(price, table?.oranlar.advantage['taksit_8'])))} <Lira /></td>
                                <td className="w-10 text-center">
                                    <input name="installment_amount" type="radio" value="8" onChange={(e) => handleOnchange(e.currentTarget.value)} />
                                </td>
                            </tr>




                            <tr>
                                <td className="px-4 py-2">{numberWithCommas(price)} <Lira /> </td>
                                <td className="px-4 py-2 text-center">9</td>
                                <td className="px-4 py-2 text-center">{String(numberWithCommas(calcMonthlyPayment(price, table?.oranlar.advantage['taksit_9'], 9)))} <Lira /></td>
                                <td className="px-4 py-2 text-gray-900 text-center">{String(numberWithCommas(calcTotalPayment(price, table?.oranlar.advantage['taksit_9'])))} <Lira /></td>
                                <td className="w-10 text-center">
                                    <input name="installment_amount" type="radio" value="9" onChange={(e) => handleOnchange(e.currentTarget.value)} />
                                </td>
                            </tr>




                            <tr>
                                <td className="px-4 py-2">{numberWithCommas(price)} <Lira /> </td>
                                <td className="px-4 py-2 text-center">10</td>
                                <td className="px-4 py-2 text-center">{String(numberWithCommas(calcMonthlyPayment(price, table?.oranlar.advantage['taksit_10'], 10)))} <Lira /></td>
                                <td className="px-4 py-2 text-gray-900 text-center">{String(numberWithCommas(calcTotalPayment(price, table?.oranlar.advantage['taksit_10'])))} <Lira /></td>
                                <td className="w-10 text-center">
                                    <input name="installment_amount" type="radio" value="10" onChange={(e) => handleOnchange(e.currentTarget.value)} />
                                </td>
                            </tr>



                            <tr>
                                <td className="px-4 py-2">{numberWithCommas(price)} <Lira /> </td>
                                <td className="px-4 py-2 text-center">11</td>
                                <td className="px-4 py-2 text-center">{String(numberWithCommas(calcMonthlyPayment(price, table?.oranlar.advantage['taksit_11'], 11)))} <Lira /></td>
                                <td className="px-4 py-2 text-gray-900 text-center">{String(numberWithCommas(calcTotalPayment(price, table?.oranlar.advantage['taksit_11'])))} <Lira /></td>
                                <td className="w-10 text-center">
                                    <input name="installment_amount" type="radio" value="11" onChange={(e) => handleOnchange(e.currentTarget.value)} />
                                </td>
                            </tr>



                            <tr>
                                <td className="px-4 py-2">{numberWithCommas(price)} <Lira /> </td>
                                <td className="px-4 py-2 text-center">12</td>
                                <td className="px-4 py-2 text-center">{String(numberWithCommas(calcMonthlyPayment(price, table?.oranlar.advantage['taksit_12'], 12)))} <Lira /></td>
                                <td className="px-4 py-2 text-gray-900 text-center">{String(numberWithCommas(calcTotalPayment(price, table?.oranlar.advantage['taksit_12'])))} <Lira /></td>
                                <td className="w-10 text-center">
                                    <input name="installment_amount" type="radio" value="12" onChange={(e) => handleOnchange(e.currentTarget.value)} />
                                </td>
                            </tr>



                        </tbody>
                    </table>
                </div>

            </div>
        </section>
    )
}

export default InstallmentTable