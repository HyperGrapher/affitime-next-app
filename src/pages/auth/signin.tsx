/* eslint-disable @typescript-eslint/no-unused-vars */
import type { GetServerSideProps, NextPage } from 'next'
import type { RegisterFormElement } from '../../interface/auth.interface';
import { getSession, signIn } from "next-auth/react";
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Loader from '../../components/loader/Loader';
import { AppRoutes } from '../../config/appRoutes';
import { notifyError } from '../../utils/notifications';
import { HiLogin } from 'react-icons/hi';
import Head from "next/head";
import IconButton from "../../components/buttons/IconButton";
import SigninImg from '../../assets/signin.png'
import Image from 'next/image';
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { HiArrowLeft as BackIcon, HiPencil, HiPlus } from 'react-icons/hi';
import TopBarProgress from 'react-topbar-progress-indicator';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import PageCard from '../../components/card/Card';
import { FormFieldError, FormFieldWrapper } from '../../components/error-messages/FormError';
import classNames from '../../utils/classnames';
import { notifySuccessBR, notifySuccessTC } from '../../utils/notifications';

interface IFormData {
    email: string;
    password: string;
    // firma: string;
    // website: string;

}
const validationSchema = z.object({
    email: z.string().email("Lütfen geçerli bir email giriniz!"),
    password: z.string().trim().min(8, "En az 8 karakter olmalı!"),
}).required();

const Google = () => (<svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.6996 12.176C19.6996 11.68 19.6516 11.168 19.5716 10.688H12.6436V13.52H16.6116C16.4516 14.432 15.9236 15.232 15.1396 15.744L17.5076 17.584C18.8996 16.288 19.6996 14.4 19.6996 12.176Z" fill="#4280EF" />
    <path d="M12.644 19.344C14.628 19.344 16.292 18.688 17.508 17.568L15.14 15.744C14.484 16.192 13.636 16.448 12.644 16.448C10.724 16.448 9.10798 15.152 8.51598 13.424L6.08398 15.296C7.33198 17.776 9.85998 19.344 12.644 19.344Z" fill="#34A353" />
    <path d="M8.51571 13.408C8.21171 12.496 8.21171 11.504 8.51571 10.592L6.08371 8.70399C5.04371 10.784 5.04371 13.232 6.08371 15.296L8.51571 13.408Z" fill="#F6B704" />
    <path d="M12.644 7.56799C13.684 7.552 14.708 7.952 15.46 8.672L17.556 6.56C16.228 5.312 14.468 4.64 12.644 4.656C9.85998 4.656 7.33198 6.224 6.08398 8.704L8.51598 10.592C9.10798 8.84799 10.724 7.56799 12.644 7.56799Z" fill="#E54335" />
</svg>
)

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
                            // disabled={busy}
                            twClasses='w-full'
                            fn={() => null} />


                    </form>

                    <Link
                        className='text-right text-sm text-blue-500 mt-6'
                        href={'/auth/forgot-password'} >
                        Şifremi unuttum
                    </Link>

                    <div className="flex flex-col mt-8 gap-6">
                        <div className='text-center text-slate-300'>ya da</div>
{/* 
                        <button className={classNames(
                            "w-full bg-white text-blue-500 border border-blue-500",
                            'flex items-center justify-center space-x-2',
                            'flex-nowrap shadow-sm hover:shadow-lg rounded-md ',
                            `py-2 px-8`,
                            'transition-all',
                            `disabled:bg-gray-400 disabled:shadow-none`,
                            `aria-disabled:bg-gray-400 aria-disabled:shadow-none`,
                        )}
                            onClick={() => notifyError('Not implemented')}>
                            <Google />
                            <span className='font-medium'>
                                Google ile devam et
                            </span>
                        </button> */}

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



const Sign = () => {

    const handleSubmit = () => null

    return (<form className='flex flex-col gap-8' onSubmit={handleSubmit}>
        <input
            className='disabled:bg-slate-200 block w-full 
        rounded-md border-gray-300 shadow-sm 
        focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            // disabled={busy}
            type="email"
            name="email"
            id="email"
            placeholder='Email' />
        <input
            className='disabled:bg-slate-200 block w-full 
        rounded-md border-gray-300 shadow-sm 
        focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            // disabled={busy}
            type="password"
            name="password"
            id="password"
            placeholder='Password' />

        <IconButton
            icon={<HiLogin color="white" size={"16px"} />}
            title="Giriş Yap"
            // disabled={busy}
            fn={() => null} />

        <Link className='text-center text-blue-600' href={AppRoutes.SIGNUP}>Kayit Ol</Link>

        {true ? <div className="fixed inset-0 mt-16 backdrop-blur-nope-sm bg-black/10 flex justify-center items-center">
            <Loader scale={0.9} />
        </div> : null}

    </form>)

}


const SignInNew = () => {

    return (
        <section className="text-gray-600 body-font relative">
            <div className="container px-5 py-24 mx-auto flex sm:flex-nowrap flex-wrap">
                <div className="lg:w-2/3 md:w-1/2 bg-gray-300 rounded-lg overflow-hidden sm:mr-10 p-10 flex items-end justify-start relative">
                    <Image src={SigninImg} alt="signin" />
                </div>
                <div className="lg:w-1/3 md:w-1/2 bg-white flex flex-col md:ml-auto w-full md:py-8 mt-8 md:mt-0">
                    <h2 className="text-gray-900 text-lg mb-1 font-medium title-font">Feedback</h2>
                    <p className="leading-relaxed mb-5 text-gray-600">Post-ironic portland shabby chic echo park, banjo fashion axe</p>
                    <div className="relative mb-4">
                        <label htmlFor="email" className="leading-7 text-sm text-gray-600">Email</label>
                        <input
                            className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                            // disabled={busy}
                            type="email"
                            name="email"
                            id="email"
                            placeholder='Email' />
                    </div>
                    <div className="relative mb-4">
                        <label htmlFor="password" className="leading-7 text-sm text-gray-600">Password</label>
                        <input
                            className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                            // disabled={busy}
                            type="password"
                            name="password"
                            id="password"
                            placeholder='Password' />

                    </div>

                    <button className="text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg">Button</button>
                    <p className="text-xs text-gray-500 mt-3">Chicharrones blog helvetica normcore iceland tousled brook viral artisan.</p>
                </div>
            </div>
        </section>
    )
}

