import { zodResolver } from '@hookform/resolvers/zod';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { useRouter } from "next/router";
import { useMemo, useRef, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { PatternFormat } from 'react-number-format';
import TopBarProgress from "react-topbar-progress-indicator";
import { z } from 'zod';
import Card from '../credit-card/card/Card';
import { FormFieldError, FormFieldWrapper } from '../error-messages/FormError';
import { PAYTR_PLAN_PAYMENT_URL } from '../../config/constants';
import { PRICING_ANNUALY, PRICING_MONTHLY } from '../../config/pricing';
import type { ICreditCard, IPlanPaymentData } from "../../interface/payments.interface";
import { IpSchema } from '../../interface/zod.schema';
import InstallmentTable from '../../pages/payments/InstallmentTable';
import classNames from "../../utils/classnames";
import getClientIp from '../../utils/getClientIp';
import { notifyError } from '../../utils/notifications';
import { trpc } from '../../utils/trpc';
import CardSelector from '../credit-card/CardSelector';

type InstProps = {
    setIsTaksit: React.Dispatch<React.SetStateAction<boolean>>
}
const TaksitRadio: React.FC<InstProps> = ({ setIsTaksit }) => {

    const [taksit, setTaksit] = useState(false)

    const handleOnchange = (val: boolean) => {
        setTaksit(val)
        setIsTaksit(val)
    }

    return (
        <FormFieldWrapper>

            <RadioGroup
                aria-labelledby="perSalex"
                className='text-xs bg-red-0 scale-90 xsm:scale-100'
                value={taksit}>

                <div className="flex">

                    <FormControlLabel
                        value={false}
                        onChange={() => handleOnchange(false)}
                        control={<Radio size="small" />}
                        label="Tek Çekim" />
                    <FormControlLabel
                        className='text-xs bg-red-0'
                        value={true}
                        onChange={() => handleOnchange(true)}
                        control={<Radio size="small" />}
                        label="Taksit" />


                </div>
            </RadioGroup>
        </FormFieldWrapper>)
}


interface ICardFormData {
    card_number: string;
    expiryDate: string;
    cardHolderName: string;
    cvvNumber: string;
}

const validationSchema = z.object({
    card_number: z.string().min(19, "Geçerli bir kart numarasi giriniz"),
    expiryDate: z.string().trim().min(5, "Bu alanı doldurunuz"),
    cardHolderName: z.string().trim().min(5, "Geçerli bir isim giriniz"),
    cvvNumber: z.string().trim().min(3, "En az 3 karakter olmalı!").max(4, "En fazla 4 karakter olmalı"),
})
    .required()
    .superRefine(({ expiryDate, cardHolderName }, ctx) => {

        if (/\d/.test(cardHolderName)) {
            return ctx.addIssue({
                code: "custom",
                message: "Ad ve soyadınız rakam içermemeli",
                path: ['cardHolderName']
            });
        }


        if (/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(cardHolderName)) {
            return ctx.addIssue({
                code: "custom",
                message: "Ad ve soyadınız özel karakter içermemeli",
                path: ['cardHolderName']
            });
        }


        if (!cardHolderName.includes(" ")) {
            return ctx.addIssue({
                code: "custom",
                message: "Ad ve soyadınızı arada boşluk bırakarak giriniz",
                path: ['cardHolderName']
            });
        }


        if (expiryDate.includes("_")) {
            return ctx.addIssue({
                code: "custom",
                message: "Bu alanı doldurunuz",
                path: ['expiryDate']
            });
        }

        const [month, year] = expiryDate.split('/')
        const currentYear = new Date().toLocaleDateString('en', { year: '2-digit' })

        if (month && parseInt(month) > 12) {
            return ctx.addIssue({
                code: "custom",
                message: "01-12 arasinda bir ay numarasi giriniz",
                path: ['expiryDate']
            });
        }
        if (year && parseInt(year) < parseInt(currentYear)) {
            return ctx.addIssue({
                code: "custom",
                message: "Geçerli bir yıl giriniz",
                path: ['expiryDate']
            });
        }
    });


    /*
        ONCE direct api ile odeme alini
        Sonra partner'e odeme yapilacagi zaman transfer_iban vb ile istek gonderilir
    */

const PaymentCardMarket = () => {
    const { query } = useRouter()
    const [isTaksit, setIsTaksit] = useState(false)
    const [busy, setBusy] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)

    const [cardNo, setCardNo] = useState("");
    const [payData, setPayData] = useState<IPlanPaymentData>();
    const [expiryDate, setExpiryDate] = useState("");
    const [installmentAmount, setInstallmentAmount] = useState("0");
    const [selectedCard, setSelectedCard] = useState<ICreditCard>({ id: 0, name: '', value: '' });


    const handleCardNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value =
            e.target.value
                .replace(/\s|[^0-9]+/g, "")
                .match(/.{1,4}/g)
                ?.join(" ") ?? "";

        setCardNo(value);
        setValue('card_number', value);
    };


    const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setExpiryDate(e.target.value);
        setValue('expiryDate', e.target.value);
    };

    const { register, handleSubmit, setValue, formState: { errors }, watch } = useForm<ICardFormData>({
        resolver: zodResolver(validationSchema),
        reValidateMode: 'onBlur',
        mode: 'onBlur',
    });

    const getTaxInfo = useMemo(() => {

        const tax = localStorage.getItem("taxinfo")
        if (!tax) return null
        return JSON.parse(tax)
    }, [])

    const puchase = trpc.marketplace.purchasePack.useMutation()
    // const { data: tx } = trpc.purchase.getInstallmentInfo.useQuery()

    const onSubmit: SubmitHandler<ICardFormData> = async (cardData) => {
        console.log({ cardData });


        if (!getTaxInfo) return notifyError('Adres bilgisi bulunamadi!')
        // setBusy(true)

        const ipData = await getClientIp()
        const userIp = IpSchema.parse(ipData)



        const purchaseData = {
            user_ip: userIp.ip,
            currency: 'TL',
            user_address: getTaxInfo.address,
            installment_count: isTaksit ? installmentAmount : "0",
            card_type: selectedCard.value
        }

        // return console.log({purchaseData, cardData});
        


        puchase.mutate(purchaseData, {
            onSuccess: (data) => {

                // test card 1: 4355 0843 5508 4358	
                // test card 2: 4355 0843 5508 4358
                const [month, year] = cardData.expiryDate.split('/')

                const aa: IPlanPaymentData = {
                    ...data,
                    cc_owner: cardData.cardHolderName,
                    card_number: cardData.card_number.replaceAll(' ', ''),
                    expiry_month: month,
                    expiry_year: year,
                    cvv: cardData.cvvNumber,
                    merchant_ok_url: "https://affitime.com/payments/success",
                    merchant_fail_url: "https://affitime.com/payments/fail",
                    installment_count: "0", // isTaksit ? installmentAmount : "0",
                    card_type: selectedCard.value,
                }

                console.log(aa);
                setPayData(aa)

                setTimeout(() => {
                    buttonRef.current?.click()

                }, 1000);

            },
            onError(error) {
                console.error(error)
                notifyError('Ödeme sırasında bir hata oluştu!')
                setBusy(false)
            },

        })

    }


    return (<div className="bg-white rounded-xl px-2 md:px-4 py-8 w-full mx-auto shadow-xl">
        {busy && <TopBarProgress />}

        <div className="flex flex-col mb-4 items-center ">
            <h1 className="text-base md:text-xl text-center font-bold text-slate-500">
                Ödeme Yapın
            </h1>
            <div className="text-center">
                <TaksitRadio setIsTaksit={setIsTaksit} />
            </div>

        </div>


        <form id="post_form" className="hidden" action={PAYTR_PLAN_PAYMENT_URL} method="post">
            <input type="hidden" name="card_number" value={payData?.card_number} />
            <input type="hidden" name="cc_owner" value={payData?.cc_owner} />
            <input type="hidden" name="expiry_month" value={payData?.expiry_month} />
            <input type="hidden" name="expiry_year" value={payData?.expiry_year} />
            <input type="hidden" name="cvv" value={payData?.cvv} />
            <input type="hidden" name="merchant_id" value={payData?.merchant_id} />
            <input type="hidden" name="user_ip" value={payData?.user_ip} />
            <input type="hidden" name="merchant_oid" value={payData?.merchant_oid} />
            <input type="hidden" name="email" value={payData?.email} />
            <input type="hidden" name="payment_type" value={payData?.payment_type} />
            <input type="hidden" name="payment_amount" value={payData?.payment_amount} />
            {/* <input type="hidden" name="currency" value={payData?.currency} /> */}
            <input type="hidden" name="test_mode" value={payData?.test_mode} />
            <input type="hidden" name="non_3d" value={payData?.non_3d} />
            <input type="hidden" name="merchant_ok_url" value={payData?.merchant_ok_url} />
            <input type="hidden" name="merchant_fail_url" value={payData?.merchant_fail_url} />
            <input type="hidden" name="user_name" value={payData?.user_name} />
            <input type="hidden" name="user_address" value={payData?.user_address} />
            <input type="hidden" name="user_phone" value={payData?.user_phone} />
            <input type="hidden" name="user_basket" value={payData?.user_basket} />
            <input type="hidden" name="debug_on" value={payData?.debug_on} />
            {/* <input type="hidden" name="client_lang" value={payData?.client_lang} /> */}
            <input type="hidden" name="paytr_token" value={payData?.paytr_token} />
            <input type="hidden" name="non3d_test_failed" value={payData?.non3d_test_failed} />
            <input type="hidden" name="installment_count" value={payData?.installment_count} />
            {/* <input type="hidden" name="card_type" value={payData?.card_type} /> */}

            <button id="post" ref={buttonRef}>c</button>
        </form>


        <div className='mt-4'>

            <div className="">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col items-center gap-4" >


                        <Card
                            number={watch().card_number || ''}
                            name={watch().cardHolderName || ''}
                            expiry={watch().expiryDate || ''}
                            cvc={watch().cvvNumber || ''}
                            focused={''}
                        />

                        {isTaksit && <CardSelector
                            selected={selectedCard}
                            setSelected={setSelectedCard}
                        />}

                        {/* {isTaksit && <InstallmentTable
                            price={calcTotalFromPlan(annual, payment_amount_as_plan)}
                            table={tx}
                            setInstallmentAmount={setInstallmentAmount}
                        />} */}

                        <div className="flex flex-col bg-redx-100 w-full justify-between gap-6 whitespace-nowrap">


                            <section className={classNames(
                                "bg-slate-100 hover:bg-slate-50",
                                "w-full rounded-md  py-2 px-2   ",
                                "shadow hover:shadow-md shadow-slate-300 transition-all",
                                "border hover:border-black/5 space-y-2 pb-8 "

                            )}>

                                <FormFieldWrapper>


                                    <label
                                        className={classNames(
                                            "font-medium text-sm pl-2 mb-4"
                                        )}
                                        htmlFor="cardHolderName">
                                        Kart Sahibi
                                    </label>

                                    <input
                                        className={classNames(
                                            'block w-full rounded-md shadow-sm sm:text-sm',
                                            'disabled:bg-slate-200 border-gray-300 transition-colors',
                                            'focus:border-indigo-500 focus:ring-indigo-500'
                                        )}
                                        type="text"
                                        disabled={busy}
                                        placeholder='Ad Soyad'
                                        {...register("cardHolderName", { required: true })}
                                    />


                                    <FormFieldError state={!!errors.cardHolderName} message={errors.cardHolderName?.message} />


                                </FormFieldWrapper>
                            </section>



                            <section className={classNames(
                                "bg-slate-100 hover:bg-slate-50",
                                "w-full rounded-md  py-2 px-2   ",
                                "shadow hover:shadow-md shadow-slate-300 transition-all",
                                "border hover:border-black/5 space-y-2 pb-8 "

                            )}>

                                <FormFieldWrapper>


                                    <label
                                        className={classNames(
                                            "font-medium text-sm pl-2 mb-4"
                                        )}
                                        htmlFor="card_number">
                                        Kart Numarası
                                    </label>

                                    <input
                                        className={classNames(
                                            'block w-full rounded-md shadow-sm sm:text-sm',
                                            'disabled:bg-slate-200 border-gray-300 transition-colors',
                                            'focus:border-indigo-500 focus:ring-indigo-500'
                                        )}
                                        type="tel"
                                        autoComplete="cc-number"
                                        disabled={busy}
                                        placeholder='Kart Numarası'
                                        value={cardNo}
                                        onChange={handleCardNoChange}
                                        inputMode="numeric"
                                        maxLength={19} />


                                    <FormFieldError state={!!errors.card_number} message={errors.card_number?.message} />


                                </FormFieldWrapper>
                            </section>

                            <section className={classNames(
                                "bg-slate-100 hover:bg-slate-50",
                                "w-full rounded-md  py-2 px-2   ",
                                "shadow hover:shadow-md shadow-slate-300 transition-all",
                                "border hover:border-black/5 space-y-2 pb-8 "

                            )}>
                                <div className="flex flex-row justify-between gap-4" >
                                    <FormFieldWrapper>

                                        <label
                                            className={classNames(
                                                "font-medium text-sm pl-2 mb-4"
                                            )}
                                            htmlFor="expiryDate">
                                            Geçerli tarih
                                        </label>


                                        <PatternFormat
                                            className={classNames(
                                                'block w-full rounded-md shadow-sm sm:text-sm',
                                                'disabled:bg-slate-200 border-gray-300 transition-colors',
                                                'focus:border-indigo-500 focus:ring-indigo-500'
                                            )}
                                            format="##/##"
                                            name="expiryDate"
                                            value={expiryDate}
                                            onChange={handleExpiryDateChange}
                                            placeholder='Örn: 06/26'
                                            mask="_"
                                        // valueIsNumericString
                                        />

                                        <FormFieldError state={!!errors.expiryDate} message={errors.expiryDate?.message} />

                                    </FormFieldWrapper>


                                    <FormFieldWrapper>

                                        <label
                                            className={classNames(
                                                "font-medium text-sm pl-2 mb-4"
                                            )}
                                            htmlFor="cvvNumber">
                                            CVV
                                        </label>

                                        <input
                                            className={classNames(
                                                'block w-full rounded-md shadow-sm sm:text-sm',
                                                'disabled:bg-slate-200 border-gray-300 transition-colors',
                                                'focus:border-indigo-500 focus:ring-indigo-500'
                                            )}
                                            disabled={busy}
                                            placeholder='CVV'
                                            type="number"
                                            inputMode="numeric"
                                            maxLength={4}
                                            {...register("cvvNumber", { required: true })}
                                        />


                                        <FormFieldError state={!!errors.cvvNumber} message={errors.cvvNumber?.message} />

                                    </FormFieldWrapper>

                                </div>
                            </section>

                        </div>

                        <button
                            className='bg-violet-600 text-white px-8 py-2 rounded-md w-full 
                            disabled:bg-violet-400 disabled:shadow-none
                            aria-disabled:bg-violet-400 aria-disabled:shadow-none'
                            type="submit"
                            disabled={busy}>
                            Ödeme Yap
                        </button>

                    </div>
                </form>
            </div>

        </div>

    </div>)
}

export default PaymentCardMarket

