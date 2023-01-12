import TopBarProgress from "react-topbar-progress-indicator";
import { trpc } from '../../utils/trpc';
import { z } from 'zod';
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { HiPencil } from 'react-icons/hi';
import { useState } from "react";
import PageCard from "../../components/card/Card";
import Head from "next/head";
import IconButton from "../../components/buttons/IconButton";
import { FormFieldError, FormFieldWrapper } from '../../components/error-messages/FormError';
import classNames from '../../utils/classnames';
import { notifyError, notifySuccessBR } from '../../utils/notifications';
import { zodResolver } from '@hookform/resolvers/zod';


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


    return (
        <div className={"auth-container"}>
            <Head>
                <title>Affitime Ayarlar</title>
                <meta name="description" content="Affiliate uygulamasi" />
                <link rel="icon" href="/favicon.ico" />
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
        </div>
    )
}

export default Account