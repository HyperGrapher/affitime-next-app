/* eslint-disable @typescript-eslint/no-explicit-any */
import { Tab } from '@headlessui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import Head from "next/head";
import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { HiPencil } from 'react-icons/hi';
import TopBarProgress from "react-topbar-progress-indicator";
import { z } from 'zod';
import IconButton from "../../../components/buttons/IconButton";
import PageCard from "../../../components/card/Card";
import { FormFieldError, FormFieldWrapper } from '../../../components/error-messages/FormError';
import TabItem from "../../../components/tab-item/TabItem";
import classNames from '../../../utils/classnames';
import { notifyError, notifySuccessBR } from '../../../utils/notifications';
import { trpc } from '../../../utils/trpc';

const Account = () => {

    const [selectedIndex, setSelectedIndex] = useState(0)

    return (
        <div className={"auth-container"}>
            <Head>
                <title>Affitime | Hesap Ayarları</title>
            </Head>

            <main className="mx-auto container min-h-screen px-2 pt-6">

                <div className="mb-2">
                    <h1 className="text-slate-600 font-bold text-2xl">
                        Hesap Ayarları
                    </h1>
                    <small className="text-slate-400 text-sm">
                        Hesabınızla ilgili bilgileri bu sayfada güncelleyebilirsiniz
                    </small>
                </div>


                <Tab.Group defaultIndex={0} selectedIndex={selectedIndex} onChange={setSelectedIndex}>
                    <Tab.List className={classNames(
                        "space-x-8 "
                    )}>
                        <TabItem id="0" title="Hesap Bilgileri" selected={selectedIndex} query="0" />
                        <TabItem id="1" title="Parola Yenile" selected={selectedIndex} query="1" />
                        <TabItem id="2" title="IBAN Bilgisi" selected={selectedIndex} query="2" />

                    </Tab.List>
                    <Tab.Panels>
                        <Tab.Panel>{selectedIndex === 0 && <PartnerAccountInfo />}</Tab.Panel>
                        <Tab.Panel>{selectedIndex === 1 && <UpdatePassword />}</Tab.Panel>
                        <Tab.Panel>{selectedIndex === 2 && <PartnerPaymentInfo />}</Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>

            </main>


        </div>
    )
}

export default Account


interface IBankFormData {
    fname: string;
    lname: string;
    iban: string;
}

const IbanValidationSchema = z.object({
    fname: z.string().trim().min(3, "En az 3 karakter olmalı!"),
    lname: z.string().trim().min(2, "En az 2 karakter olmalı!"),
    iban: z.string().trim().min(26, "En az 24 haneli numaranızı giriniz").trim(),
}).required();

