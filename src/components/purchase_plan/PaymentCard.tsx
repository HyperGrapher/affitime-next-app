'use client'
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { HiArrowLeft as BackIcon, HiPencil, HiPlus } from 'react-icons/hi';
import { z } from 'zod';
import { FormFieldError, FormFieldWrapper } from '../../components/error-messages/FormError';
import { Container, Stack, TextField, Typography } from '@mui/material';
import Card from '../../components/credit-card/card/Card';
import axios from 'axios';
import { PAYTR, PAYTR_PLAN_PAYMENT_URL } from '../../config/constants';
import { trpc } from '../../utils/trpc';
import { Base64 } from 'js-base64';
import { notifyError, notifySuccessBR } from '../../utils/notifications';
import { IpSchema } from '../../interface/zod.schema';
import getClientIp from '../../utils/getClientIp';
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import classNames from "../../utils/classnames";
import { zodResolver } from '@hookform/resolvers/zod';
import { PatternFormat } from 'react-number-format';
import { IPlanPaymentData } from "../../interface/payments.interface";


// axios.post(paytr_post_url, {
//     firstName: 'Fred',
//     lastName: 'Flintstone'
//   })
//   .then(function (response) {
//     console.log(response);
//   })
//   .catch(function (error) {
//     console.log(error);
//   });
type PlanType = "BASIC" | "PRO" | "ULTIMATE"

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


