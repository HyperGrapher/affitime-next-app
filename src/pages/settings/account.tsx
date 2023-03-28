import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { HiPencil } from 'react-icons/hi';
import TopBarProgress from "react-topbar-progress-indicator";
import { z } from 'zod';
import IconButton from "../../components/buttons/IconButton";
import PageCard from "../../components/card/Card";
import { FormFieldError, FormFieldWrapper } from '../../components/error-messages/FormError';
import { AppRoutes } from "../../config/appRoutes";
import { UserRoles } from "../../interface/auth.interface";
import { IpSchema } from "../../interface/zod.schema";
import classNames from '../../utils/classnames';
import getClientIp from "../../utils/getClientIp";
import { notifyError, notifySuccessBR } from '../../utils/notifications';
import { trpc } from '../../utils/trpc';


interface IFormData {
    oldPassword: string;
    password1: string;
    password2: string;

}

const validationSchema = z.object({
    oldPassword: z.string().trim().min(8, "En az 8 karakter olmalı!"),
    password1: z.string().trim().min(8, "En az 8 karakter olmalı!"),
    password2: z.string().trim().min(8, "En az 8 karakter olmalı!"),
}).required().superRefine(({ password1, password2 }, ctx) => {
    if (password1 !== password2) {
        ctx.addIssue({
            code: "custom",
            message: "Şifre tekrarı aynı olmalı",
            path: ['password2']
        });
    }
});


const Account = () => {
    const [busy, setBusy] = useState(false)
    const updatePassword = trpc.auth.updatePassword.useMutation()
    const endTrialForTest = trpc.testing.endTrialForTest.useMutation()
    const puchaseForTest = trpc.testing.purchasePackForTest.useMutation()
    const { replace } = useRouter()
    const { data: session } = useSession()

    const { register, handleSubmit, reset, formState: { errors } } = useForm<IFormData>({
        resolver: zodResolver(validationSchema),
        reValidateMode: 'onBlur',
        mode: 'onBlur',
    });


    const onSubmit: SubmitHandler<IFormData> = async (data) => {
        setBusy(true)
        updatePassword.mutate(data, {
            onSuccess: () => {
                notifySuccessBR("Bilgileriniz Güncellendi!")
            },
            onError(error) {
                console.log(error)
                notifyError(error.message ?? 'Hata. Bilgileriniz Güncellenemedi!')
            },
            onSettled: () => {
                reset()
                setBusy(false)
            }
        })

    }

    // ! TEST FUNC
    const payForTest = async () => {
        const ipData = await getClientIp()
        const userIp = IpSchema.parse(ipData)

        const tax = localStorage.getItem("taxinfo")

        if (!tax) return notifyError('Vergi bilgileri eksik')
        const taxInfo = JSON.parse(tax)
        type PlanType = "BASIC" | "PRO" | "ULTIMATE"
        const plan = "BASIC" as PlanType
        const annual = false

        const datam = {
            user_ip: userIp.ip,
            currency: 'TL',
            user_address: taxInfo.address,
            plan,
            annual
        }

        puchaseForTest.mutate(datam, {
            onSuccess: (data) => {
                console.log("ok", data.payment_amount);
                notifySuccessBR('Test payment OK')

                setTimeout(() => {
                    replace(AppRoutes.PAYMENT_SUCCESS)
                }, 3000);
            },
            onError(error) {
                console.log(error)
                notifyError('Ödeme sırasında bir hata oluştu!')
                setBusy(false)
            },

        })
    }


    return (
        <div className={"auth-container"}>
            <Head>
                <title>Affitime | Ayarlar</title>
            </Head>

            {busy && <TopBarProgress />}

            <PageCard>
                <h2 className="text-center text-lg font-bold text-slate-500">Bilgilerinizi Gücelleyin</h2>

                <div className="w-64 flex flex-col gap-4 mx-auto">

                    <form className='flex flex-col gap-10 my-12' onSubmit={handleSubmit(onSubmit)}>

                        <FormFieldWrapper>

                            <label
                                className={classNames(
                                    "font-medium text-sm pl-2 "
                                )}
                                htmlFor="title">
                                Eski şifreniz
                            </label>

                            <input
                                className={classNames(
                                    'disabled:bg-slate-200 block w-full',
                                    'rounded-md border-gray-300 shadow-sm ',
                                    'focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                                )}
                                disabled={busy}
                                type="password"
                                placeholder='Eski şifreniz'
                                {...register("oldPassword", { required: true })}
                            />

                            <FormFieldError state={!!errors.oldPassword} message={errors.oldPassword?.message} />

                        </FormFieldWrapper>


                        <FormFieldWrapper>

                            <label
                                className={classNames(
                                    "font-medium text-sm pl-2 "
                                )}
                                htmlFor="title">
                                Yeni şifreniz
                            </label>

                            <input
                                className={classNames(
                                    'disabled:bg-slate-200 block w-full',
                                    'rounded-md border-gray-300 shadow-sm ',
                                    'focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                                )}
                                disabled={busy}
                                type="password"
                                placeholder='Yeni şifreniz'
                                {...register("password1", { required: true })}
                            />

                            <FormFieldError state={!!errors.password1} message={errors.password1?.message} />

                        </FormFieldWrapper>


                        <FormFieldWrapper>

                            <label
                                className={classNames(
                                    "font-medium text-sm pl-2 "
                                )}
                                htmlFor="title">
                                Yeni şifre tekrarı
                            </label>

                            <input
                                className={classNames(
                                    'disabled:bg-slate-200 block w-full',
                                    'rounded-md border-gray-300 shadow-sm ',
                                    'focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                                )}
                                disabled={busy}
                                type="password"
                                placeholder='Yeni şifrenizi tekrarlayın'
                                {...register("password2", { required: true })}
                            />

                            <FormFieldError state={!!errors.password2} message={errors.password2?.message} />

                        </FormFieldWrapper>


                        <IconButton
                            icon={<HiPencil color="white" size={"16px"} />}
                            title="Güncelle"
                            disabled={busy}
                            fn={() => null} />
                    </form>



                </div>
            </PageCard>

            {(session?.role === UserRoles.VENDOR && (session.email === 'wendy@email.com' || session.email === 'veronica@email.com')) && <div id="testing" className="text-center flex flex-col gap-2 px-8">
                <h3 className="text-center text-red-500">Bu alan sadece wendy@email.com icin goruntulenir</h3>
                {/* <h3 className="text-center">{session.pro ? "Plan satin almis" : "Plan satin alinmamis"}</h3> */}
                <h3 className="text-center">{session.trial ? "Trial surecinde veya sonlanmis" : "Plan Satin Alinmis"}</h3>
                <button className="text-slate-100 mt-4 py-2 px-3 rounded-md bg-slate-700 hover:bg-slate-500 transition-all duration-500"
                    onClick={() => {

                        endTrialForTest.mutate(undefined, {
                            onSuccess: () => {
                                notifySuccessBR("Trial Sonlandi!")

                                setTimeout(() => {

                                    replace(AppRoutes.VENDOR_DASHBOARD)
                                }, 1500);

                            },
                            onError(error) {
                                console.log(error)
                                notifyError(error.message ?? 'Hata. Trial Güncellenemedi!')
                            },

                        })

                    }}>
                    Trial suresini veya Plani sonlandir
                </button>


                <button
                    onClick={payForTest}
                    className="text-slate-100 mt-4 py-2 px-3 rounded-md bg-slate-700 hover:bg-slate-500 transition-all duration-500">
                    Basic plan satin al
                </button>


            </div>}

        </div>
    )
}

export default Account