import { zodResolver } from '@hookform/resolvers/zod';
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { HiPencil, HiUpload as IcUpload } from 'react-icons/hi';
import TopBarProgress from "react-topbar-progress-indicator";
import { z } from 'zod';
import IconButton from "../../../components/buttons/IconButton";
import PageCard from "../../../components/card/Card";
import { FormFieldError, FormFieldWrapper } from '../../../components/error-messages/FormError';
import { AppRoutes } from "../../../config/appRoutes";
import classNames from '../../../utils/classnames';
import { notifyError, notifySuccessBR } from '../../../utils/notifications';
import { trpc } from '../../../utils/trpc';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'

type ServerSideType = {
    passResetId: string
}
export const getServerSideProps: GetServerSideProps<ServerSideType> = async (context) => {

    const passResetId = context.params?.passResetId as string



    return { props: { passResetId } }
}


interface IPasswordFormData {
    password1: string;
    password2: string;

}

const passwordValidationSchema = z.object({
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

const ResetPassword = ({ passResetId }: InferGetServerSidePropsType<typeof getServerSideProps>) => {

    const [busy, setBusy] = useState(false)
    const router = useRouter()

    const resetPass = trpc.auth.resetPassword.useMutation()

    const { register, handleSubmit, reset, formState: { errors } } = useForm<IPasswordFormData>({
        resolver: zodResolver(passwordValidationSchema),
        reValidateMode: 'onBlur',
        mode: 'onBlur',
    });

    const onSubmit: SubmitHandler<IPasswordFormData> = async (data) => {
        setBusy(true)
        const resetData = { ...data, passResetId }
        resetPass.mutate(resetData, {
            onSuccess: () => {
                notifySuccessBR("Şifren yenilendi! Giriş yapabilirsin!")
                router.replace(AppRoutes.SIGNIN)
            },
            onError(error) {
                notifyError(error.message ?? 'Hata. Bilgileriniz Güncellenemedi!')
            },
            onSettled: () => {
                reset()
                setBusy(false)
            }
        })

    }


    return (
        <PageCard>
            {busy && <TopBarProgress />}
            <Head>
                <title>Affitime | Şifre yenileme</title>
            </Head>
            <h2 className="text-center text-lg font-bold text-slate-500">Şifreni Yenile</h2>

            <div className="w-64 flex flex-col gap-4 mx-auto">

                <form className='flex flex-col gap-10 my-12' onSubmit={handleSubmit(onSubmit)}>

                    <FormFieldWrapper>

                        <label
                            className={classNames(
                                "font-medium text-sm pl-2 "
                            )}
                            htmlFor="title">
                            Yeni şifre
                        </label>

                        <input
                            className={classNames(
                                'disabled:bg-slate-200 block w-full',
                                'rounded-md border-gray-300 shadow-sm ',
                                'focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                            )}
                            disabled={busy}
                            type="password"
                            placeholder='Yeni şifre'
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
                            placeholder='Şifreni tekrarla'
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
    )
}

export default ResetPassword