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


const DynamicPaymentCardMarket = dynamic(() => import('../../components/purchase_plan/PaymentCardMarket'), {
    ssr: false,
})

// "payment": "^2.4.6",
// "@types/payment": "^2.1.3",
// https://www.npmjs.com/package/payment

type PlanType = "BASIC" | "PRO" | "ULTIMATE"

const Purchase = () => {

    const { back, query } = useRouter()
    const [busy, setBusy] = useState(false)

    return (
        <div className='containerx mx-auto px-0 md:px-6 sm:px-24 mt-24 max-w-[1280px] pb-16 '>
            <Head>
                <title>Affitime | Market Ödeme Yapın</title>
            </Head>
            <PageCard>
                <div className="flex items-start px-2">

                    <div className="w-full">
                        {/* <h1 className="text-sm md:text-xl font-bold mb-4 text-slate-500">
                            1 {annual ? "Yıllık" : "Aylık"} {plan} Plan
                        </h1>

                        <p className="text-sm md:text-lg whitespace-nowrapx">
                            {annual ? PRICING_ANNUALY[plan] : PRICING_MONTHLY[plan]}  <Lira size='18px' /> / Ay - {annual ? "Yıllık faturalandırılır" : "Aylık faturalandırılır"}
                        </p>
                        <p className="text-sm md:text-lg">
                            <b>Toplam: </b>{numberWithCommas(total)} <Lira size='18px' />
                        </p> */}


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

            {/* {step === "0" && <TaxInfo setStep={setStep} />} */}
            <ScrollToTop> <DynamicPaymentCardMarket /> </ScrollToTop>

        </div>
    )
}

export default Purchase


