/* eslint-disable react-hooks/exhaustive-deps */
import { zodResolver } from '@hookform/resolvers/zod';
import { QueryClient } from '@tanstack/react-query';
import type { GetServerSideProps, NextPage } from 'next';
import { getSession, signIn } from "next-auth/react";
import Head from "next/head";
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { HiLogin } from 'react-icons/hi';
import { z } from 'zod';
import SigninImg from '../../assets/signin.png';
import IconButton from "../../components/buttons/IconButton";
import { FormFieldError, FormFieldWrapper } from '../../components/error-messages/FormError';
import { AppRoutes } from '../../config/appRoutes';
import { UserRoles } from '../../interface/auth.interface';
import { notifyError } from '../../utils/notifications';
import { trpc } from '../../utils/trpc';

interface IFormData {
    email: string;
    password: string;
    password2: string;
    brand: string;
    username: string;
    website: string;
    phone: string;
    role: UserRoles.VENDOR | UserRoles.PARTNER;

}
const validationSchema = z.object({
    role: z.enum(["VENDOR", "PARTNER"]),
    email: z.string().trim().email("Lütfen geçerli bir email giriniz!"),
    phone: z.string().trim().min(10, "En az 10 haneli numaranızı giriniz"),
    username: z.string().trim().min(5, "En az 5 karakter olmalı!"),
    brand: z.string().trim().min(5, "En az 5 karakter olmalı!"),
    website: z.string().trim().url("Geçerli bir adres giriniz!"),
    password: z.string().trim().min(8, "En az 8 karakter olmalı!"),
    password2: z.string().trim().min(8, "En az 8 karakter olmalı!"),
}).required().superRefine(({ password, password2 }, ctx) => {
    if (password !== password2) {
        ctx.addIssue({
            code: "custom",
            message: "Şifre tekrarı aynı olmalı",
            path: ['password2']
        });
    }
});

