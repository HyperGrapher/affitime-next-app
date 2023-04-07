/* eslint-disable @typescript-eslint/no-unused-vars */
import { zodResolver } from '@hookform/resolvers/zod';
import type { GetServerSideProps, NextPage } from 'next';
import { getSession, signIn } from "next-auth/react";
import Head from "next/head";
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { HiLogin } from 'react-icons/hi';
import { z } from 'zod';
import SigninImg from '../../assets/signin.png';
import IconButton from "../../components/buttons/IconButton";
import { FormFieldError, FormFieldWrapper } from '../../components/error-messages/FormError';
import { AppRoutes } from '../../config/appRoutes';
import { notifyError } from '../../utils/notifications';

interface IFormData {
    email: string;
    password: string;


}
const validationSchema = z.object({
    email: z.string().email("Lütfen geçerli bir email giriniz!"),
    password: z.string().trim().min(8, "En az 8 karakter olmalı!"),
}).required();



const Signin: NextPage = (): JSX.Element => {

    const [busy, setBusy] = useState(false)
    const router = useRouter()

    const { register, handleSubmit, setValue, formState: { errors }, setError } = useForm<IFormData>({
        resolver: zodResolver(validationSchema),
        reValidateMode: 'onBlur',
        mode: 'onBlur',
    });


    const onSubmit: SubmitHandler<IFormData> = async (data) => {
        setBusy(true)

        const signinResult = await signIn('credentials', {
            redirect: false,
            email: data.email,
            password: data.password,
            callbackUrl: "/dashboard"

        })

        if (signinResult?.error) {
            setBusy(false)
            notifyError('E-mail adresiniz veya şifreniz yanlış')
            setValue('password', "")
        }
        else {
            router.replace(AppRoutes.VENDOR_DASHBOARD)
        }

    }

    return (
        <div className=''>
            <Head>
                <title>Affitime Kullanıcı girişi</title>
            </Head>
            <div className="container px-2 py-12 mx-auto flex sm:flex-nowrap flex-wrap">
                <div className="lg:w-3/5 md:w-1/2 rounded-lg overflow-hidden sm:mr-10 hidden md:flex items-start justify-start relative">
                    <Image src={SigninImg} alt="signin" />
                </div>
                <div
                    className="lg:w-2/5 md:w-1/2 bg-white flex flex-col items-center
                md:ml-auto w-full py-8 md:py-8 mt-8 md:mt-0 px-4 xl:px-24 min-w-[356]"
                >
                    <div className="text-center">
                        <h2 className="text-gray-900 text-xl mb-1 font-medium title-font">Hoş geldin</h2>
                        <p className="text-slate-400 text-sm">
                            Hesap bilgilerini girerek giriş yapabilirsin
                        </p>
                    </div>

                    <form className='flex flex-col items-center gap-6 mt-16 xl:w-[300px]' onSubmit={handleSubmit(onSubmit)}>

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
                                    {...register("email", { required: true })} />

                                <FormFieldError state={!!errors.email} message={errors.email?.message} />

                            </FormFieldWrapper>
                        </div>

                        <div className="block w-full mb-4">
                            <FormFieldWrapper>
                                <label htmlFor="password" className="leading-7 text-sm font-bold text-gray-600">Şifre</label>

                                <input
                                    className='disabled:bg-slate-200 block w-full 
                                        rounded-md border-gray-300 shadow-sm 
                                      focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                                    disabled={busy}
                                    type="password"
                                    placeholder='Şifre'
                                    {...register("password")} />

                                <FormFieldError state={!!errors.password} message={errors.password?.message} />

                            </FormFieldWrapper>

                        </div>

                        <IconButton
                            icon={<HiLogin color="white" size={"16px"} />}
                            title="Giriş Yap"
                            twClasses='w-full'
                            fn={() => null} />


                    </form>

                    <Link
                        className='text-right text-sm text-blue-500 mt-6'
                        href={'#'} >
                        Şifremi unuttum
                    </Link>

                    <div className="flex flex-col mt-8 gap-6">
                        <div className='text-center text-slate-300'>ya da</div>

                        <p className="text-center">
                            affitime hesabın yok mu?
                            <Link className='pl-2 text-blue-500' href={AppRoutes.SIGNUP}>Hemen kayıt ol</Link>
                        </p>

                    </div>

                </div>
            </div>
        </div>
    )
}

export default Signin


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


