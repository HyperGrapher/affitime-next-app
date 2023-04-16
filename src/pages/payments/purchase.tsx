/* eslint-disable @typescript-eslint/no-unused-vars */
import { zodResolver } from '@hookform/resolvers/zod';
import type { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { HiArrowLeft as BackIcon, HiPlus } from 'react-icons/hi';
import IconButton from '../../components/buttons/IconButton';
import PageCard from '../../components/card/Card';
import { FormFieldError, FormFieldWrapper } from '../../components/error-messages/FormError';
import ScrollToTop from '../../components/scroll-to-top/ScrollToTop';
import { Lira } from "../../components/shared/HtmlCodes";
import { AppRoutes } from '../../config/appRoutes';
import { PRICING_ANNUALY, PRICING_MONTHLY } from '../../config/pricing';
import { UserRoles } from '../../interface/auth.interface';
import { taxinfoValidationSchema } from '../../interface/zod.schema';
import classNames from "../../utils/classnames";
import { numberWithCommas } from "../../utils/helpers";
import { notifyError } from '../../utils/notifications';
import { trpc } from '../../utils/trpc';


const DynamicPaymentCard = dynamic(() => import('../../components/purchase_plan/PaymentCard'), {
    ssr: false,
})

// "payment": "^2.4.6",
// "@types/payment": "^2.1.3",
// https://www.npmjs.com/package/payment

type PlanType = "BASIC" | "PRO" | "ULTIMATE"

const Purchase = () => {

    const { back, query } = useRouter()
    const [busy, setBusy] = useState(false)

    const plan = (query.plan as string).toUpperCase() as PlanType
    const annual = (query.ann as string) === "true"
    const s = query.s as string
    const [step, setStep] = useState(s)

    const total = useMemo(() => {

        const res = annual ? PRICING_ANNUALY[plan] : PRICING_MONTHLY[plan]
        const calc = annual ? (parseInt(res) * 12) : res

        return String(calc)
    }, [plan, annual])

    return (
        <div className='containerx mx-auto px-0 md:px-6 sm:px-24 mt-24 max-w-[1280px] pb-16 '>
            <Head>
                <title>Affitime | Ödeme Yapın</title>
            </Head>
            <PageCard>
                <div className="flex items-start px-2">

                    <div className="w-full">
                        <h1 className="text-sm md:text-xl font-bold mb-4 text-slate-500">
                            1 {annual ? "Yıllık" : "Aylık"} {plan} Plan
                        </h1>

                        <p className="text-sm md:text-lg whitespace-nowrapx">
                            {annual ? PRICING_ANNUALY[plan] : PRICING_MONTHLY[plan]}  <Lira size='18px' /> / Ay - {annual ? "Yıllık faturalandırılır" : "Aylık faturalandırılır"}
                        </p>
                        <p className="text-sm md:text-lg">
                            <b>Toplam: </b>{numberWithCommas(total)} <Lira size='18px' />
                        </p>

                        {false && <form onSubmit={() => null}>
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
                                    <FormFieldError state={false} message={"İndirim kodu geçersiz"} />
                                </FormFieldWrapper>
                                <IconButton
                                    title={"Indirim kodu Onayla"}
                                    disabled={busy}
                                    twClasses="w-full"
                                    fn={() => null} />
                            </section>

                        </form>}

                    </div>

                    <div className='ml-auto scale-75 md:scale-100'>
                        <IconButton
                            title={"Geri Git"}
                            disabled={busy}
                            icon={<BackIcon color="white" size="16px" />}
                            twClasses="ml-auto w-38"
                            fn={back} />
                    </div>

                </div>
            </PageCard>

            {step === "0" && <TaxInfo setStep={setStep} />}
            {step === "1" && <ScrollToTop> <DynamicPaymentCard /> </ScrollToTop>}

        </div>
    )
}

export default Purchase


interface IBillingFormData {
    vkn: string;
    tckn: string;
    title: string;
    fname: string;
    lname: string;
    taxOffice: string;
    address: string;
}

type TaxProps = {
    setStep: (step: string) => void
}
const TaxInfo: React.FC<TaxProps> = ({ setStep }) => {

    const [busy, setBusy] = useState(false)
    const { register, handleSubmit, setValue, formState: { errors } } = useForm<IBillingFormData>({
        resolver: zodResolver(taxinfoValidationSchema),
        reValidateMode: 'onBlur',
        mode: 'onBlur',
    });

    const upsertTaxInfo = trpc.purchase.upsertTaxInfo.useMutation()

    trpc.purchase.getTaxInfo.useQuery(undefined, {

        onSuccess(data) {
            setValue("fname", data?.fname ?? '')
            setValue("lname", data?.lname ?? '')
            setValue("title", data?.title ?? '')
            setValue("vkn", data?.vkn ?? '')
            setValue("tckn", data?.tckn ?? '')
            setValue("taxOffice", data?.taxOffice ?? '')
            setValue("address", data?.address ?? '')
        }
    })



    const onSubmitTaxInfo: SubmitHandler<IBillingFormData> = async (data) => {
        setBusy(true)
        localStorage.setItem("taxinfo", JSON.stringify(data))

        upsertTaxInfo.mutate(data, {

            onError(error) {
                console.error(error)
                notifyError('Hata. Vergi bilgileri eklenmedi')
            },
            onSettled() {
                setBusy(false)
                setStep("1")

            }
        })


    }


    return (
        <PageCard>
            <h1 className="text-base md:text-xl font-bold mb-4 text-slate-500">
                Fatura Bilgileri
            </h1>

            <div className="px-2">

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

    return { props: {} }
}