const SignUp: NextPage = (): JSX.Element => {

    const createUser = trpc.auth.createUser.useMutation()
    const [isVendor, setIsVendor] = useState(true)
    const [busy, setBusy] = useState(false)
    const [accept, setAccept] = useState(false)
    const router = useRouter()
    const client = new QueryClient()
    client.invalidateQueries()

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<IFormData>({
        resolver: zodResolver(validationSchema),
        reValidateMode: 'onBlur',
        mode: 'onBlur',
    });

    useEffect(() => {

        if (isVendor) {
            setValue('role', UserRoles.VENDOR)
            setValue('username', "----------")
            setValue('brand', "")
            setValue('website', "")
        } else {
            setValue('role', UserRoles.PARTNER)
            setValue('brand', "----------")
            setValue('website', "https://example.com")
            setValue('username', "")

        }

    }, [isVendor])


    const onSubmit: SubmitHandler<IFormData> = async (data) => {

        setBusy(true)

        createUser.mutate(data,
            {
                onSuccess: async (data, variables) => {

                    const { email, password } = variables
                    const signinResult = await signIn('credentials', {
                        redirect: false,
                        email: email,
                        password: password,
                        callbackUrl: "/dashboard?reg=true"

                    })


                    if (signinResult?.ok) {

                        if(data?.partner_id) router.replace(`${AppRoutes.WELCOME}?reg=true`)
                        else router.replace(AppRoutes.PARTNER_DASHBOARD)
                    }

                },
                onError(error) {
                    console.log(error.message)
                    notifyError(`${error.message}`)
                },
                onSettled: () => {
                    setBusy(false)
                }
            }

        )



    }
    
    return (
        <div className=''>
            <Head>
                <title>Affitime Kayıt</title>
            </Head>
            <div className="container px-2 py-12 mx-auto flex sm:flex-nowrap flex-wrap">
                <div className="lg:w-3/5 md:w-1/2 rounded-lg overflow-hidden sm:mr-10 hidden md:flex items-start justify-start relative">
                    <Image src={SigninImg} alt="signin" />
                </div>
                <div className="lg:w-2/5 md:w-1/2 bg-white flex flex-col items-center
                     md:ml-auto w-full py-8 md:py-8 mt-8 md:mt-0 px-4 xl:px-24 min-w-[356]">
                    <div className="text-center">
                        <h2 className="text-gray-900 text-xl mb-1 font-medium title-font">Kayıt ol</h2>
                        <p className="text-slate-400 text-sm">
                            Hesap oluşturmak için bilgilerinizi giriniz
                        </p>
                    </div>

                    <div className="flex flex-col text-center w-full mt-4">
                        <h1 className="sm:text-sm text-sm font-medium title-font mb-0 text-gray-900">Profil seçiniz</h1>
                        <div className="scale-90 flex mx-auto border-2 border-violet-600 rounded overflow-hidden mt-2">
                            <button
                                onClick={() => setIsVendor(true)}
                                className={` ${isVendor ? "bg-violet-600  text-white" : ""} py-1 px-4 focus:outline-none`}>Vendor</button>
                            <button
                                onClick={() => setIsVendor(false)}
                                className={`${isVendor ? "" : "bg-violet-600  text-white"}  py-1 px-4 focus:outline-none`}>Affiliate</button>
                        </div>
                    </div>

                    <form className='flex flex-col items-center gap-6 mt-6 xl:w-[300px]' onSubmit={handleSubmit(onSubmit)}>

                        <div className="block w-full ">
                            <FormFieldWrapper>
                                <label htmlFor="email" className="leading-7 text-sm font-bold text-gray-600">Email</label>

                                <input
                                    className='disabled:bg-slate-200 block w-full 
                                    rounded-md border-gray-300 shadow-sm 
                                  focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                                    disabled={busy}
                                    type="email"
                                    placeholder='Email'
                                    {...register("email", { required: true })}
                                />

                                <FormFieldError state={!!errors.email} message={errors.email?.message} />

                            </FormFieldWrapper>
                        </div>

                        <div className="block w-full ">
                            <FormFieldWrapper>
                                <label htmlFor="phone" className="leading-7 text-sm font-bold text-gray-600">Telefon</label>

                                <input
                                    className='disabled:bg-slate-200 block w-full 
                                    rounded-md border-gray-300 shadow-sm 
                                  focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                                    disabled={busy}
                                    type="text"
                                    placeholder='5xx'
                                    {...register("phone", { required: true })}
                                />

                                <FormFieldError state={!!errors.phone} message={errors.phone?.message} />

                            </FormFieldWrapper>

                        </div>

                        <div className={`w-full ${isVendor ? "block" : "hidden"} `}>
                            <FormFieldWrapper>
                                <label htmlFor="brand" className="leading-7 text-sm font-bold text-gray-600">Firma İsmi</label>

                                <input
                                    className='disabled:bg-slate-200 block w-full 
                                    rounded-md border-gray-300 shadow-sm 
                                  focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                                    disabled={busy}
                                    type="text"
                                    placeholder='Firma ismi'
                                    {...register("brand", { required: true })}
                                />

                                <FormFieldError state={!!errors.brand} message={errors.brand?.message} />

                            </FormFieldWrapper>

                        </div>

                        <div className={`w-full ${isVendor ? "block" : "hidden"}`}>
                            <FormFieldWrapper>
                                <label htmlFor="website" className="leading-7 text-sm font-bold text-gray-600">Website</label>

                                <input
                                    className='disabled:bg-slate-200 block w-full 
                                    rounded-md border-gray-300 shadow-sm 
                                  focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                                    disabled={busy}
                                    type="text"
                                    placeholder='https://'
                                    {...register("website", { required: true })}
                                />

                                <FormFieldError state={!!errors.website} message={errors.website?.message} />

                            </FormFieldWrapper>

                        </div>

                        <div className={`${isVendor ? "hidden" : "block"} w-full`}>
                            <FormFieldWrapper>
                                <label htmlFor="username" className="leading-7 text-sm font-bold text-gray-600">Kullanıcı İsmi</label>

                                <input
                                    className='disabled:bg-slate-200 block w-full 
                                    rounded-md border-gray-300 shadow-sm 
                                  focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                                    disabled={busy}
                                    type="text"
                                    placeholder='Kullanıcı İsmi'
                                    {...register("username", { required: true })}
                                />

                                <FormFieldError state={!!errors.username} message={errors.username?.message} />

                            </FormFieldWrapper>

                        </div>




                        <div className="block w-full">
                            <FormFieldWrapper>
                                <label htmlFor="password" className="leading-7 text-sm font-bold text-gray-600">Şifre</label>

                                <input
                                    className='disabled:bg-slate-200 block w-full 
                                    rounded-md border-gray-300 shadow-sm 
                                  focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                                    disabled={busy}
                                    type="password"
                                    placeholder='Şifre'
                                    {...register("password", { required: true })}
                                />

                                <FormFieldError state={!!errors.password} message={errors.password?.message} />

                            </FormFieldWrapper>

                        </div>

                        <div className="block w-full mb-4">
                            <FormFieldWrapper>
                                <label htmlFor="password2" className="leading-7 text-sm font-bold text-gray-600">Şifre Tekrarı</label>

                                <input
                                    className='disabled:bg-slate-200 block w-full 
                                    rounded-md border-gray-300 shadow-sm 
                                  focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                                    disabled={busy}
                                    type="password"
                                    placeholder='Şifre Tekrarı'
                                    {...register("password2", { required: true })}
                                />

                                <FormFieldError state={!!errors.password2} message={errors.password2?.message} />

                            </FormFieldWrapper>

                        </div>

                        <div className="scales space-x-2">
                            <input
                                onClick={() => setAccept(prev => !prev)}
                                type="checkbox" className="scales" name="accept" id="accept" checked={accept} />
                            <label className="text-sm" htmlFor="accept">
                                <Link className="text-blue-500" href={AppRoutes.LEGAL}>Kullanım koşullarını</Link> kabul ediyorum
                            </label>
                        </div>
                        <IconButton
                            icon={<HiLogin color="white" size={"16px"} />}
                            title="Kayıt ol"
                            disabled={!accept}
                            twClasses='w-full'
                            fn={() => null} />


                    </form>

                    <div className="flex flex-col mt-8 gap-6">
                        <p className="text-center">
                            Zaten bir Affitime hesabın var mı?
                            <Link className='pl-2 text-blue-500' href={AppRoutes.SIGNIN}>Giriş yap</Link>
                        </p>

                    </div>

                </div>
            </div>
        </div>
    )
}

export default SignUp


export const getServerSideProps: GetServerSideProps = async (context) => {

    const session = await getSession(context)

    if (session) return {
        redirect: {
            destination: `/${session.role.toLowerCase()}/dashboard`,
            permanent: false
        }
    }

    return { props: {} }
}