const PartnerPaymentInfo = () => {

    const [busy, setBusy] = useState(false)

    const { register, handleSubmit, setValue, setError, formState: { errors } } = useForm<IBankFormData>({
        resolver: zodResolver(IbanValidationSchema),
        reValidateMode: 'onBlur',
        mode: 'onBlur',
    });

    const saveIban = trpc.payments.updateOrSavePartnerIban.useMutation()

    trpc.payments.getIban.useQuery(undefined, {
        onSuccess(data) {

            if (data) {
                setValue('fname', data.fname)
                setValue('lname', data.lname)
                setValue('iban', data.iban)

            }


        },
    })

    const onSubmit: SubmitHandler<IBankFormData> = async (data) => {

        const value = data.iban.replace(/\s|[^0-9]+/g, "")

        if (value.length !== 24) {
            setError('iban', { message: 'Iban numarası 24 rakamdan oluşmalı!' })
            return
        }
        data.iban = value

        setBusy(true)
        saveIban.mutate(data, {
            onSuccess: () => {
                notifySuccessBR("Bilgileriniz Güncellendi!")
            },
            onError() {
                notifyError('Hata. Bilgileriniz Güncellenemedi!')
            },
            onSettled: () => {
                setBusy(false)
            }
        })

    }


    return (
        <div className="div">

            <PageCard>

                {busy && <TopBarProgress />}

                <h2 className="text-center text-lg font-bold text-slate-500">Ödeme Bilgilerinizi Güncelleyin</h2>

                <div className="w-64 flex flex-col gap-4 mx-auto">

                    <form className='flex flex-col gap-10 my-12' onSubmit={handleSubmit(onSubmit)}>
                        <FormFieldWrapper>

                            <label
                                className={classNames(
                                    "font-medium text-sm pl-2 "
                                )}
                                htmlFor="fname">
                                Adınız
                            </label>

                            <input
                                className={classNames(
                                    'disabled:bg-slate-200 block w-full',
                                    'rounded-md border-gray-300 shadow-sm ',
                                    'focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                                )}
                                disabled={busy}
                                type="text"
                                placeholder='Adınız'
                                {...register("fname", { required: true })}
                            />

                            <FormFieldError state={!!errors.fname} message={errors.fname?.message} />

                        </FormFieldWrapper>

                        <FormFieldWrapper>

                            <label
                                className={classNames(
                                    "font-medium text-sm pl-2 "
                                )}
                                htmlFor="lname">
                                Soyadınız
                            </label>

                            <input
                                className={classNames(
                                    'disabled:bg-slate-200 block w-full',
                                    'rounded-md border-gray-300 shadow-sm ',
                                    'focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                                )}
                                disabled={busy}
                                type="text"
                                placeholder='Soyadınız'
                                {...register("lname", { required: true })}
                            />

                            <FormFieldError state={!!errors.lname} message={errors.lname?.message} />

                        </FormFieldWrapper>

                        <FormFieldWrapper>

                            <label
                                className={classNames(
                                    "font-medium text-sm pl-2 "
                                )}
                                htmlFor="lname">
                                IBAN No
                            </label>

                            <input
                                className={classNames(
                                    'disabled:bg-slate-200 block w-full',
                                    'rounded-md border-gray-300 shadow-sm text-sm',
                                    'focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                                )}
                                disabled={busy}
                                type="text"
                                placeholder='IBAN'
                                {...register("iban", { required: true })}
                            />

                            <FormFieldError state={!!errors.iban} message={errors.iban?.message} />

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


interface IPartnerAccountInfoFormData {
    email: string;
    fname: string;
    lname: string;
    phone: string;

}

const partnerAccountValidationSchema = z.object({
    email: z.string().trim().email("Lütfen geçerli bir email giriniz!"),
    fname: z.string().trim().min(3, "En az 3 karakter olmalı!"),
    lname: z.string().trim().min(2, "En az 2 karakter olmalı!"),
    phone: z.string().trim().min(10, "En az 10 haneli numaranızı giriniz"),
}).required();




interface ImageUploadData {
    name: string;
    data: string;
}

const imageUploadSchema = z.object({
    name: z.string(),
    data: z.string(),
});

const PartnerAccountInfo = () => {

    const [busy, setBusy] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [selectedImg, setSelectedImg] = useState("")
    const [selectedFile, setSelectedFile] = useState<File>()


    const { register, handleSubmit, setValue, setError, formState: { errors } } = useForm<IPartnerAccountInfoFormData>({
        resolver: zodResolver(partnerAccountValidationSchema),
        reValidateMode: 'onBlur',
        mode: 'onBlur',
    });

    const updatePartnerAccount = trpc.user.updatePartnerAccount.useMutation()
    trpc.user.getPartnerAccount.useQuery(undefined, {
        onSuccess(data) {
            setValue("email", data?.email ?? "")
            setValue("fname", data?.fname ?? "")
            setValue("lname", data?.lname ?? "")
            setSelectedImg(data?.image ?? "")
            setValue("phone", data?.partner?.phone ?? "")

        }
    })



    const onSubmit: SubmitHandler<IPartnerAccountInfoFormData> = async (data) => {

        setBusy(true)
        updatePartnerAccount.mutate(data, {
            onSuccess: () => {
                notifySuccessBR("Bilgileriniz Güncellendi!")
            },
            onError(error) {
                console.error(error)
                notifyError(error.message ?? 'Hata. Bilgileriniz Güncellenemedi!')
            },
            onSettled: () => {

                setBusy(false)
            }
        })

    }


    return (
        <PageCard>

            {(busy || uploading) && <TopBarProgress />}

            <h2 className="text-center text-lg font-bold text-slate-500">Bilgilerinizi Güncelleyin</h2>

            <div className="w-64 flex flex-col gap-4 mx-auto">

                <form className='flex flex-col gap-10 my-12' onSubmit={handleSubmit(onSubmit)}>



                    <FormFieldWrapper>

                        <label
                            className={classNames(
                                "font-medium text-sm pl-2 "
                            )}
                            htmlFor="email">
                            <input type='file' hidden />
                        </label>


                    </FormFieldWrapper>


                    <FormFieldWrapper>

                        <label
                            className={classNames(
                                "font-medium text-sm pl-2 "
                            )}
                            htmlFor="email">
                            Email adresiniz
                        </label>

                        <input
                            className={classNames(
                                'disabled:bg-slate-200 block w-full',
                                'rounded-md border-gray-300 shadow-sm ',
                                'focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                            )}
                            disabled={busy}
                            type="email"
                            placeholder='Email Adresi'
                            {...register("email", { required: true })}
                        />

                        <FormFieldError state={!!errors.email} message={errors.email?.message} />

                    </FormFieldWrapper>

                    <FormFieldWrapper>

                        <label
                            className={classNames(
                                "font-medium text-sm pl-2 "
                            )}
                            htmlFor="fname">
                            Adınız
                        </label>

                        <input
                            className={classNames(
                                'disabled:bg-slate-200 block w-full',
                                'rounded-md border-gray-300 shadow-sm ',
                                'focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                            )}
                            disabled={busy}
                            type="text"
                            placeholder='Adınız'
                            {...register("fname", { required: true })}
                        />

                        <FormFieldError state={!!errors.fname} message={errors.fname?.message} />

                    </FormFieldWrapper>

                    <FormFieldWrapper>

                        <label
                            className={classNames(
                                "font-medium text-sm pl-2 "
                            )}
                            htmlFor="lname">
                            Soyadınız
                        </label>

                        <input
                            className={classNames(
                                'disabled:bg-slate-200 block w-full',
                                'rounded-md border-gray-300 shadow-sm ',
                                'focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                            )}
                            disabled={busy}
                            type="text"
                            placeholder='Soyadınız'
                            {...register("lname", { required: true })}
                        />

                        <FormFieldError state={!!errors.lname} message={errors.lname?.message} />

                    </FormFieldWrapper>


                    <FormFieldWrapper>
                        <label htmlFor="phone" className={classNames(
                            "font-medium text-sm pl-2 "
                        )}>Telefon No</label>

                        <input
                            className={classNames(
                                'disabled:bg-slate-200 block w-full',
                                'rounded-md border-gray-300 shadow-sm ',
                                'focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                            )}
                            disabled={busy}
                            type="text"
                            placeholder='5xx'
                            {...register("phone", { required: true })}
                        />

                        <FormFieldError state={!!errors.phone} message={errors.phone?.message} />

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


interface IPasswordFormData {
    oldPassword: string;
    password1: string;
    password2: string;

}

const passwordValidationSchema = z.object({
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

const UpdatePassword = () => {

    const [busy, setBusy] = useState(false)
    const updatePass = trpc.auth.updatePassword.useMutation()

    const { register, handleSubmit, reset, formState: { errors } } = useForm<IPasswordFormData>({
        resolver: zodResolver(passwordValidationSchema),
        reValidateMode: 'onBlur',
        mode: 'onBlur',
    });


    const onSubmit: SubmitHandler<IPasswordFormData> = async (data) => {
        setBusy(true)
        updatePass.mutate(data, {
            onSuccess: () => {
                notifySuccessBR("Bilgileriniz Güncellendi!")
            },
            onError(error: { message: any; }) {
                console.error(error)
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
            <h2 className="text-center text-lg font-bold text-slate-500">Parolanızı Güncelleyin</h2>

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
    )
}

