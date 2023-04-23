import React from 'react'
import { Lira } from '../../components/shared/HtmlCodes'
import type { InstallmentType } from '../../interface/payments.interface'
import { numberWithCommas } from '../../utils/helpers'
import { calcMonthlyPayment, calcTotalPayment } from '../../utils/paymentCalc'

type Props = {
    price?: number,
    table?: InstallmentType | undefined
    setInstallmentAmount: React.Dispatch<React.SetStateAction<string>>
}

const InstallmentTable: React.FC<Props> = ({ price, table, setInstallmentAmount }) => {


    return (
        <section className="text-gray-600 body-font w-full">
            <div className="py-2 mx-auto">
                <div className="flex flex-col text-center w-full mb-4">
                    <h1 className="sm:text-xl text-lg font-medium title-font mb-2 text-gray-900">Taksit Tablosu</h1>
                    <p className="lg:w-2/3 mx-auto leading-relaxed text-sm md:text-base">Ödeme tutarı için bir vade seçin</p>
                </div>
                <div className="lg:w-2/3 w-full mx-auto overflow-auto">
                    <table className="table-auto w-full text-left whitespace-no-wrap text-xs sm:text-sm">
                        <thead>
                            <tr>
                                <th className="hidden sm:block px-2 py-2 sm:px-4 sm:py-2 title-font tracking-wider font-medium text-gray-900 text-xs sm:text-sm bg-slate-100 rounded-tl rounded-bl">Tutar</th>
                                <th className="px-2 py-2 sm:px-4 sm:py-2 title-font tracking-wider font-medium text-gray-900 text-xs sm:text-sm bg-slate-100">Taksit Adedi</th>
                                <th className="px-2 py-2 sm:px-4 sm:py-2 title-font tracking-wider font-medium text-gray-900 text-xs sm:text-sm bg-slate-100">Taksit Tutarı</th>
                                <th className="px-2 py-2 sm:px-4 sm:py-2 title-font tracking-wider font-medium text-gray-900 text-xs sm:text-sm bg-slate-100">Toplam</th>
                                <th className="w-6 sm:w-10 title-font tracking-wider font-medium text-gray-900 text-xs sm:text-sm bg-slate-100 rounded-tr rounded-br pr-4">Seçim</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="hidden sm:block px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap">{numberWithCommas(price)} <Lira /> </td>
                                <td className="px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap ">2</td>
                                <td className="px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap ">{String(numberWithCommas(calcMonthlyPayment(price, table?.oranlar.advantage['taksit_2'], 2)))} <Lira /></td>
                                <td className="px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap text-gray-900 ">{String(numberWithCommas(calcTotalPayment(price, table?.oranlar.advantage['taksit_2'])))} <Lira /></td>
                                <td className="w-6 sm:w-10 ">
                                    <input name="installment_amount" type="radio" value="2" onChange={(e) => setInstallmentAmount(e.currentTarget.value)} />
                                </td>
                            </tr>

                            <tr>
                                <td className="hidden sm:block px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap">{numberWithCommas(price)} <Lira /> </td>
                                <td className="px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap">3</td>
                                <td className="px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap">{String(numberWithCommas(calcMonthlyPayment(price, table?.oranlar.advantage['taksit_3'], 3)))} <Lira /></td>
                                <td className="px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap text-gray-900">{String(numberWithCommas(calcTotalPayment(price, table?.oranlar.advantage['taksit_3'])))} <Lira /></td>
                                <td className="w-6 sm:w-10">
                                    <input name="installment_amount" type="radio" value="3" onChange={(e) => setInstallmentAmount(e.currentTarget.value)} />
                                </td>
                            </tr>


                            <tr>
                                <td className="hidden sm:block px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap">{numberWithCommas(price)} <Lira /> </td>
                                <td className="px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap">4</td>
                                <td className="px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap">{String(numberWithCommas(calcMonthlyPayment(price, table?.oranlar.advantage['taksit_4'], 4)))} <Lira /></td>
                                <td className="px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap text-gray-900">{String(numberWithCommas(calcTotalPayment(price, table?.oranlar.advantage['taksit_4'])))} <Lira /></td>
                                <td className="w-6 sm:w-10">
                                    <input name="installment_amount" type="radio" value="4" onChange={(e) => setInstallmentAmount(e.currentTarget.value)} />
                                </td>
                            </tr>


                            <tr>
                                <td className="hidden sm:block px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap">{numberWithCommas(price)} <Lira /> </td>
                                <td className="px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap">5</td>
                                <td className="px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap">{String(numberWithCommas(calcMonthlyPayment(price, table?.oranlar.advantage['taksit_5'], 5)))} <Lira /></td>
                                <td className="px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap text-gray-900">{String(numberWithCommas(calcTotalPayment(price, table?.oranlar.advantage['taksit_5'])))} <Lira /></td>
                                <td className="w-6 sm:w-10">
                                    <input name="installment_amount" type="radio" value="5" onChange={(e) => setInstallmentAmount(e.currentTarget.value)} />
                                </td>
                            </tr>



                            <tr>
                                <td className="hidden sm:block px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap">{numberWithCommas(price)} <Lira /> </td>
                                <td className="px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap">6</td>
                                <td className="px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap">{String(numberWithCommas(calcMonthlyPayment(price, table?.oranlar.advantage['taksit_6'], 6)))} <Lira /></td>
                                <td className="px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap text-gray-900">{String(numberWithCommas(calcTotalPayment(price, table?.oranlar.advantage['taksit_6'])))} <Lira /></td>
                                <td className="w-6 sm:w-10">
                                    <input name="installment_amount" type="radio" value="6" onChange={(e) => setInstallmentAmount(e.currentTarget.value)} />
                                </td>
                            </tr>



                            <tr>
                                <td className="hidden sm:block px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap">{numberWithCommas(price)} <Lira /> </td>
                                <td className="px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap">7</td>
                                <td className="px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap">{String(numberWithCommas(calcMonthlyPayment(price, table?.oranlar.advantage['taksit_7'], 7)))} <Lira /></td>
                                <td className="px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap text-gray-900">{String(numberWithCommas(calcTotalPayment(price, table?.oranlar.advantage['taksit_7'])))} <Lira /></td>
                                <td className="w-6 sm:w-10">
                                    <input name="installment_amount" type="radio" value="7" onChange={(e) => setInstallmentAmount(e.currentTarget.value)} />
                                </td>
                            </tr>



                            <tr>
                                <td className="hidden sm:block px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap">{numberWithCommas(price)} <Lira /> </td>
                                <td className="px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap">8</td>
                                <td className="px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap">{String(numberWithCommas(calcMonthlyPayment(price, table?.oranlar.advantage['taksit_8'], 8)))} <Lira /></td>
                                <td className="px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap text-gray-900">{String(numberWithCommas(calcTotalPayment(price, table?.oranlar.advantage['taksit_8'])))} <Lira /></td>
                                <td className="w-6 sm:w-10">
                                    <input name="installment_amount" type="radio" value="8" onChange={(e) => setInstallmentAmount(e.currentTarget.value)} />
                                </td>
                            </tr>




                            <tr>
                                <td className="hidden sm:block px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap">{numberWithCommas(price)} <Lira /> </td>
                                <td className="px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap">9</td>
                                <td className="px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap">{String(numberWithCommas(calcMonthlyPayment(price, table?.oranlar.advantage['taksit_9'], 9)))} <Lira /></td>
                                <td className="px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap text-gray-900">{String(numberWithCommas(calcTotalPayment(price, table?.oranlar.advantage['taksit_9'])))} <Lira /></td>
                                <td className="w-6 sm:w-10">
                                    <input name="installment_amount" type="radio" value="9" onChange={(e) => setInstallmentAmount(e.currentTarget.value)} />
                                </td>
                            </tr>




                            <tr>
                                <td className="hidden sm:block px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap">{numberWithCommas(price)} <Lira /> </td>
                                <td className="px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap">10</td>
                                <td className="px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap">{String(numberWithCommas(calcMonthlyPayment(price, table?.oranlar.advantage['taksit_10'], 10)))} <Lira /></td>
                                <td className="px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap text-gray-900">{String(numberWithCommas(calcTotalPayment(price, table?.oranlar.advantage['taksit_10'])))} <Lira /></td>
                                <td className="w-6 sm:w-10">
                                    <input name="installment_amount" type="radio" value="10" onChange={(e) => setInstallmentAmount(e.currentTarget.value)} />
                                </td>
                            </tr>



                            <tr>
                                <td className="hidden sm:block px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap">{numberWithCommas(price)} <Lira /> </td>
                                <td className="px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap">11</td>
                                <td className="px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap">{String(numberWithCommas(calcMonthlyPayment(price, table?.oranlar.advantage['taksit_11'], 11)))} <Lira /></td>
                                <td className="px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap text-gray-900">{String(numberWithCommas(calcTotalPayment(price, table?.oranlar.advantage['taksit_11'])))} <Lira /></td>
                                <td className="w-6 sm:w-10">
                                    <input name="installment_amount" type="radio" value="11" onChange={(e) => setInstallmentAmount(e.currentTarget.value)} />
                                </td>
                            </tr>



                            <tr>
                                <td className="hidden sm:block px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap">{numberWithCommas(price)} <Lira /> </td>
                                <td className="px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap">12</td>
                                <td className="px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap">{String(numberWithCommas(calcMonthlyPayment(price, table?.oranlar.advantage['taksit_12'], 12)))} <Lira /></td>
                                <td className="px-2 py-2 sm:px-4 sm:py-2 whitespace-nowrap text-gray-900">{String(numberWithCommas(calcTotalPayment(price, table?.oranlar.advantage['taksit_12'])))} <Lira /></td>
                                <td className="w-6 sm:w-10">
                                    <input name="installment_amount" type="radio" value="12" onChange={(e) => setInstallmentAmount(e.currentTarget.value)} />
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