const PaymentCard: React.FC = () => {

    const { query } = useRouter()
    const [busy, setBusy] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const plan = (query.plan as string).toUpperCase() as PlanType
    const annual = (query.ann as string) === "true"

    const [cardNo, setCardNo] = useState("");
    const [datam, setData] = useState<IPlanPaymentData>();

    useEffect(() => {

    }, [])

    const handleCardNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value =
            e.target.value
                .replace(/\s|[^0-9]+/g, "")
                .match(/.{1,4}/g)
                ?.join(" ") ?? "";

        setCardNo(value);
        setValue('card_number', value);
    };

    const [expiryDate, setExpiryDate] = useState("");

    const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setExpiryDate(e.target.value);
        setValue('expiryDate', e.target.value);
    };

    const { register, handleSubmit, setValue, formState: { errors }, watch } = useForm<ICardFormData>({
        resolver: zodResolver(validationSchema),
        reValidateMode: 'onBlur',
        mode: 'onBlur',
    });

    // 1234123412341234

    const taxInfo = useMemo(() => {

        const tax = localStorage.getItem("taxinfo")

        if (!tax) return null
        return JSON.parse(tax)
    }, [])

    const puchase = trpc.purchase.purchasePack.useMutation()
    const onSubmit: SubmitHandler<ICardFormData> = async (cardData) => {
        console.log({ cardData });

        setBusy(true)

        if (!taxInfo) return notifyError('Adres bilgisi bulunamadi!')

        const ipData = await getClientIp()
        const userIp = IpSchema.parse(ipData)

        console.log({
            plan,
            annual
        });


        const datam = {
            user_ip: userIp.ip,
            currency: 'TL',
            user_address: taxInfo.address,
            plan,
            annual
        }


        puchase.mutate(datam, {
            onSuccess: (data) => {
                // replace(AppRoutes.PARTNER_DASHBOARD)
                console.log("ok", data.payment_amount);

                // 4355 0843 5508 4358	
                // 4355 0843 5508 4358
                const [month, year] = cardData.expiryDate.split('/')

                const aa: IPlanPaymentData = {
                    ...data,
                    cc_owner: cardData.cardHolderName,
                    card_number: cardData.card_number.replaceAll(' ', ''),
                    expiry_month: month,
                    expiry_year: year,
                    cvv: cardData.cvvNumber,
                    payment_amount: "1290.00",
                    merchant_ok_url: "https://affitime.com/payments/success",
                    merchant_fail_url: "https://affitime.com/payments/fail",
                    user_name: "test user",
                }

                console.log(aa);
                setData(aa)

                setTimeout(() => {
                    buttonRef.current?.click()

                }, 3500);



                /*
{
  "status": "failed",
  "reason": "Zorunlu alan degeri gecersiz veya gonderilmedi (odeme spp): no_installment"
}
                */

                // axios.post(`/odeme`, 
                // `cc_owner=${aa.cc_owner}&card_number=${aa.card_number}&expiry_month=${aa.expiry_month}
                // &expiry_year=${aa.expiry_year}&cvv=${aa.cvv}&&payment_amount=${aa.payment_amount}
                // &merchant_id=${aa.merchant_id}&paytr_token=${aa.paytr_token}`,

                // {
                //     headers: {
                //         "Content-Type": "application/x--www-form-urlencoded",
                //         "Access-Control-Allow-Origin": "*",
                //         "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
                //         "Access-Control-Allow-Headers": "Origin, Content-Type, X-Auth-Token, Authorization, Accept,charset,boundary,Content-Length"
                //     },
                //     baseURL: 'https://www.paytr.com'
                //     // data: {
                //     //     ...postData
                //     // }
                // }).then(response => {
                //     console.log('success');
                //     notifySuccessBR("Odeme basarili..")
                //     console.log(response);
                // }).catch(function (error) {
                //     console.log('error');
                //     notifyError('Odeme hatasi.')
                //     console.log(error);
                // });



            },
            onError(error) {
                console.log(error)
                notifyError('DB Hata.')
                //   replace(AppRoutes.PARTNER_DASHBOARD)
                // setBusy(false)
                setBusy(false)
            },

        })

    }
    const doPayment = async () => {



    }


    return (<div className="bg-white rounded-xl px-4 py-8 w-full mx-auto shadow-xl">

        <h1 className="text-xl text-center font-bold mb-4 text-slate-500">
            Ödeme Yapın
        </h1>

        <form id="post_form" className="hidden" action={PAYTR_PLAN_PAYMENT_URL} method="post">
            <input type="hidden" name="card_number" value={datam?.card_number} />
            <input type="hidden" name="cc_owner" value={datam?.cc_owner} />
            <input type="hidden" name="expiry_month" value={datam?.expiry_month} />
            <input type="hidden" name="expiry_year" value={datam?.expiry_year} />
            <input type="hidden" name="cvv" value={datam?.cvv} />
            <input type="hidden" name="merchant_id" value={datam?.merchant_id} />
            <input type="hidden" name="user_ip" value={datam?.user_ip} />
            <input type="hidden" name="merchant_oid" value={datam?.merchant_oid} />
            <input type="hidden" name="email" value={datam?.email} />
            <input type="hidden" name="payment_type" value={datam?.payment_type} />
            <input type="hidden" name="payment_amount" value={datam?.payment_amount} />
            <input type="hidden" name="currency" value={datam?.currency} />
            <input type="hidden" name="test_mode" value={datam?.test_mode} />
            <input type="hidden" name="non_3d" value={datam?.non_3d} />
            <input type="hidden" name="merchant_ok_url" value={datam?.merchant_ok_url} />
            <input type="hidden" name="merchant_fail_url" value={datam?.merchant_fail_url} />
            <input type="hidden" name="user_name" value={datam?.user_name} />
            <input type="hidden" name="user_address" value={datam?.user_address} />
            <input type="hidden" name="user_phone" value={datam?.user_phone} />
            <input type="hidden" name="user_basket" value={datam?.user_basket} />
            <input type="hidden" name="debug_on" value={datam?.debug_on} />
            <input type="hidden" name="debug_on" value={datam?.debug_on} />
            <input type="hidden" name="client_lang" value={datam?.client_lang} />
            <input type="hidden" name="paytr_token" value={datam?.paytr_token} />
            <input type="hidden" name="non3d_test_failed" value={datam?.non3d_test_failed} />
            <input type="number" name="installment_count" value={0} />
            {/* <input type="hidden" name="card_type" value={"advantage"} /> */}

            <button id="post" ref={buttonRef}>click</button>
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

                        <div className="flex flex-col bg-redx-100 w-full justify-between gap-6">


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
                                            // type="text"
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

                        {/* <SubmitButton busy={busy} text={'Ödeme Yap'} /> */}


                        <button
                            className='bg-violet-600 text-white px-8 py-2 rounded-md w-full'
                            type="submit"
                            disabled={busy}
                        >
                            Ödeme Yap
                        </button>

                    </div>
                </form>
            </div>

        </div>

    </div>)
}

export default PaymentCard

