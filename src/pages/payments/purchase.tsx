/* eslint-disable @typescript-eslint/no-unused-vars */
import { UserRoles } from '../../interface/auth.interface'
import { AppRoutes } from '../../config/appRoutes'
import type { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import classNames from "../../utils/classnames";
// import { trpc } from "../../utils/trpc";
// import { prisma } from "../../server/db/client";
import { checkTrial } from '../../utils/checkTrial';
import { useRouter } from 'next/router';
import PageCard from '../../components/card/Card';
import { Lira, Space } from "../../components/shared/HtmlCodes";
import { PRICING_MONTHLY, PRICING_ANNUALY } from '../../config/pricing';
import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import IconButton from '../../components/buttons/IconButton';
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { HiArrowLeft as BackIcon, HiPencil, HiPlus } from 'react-icons/hi';
import TopBarProgress from 'react-topbar-progress-indicator';
import { z } from 'zod';
import { FormFieldError, FormFieldWrapper } from '../../components/error-messages/FormError';
import { zodResolver } from '@hookform/resolvers/zod';
import ScrollToTop from '../../components/scroll-to-top/ScrollToTop';
import { Container, Stack, TextField, Typography } from '@mui/material';
import Card from '../../components/credit-card/card/Card';
import axios from 'axios';
import { PAYTR } from '../../config/constants';
import { trpc } from '../../utils/trpc';
import { Base64 } from 'js-base64';
import { notifyError } from '../../utils/notifications';
import { IpSchema } from '../../interface/zod.schema';
import getClientIp from '../../utils/getClientIp';
import dynamic from 'next/dynamic'

const DynamicPaymentCard = dynamic(() => import('../../components/purchase_plan/PaymentCard'), {
    ssr: false,
})

// "payment": "^2.4.6",
// "@types/payment": "^2.1.3",
// https://www.npmjs.com/package/payment

type PlanType = "BASIC" | "PRO" | "ULTIMATE"
// const x = trpc.payments.updateUserTime.useMutation()
// useEffect(() => {
// }, [plan, annual, step])
// const [pricing, setPricing] = useState<IPlanPricing>()
// vkmo 10
// tc 11

const basket = JSON.stringify([
    ['Örnek Ürün 1', '50.00', 1], // 1. ürün (Ürün Ad - Birim Fiyat - Adet)

]);

const merchant_id = PAYTR.merchant_id;
const merchant_key = PAYTR.merchant_key;
const merchant_salt = PAYTR.merchant_salt;
const user_basket = basket;
const merchant_oid = "IN" + Date.now(); // En fazla 64 karakter, Alfa numerik
// > microtime.now()
// 1297448895297028

const email = 'testnon3d@paytr.com'; // Müşterinizin sitenizde kayıtlı veya form vasıtasıyla aldığınız eposta adresi.
const payment_amount = '100.99'; // Tahsil edilecek tutar.
const currency = 'TL';
const test_mode = '1';
const user_name = 'PayTR Test';
const user_address = 'test test test'; // Müşterinizin sitenizde kayıtlı veya form aracılığıyla aldığınız adres bilgisi.
const user_phone = '05555555555';
const user_ip = '176.33.107.198';
const merchant_ok_url = 'http://affitime.com/payments/success';
// Ödeme sürecinde beklenmedik bir hata oluşması durumunda müşterinizin yönlendirileceği sayfa
// Bu sayfa siparişi iptal edeceğiniz sayfa değildir! Yalnızca müşterinizi bilgilendireceğiniz sayfadır!
const merchant_fail_url = 'http://affitime.com/payments/fail';
const debug_on = 1;
const client_lang = 'tr'; //Ödeme süreci dil seçeneği tr veya en.
const payment_type = 'card'; // Ödeme türü
const installment_count = '0'; // Taksit Sayısı
const non_3d = '1'; //3d'siz işlem
const card_type = '';  // advantage, axess, combo, bonus, cardfinans, maximum, paraf, world, saglamkart
//non3d işlemde, başarısız işlemi test etmek için 1 gönderilir (test_mode ve non_3d değerleri 1 ise dikkate alınır!)
const non3d_test_failed = '0';

const paytr_post_url = "https://www.paytr.com/odeme";

// (Fatura bilgileri: VKN/TCKN * , Unvan, Ad, Soyad, Vergi Dairesi, Ülke, Adres )
interface IBillingFormData {
    vkn: string;
    tckn: string;
    title: string;
    fname: string;
    lname: string;
    taxOffice: string;
    address: string;
}
// z.number().default(0),
const taxinfoValidationSchema = z.object({
    vkn: z.string().trim().min(10, "10 karakter olmalı"),
    tckn: z.string().trim().min(11, "11 karakter olmalı"),
    title: z.string().trim().min(2, "En az 2 karakter olmalı"),
    fname: z.string().trim().min(2, "En az 2 karakter olmali"),
    lname: z.string().trim().min(2, "En az 2 karakter olmali"),
    taxOffice: z.string().trim().min(2, "En az 2 karakter olmali"),
    address: z.string().trim().min(8, "Geçerli bir adres giriniz"),

}).required();
// taxinfo {"vkn":"123123123123","tckn":"29170131313","title":"qeqeq","fname":"burak","lname":"mestan","taxOffice":"adana vd","address":"some address that is valid"}
const Purchase = () => {

    const { back, query } = useRouter()
    const [busy, setBusy] = useState(false)
    const [invalidCoupon, setInvalidCoupon] = useState({ error: false, message: "" })

    const plan = (query.plan as string).toUpperCase() as PlanType
    const annual = (query.ann as string) === "true"
    const s = query.s as string
    const [step, setStep] = useState(s)
    const [counter, setCounter] = useState(0)

    const checkCoupon = (event: React.FormEvent<HTMLFormElement>) => {
        // event.preventDefault()
        // console.log(event.target.coupon.value)

        // if (counter > 3) return setInvalidCoupon({ error: true, message: "3 denemeden fazla kod giremezsiniz" });

        // if (event.target.coupon.value !== "affi") {
        //     setCounter((x) => x + 1)
        //     return setInvalidCoupon({ error: true, message: "İndirim kodu geçersiz" })
        // }

    }

    const total = useMemo(() => {

        const res = annual ? PRICING_ANNUALY[plan] : PRICING_MONTHLY[plan]
        const calc = annual ? (parseInt(res) * 12) : res

        return String(calc)
    }, [plan, annual])

    return (
        <div className='containerx mx-auto px-6 sm:px-24 mt-24 max-w-[1280px] pb-16 '>
            <Head>
                <title>Affitime | Fatura Bilgileri</title>
            </Head>
            <PageCard>
                <div className="flex items-start">

                    <div className="a bg-redx-100 w-full">
                        <h1 className="text-xl font-bold mb-4 text-slate-500">
                            1 {annual ? "Yıllık" : "Aylık"} {plan} Plan
                        </h1>

                        <p className="text-lg">
                            {annual ? PRICING_ANNUALY[plan] : PRICING_MONTHLY[plan]}  <Lira size='18px' /> / Ay - {annual ? "Yıllık faturalandırılır" : "Aylık faturalandırılır"}
                        </p>
                        <p className="text-lg">
                            <b>Toplam: </b>{total} <Lira size='18px' />
                        </p>

                      { false &&  <form onSubmit={checkCoupon}>
                            <section className={classNames(
                                "bg-slate-100 hover:bg-slate-50",
                                "w-[38ch] rounded-md  py-2 px-2  mt-8 ",
                                "shadow hover:shadow-md shadow-slate-300 transition-all",
                                "border hover:border-black/5  pb-4 space-y-8"
                            )}>
                                <FormFieldWrapper>
                                    <label
                                        className={classNames(
                                            "font-medium text-sm pl-2 mb-4 block"
                                        )}
                                        htmlFor="cardHolderName">
                                        İndirim Kodu
                                        <small className='block'>İndirim kodunuz varsa girin</small>
                                    </label>
                                    <input
                                        className={classNames(
                                            'block w-full rounded-md shadow-sm sm:text-sm',
                                            'disabled:bg-slate-200 border-gray-300 transition-colors',
                                            'focus:border-indigo-500 focus:ring-indigo-500'
                                        )}
                                        type="text"
                                        name='coupon'
                                        disabled={busy}
                                        placeholder='Kod numarasi'
                                    />
                                    <FormFieldError state={invalidCoupon.error} message={"İndirim kodu geçersiz"} />
                                </FormFieldWrapper>
                                <IconButton
                                    title={"Indirim kodu Onayla"}
                                    disabled={busy}
                                    twClasses="w-full"
                                    fn={() => null} />
                            </section>

                        </form>}

                    </div>

                    <IconButton
                        title={"Geri Git"}
                        disabled={busy}
                        icon={<BackIcon color="white" size="16px" />}
                        twClasses="ml-auto w-38"
                        fn={back} />

                </div>

            </PageCard>

            {step === "0" && <TaxInfo setStep={setStep} />}
            {step === "1" && <ScrollToTop> <DynamicPaymentCard /> </ScrollToTop>}

        </div>
    )
}

export default Purchase




type TaxProps = {
    setStep: (step: string) => void
}
const TaxInfo: React.FC<TaxProps> = ({ setStep }) => {

    const busy = false

    const { register, handleSubmit, formState: { errors } } = useForm<IBillingFormData>({
        resolver: zodResolver(taxinfoValidationSchema),
        reValidateMode: 'onBlur',
        mode: 'onBlur',
    });


    const onSubmitTaxInfo: SubmitHandler<IBillingFormData> = async (data) => {
        localStorage.setItem("taxinfo", JSON.stringify(data))
        setStep("1")

    }



    return (
        <PageCard>
            <h1 className="text-xl font-bold mb-4 text-slate-500">
                Fatura Bilgileri
            </h1>

            <div className="">

                <form className="flex flex-col space-y-4" onSubmit={handleSubmit(onSubmitTaxInfo)} >


                    {/*  ISIM  */}
                    <section className={classNames(
                        "bg-slate-100 hover:bg-slate-50",
                        "w-full rounded-md  py-2 px-2   ",
                        "shadow hover:shadow-md shadow-slate-300 transition-all",
                        "border hover:border-black/5 xspace-y-2 pb-8 ",
                        'flex flex-col md:flex-row items-center gap-8 md:gap-2'

                    )}>

                        <FormFieldWrapper>


                            <label
                                className={classNames(
                                    "font-medium text-sm pl-2 mb-4"
                                )}
                                htmlFor="title">
                                Ünvan
                            </label>

                            <input
                                className={classNames(
                                    'block rounded-md shadow-sm sm:text-sm w-full ',
                                    'disabled:bg-slate-200 border-gray-300 transition-colors',
                                    'focus:border-indigo-500 focus:ring-indigo-500'
                                )}
                                type="text"
                                disabled={busy}
                                placeholder='Ünvan'
                                {...register("title", { required: true })}
                            />

                            <FormFieldError state={!!errors.title} message={errors.title?.message} />


                        </FormFieldWrapper>

                        <FormFieldWrapper>


                            <label
                                className={classNames(
                                    "font-medium text-sm pl-2 mb-4"
                                )}
                                htmlFor="fname">
                                Ad
                            </label>

                            <input
                                className={classNames(
                                    'block rounded-md shadow-sm sm:text-sm w-full ',
                                    'disabled:bg-slate-200 border-gray-300 transition-colors',
                                    'focus:border-indigo-500 focus:ring-indigo-500'
                                )}
                                type="text"
                                disabled={busy}
                                placeholder='Ad'
                                {...register("fname", { required: true })}
                            />

                            <FormFieldError state={!!errors.fname} message={errors.fname?.message} />


                        </FormFieldWrapper>

                        <FormFieldWrapper>


                            <label
                                className={classNames(
                                    "font-medium text-sm pl-2 mb-4"
                                )}
                                htmlFor="lname">
                                Soyad
                            </label>

                            <input
                                className={classNames(
                                    'block rounded-md shadow-sm sm:text-sm w-full ',
                                    'disabled:bg-slate-200 border-gray-300 transition-colors',
                                    'focus:border-indigo-500 focus:ring-indigo-500'
                                )}
                                type="text"
                                disabled={busy}
                                placeholder='Soyad'
                                {...register("lname", { required: true })}
                            />

                            <FormFieldError state={!!errors.lname} message={errors.lname?.message} />


                        </FormFieldWrapper>


                    </section>


                    {/*  VKN/TCKN  */}
                    <section className={classNames(
                        "bg-slate-100 hover:bg-slate-50",
                        "w-full rounded-md  py-2 px-2   ",
                        "shadow hover:shadow-md shadow-slate-300 transition-all",
                        "border hover:border-black/5 pb-8 ",
                        'flex flex-col md:flex-row items-center gap-2 md:gap-2'

                    )}>

                        <FormFieldWrapper>


                            <label
                                className={classNames(
                                    "font-medium text-sm pl-2 mb-4"
                                )}
                                htmlFor="title">
                                VKN
                            </label>



                            <input
                                className={classNames(
                                    'block rounded-md shadow-sm sm:text-sm w-full xl:w-80',
                                    'disabled:bg-slate-200 border-gray-300 transition-colors',
                                    'focus:border-indigo-500 focus:ring-indigo-500'
                                )}
                                type="text"
                                disabled={busy}
                                placeholder='Vergi Kimlik No'
                                {...register("vkn", { required: true })}
                            />

                            <FormFieldError state={!!errors.vkn} message={errors.vkn?.message} />


                        </FormFieldWrapper>


                        <FormFieldWrapper>


                            <label
                                className={classNames(
                                    "font-medium text-sm pl-2 mb-4"
                                )}
                                htmlFor="title">
                                TCKN
                            </label>



                            <input
                                className={classNames(
                                    'block rounded-md shadow-sm sm:text-sm w-full xl:w-80',
                                    'disabled:bg-slate-200 border-gray-300 transition-colors',
                                    'focus:border-indigo-500 focus:ring-indigo-500'
                                )}
                                type="text"
                                disabled={busy}
                                placeholder='TC no'
                                {...register("tckn", { required: true })}
                            />

                            <FormFieldError state={!!errors.tckn} message={errors.tckn?.message} />


                        </FormFieldWrapper>


                    </section>



                    {/*  VKN/TCKN  */}
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
                                htmlFor="title">
                                Vergi dairesi
                            </label>

                            <input
                                className={classNames(
                                    'block rounded-md shadow-sm sm:text-sm w-full xl:w-80',
                                    'disabled:bg-slate-200 border-gray-300 transition-colors',
                                    'focus:border-indigo-500 focus:ring-indigo-500'
                                )}
                                type="text"
                                disabled={busy}
                                placeholder='Vergi Dairesi'
                                {...register("taxOffice", { required: true })}
                            />

                            <FormFieldError state={!!errors.taxOffice} message={errors.taxOffice?.message} />


                        </FormFieldWrapper>


                    </section>

                    {/*  VKN/TCKN  */}
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
                                htmlFor="title">
                                Adres
                            </label>

                            <input
                                className={classNames(
                                    'block rounded-md shadow-sm sm:text-sm w-full',
                                    'disabled:bg-slate-200 border-gray-300 transition-colors',
                                    'focus:border-indigo-500 focus:ring-indigo-500'
                                )}
                                type="text"
                                disabled={busy}
                                placeholder='Adres'
                                {...register("address", { required: true })}
                            />

                            <FormFieldError state={!!errors.address} message={errors.address?.message} />


                        </FormFieldWrapper>


                    </section>





                    {/* Submit */}
                    <button
                        disabled={busy}
                        onClick={() => {
                            // console.log(selectedCat);


                        }}
                        type='submit'
                        className={classNames(
                            "bg-violet-600 hover:bg-violet-700 transition-colors",
                            "flex items-center justify-center flex-nowrap space-x-2",
                            "shadow-sm hover:shadow-lg rounded-md ",
                            "py-2 px-8",
                            "disabled:bg-violet-400 disabled:shadow-none"
                        )}

                    >

                        <HiPlus color="white" size="16px" />

                        <span className="text-slate-50 text-xs font-medium tracking-wide text-center">
                            Sonraki
                        </span>
                    </button>


                </form>
            </div>


        </PageCard>
    )
}


export const getServerSideProps: GetServerSideProps = async (context) => {

    const session = await getSession(context)

    if (!session) return {
        redirect: {
            destination: AppRoutes.SIGNIN,
            permanent: false
        }
    }

    if (session.role !== UserRoles.VENDOR) return {
        redirect: {
            destination: `/${session.role.toLowerCase()}/dashboard`,
            permanent: false
        }
    }


    // const isTrialEnded = await checkTrial(session)
    // console.log("isTrialEnded: ", isTrialEnded);

    // if (!isTrialEnded) return {
    //     redirect: {
    //         destination: AppRoutes.VENDOR_DASHBOARD,
    //         permanent: false
    //     }
    // }



    return { props: {} }
}