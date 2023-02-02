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

// Login Form
// https://play.tailwindcss.com/F6G5XxxWII
const Signin: NextPage = (): JSX.Element => {

    const [busy, setBusy] = useState(false)
    const router = useRouter()


    async function handleSubmit(e: React.FormEvent<RegisterFormElement>) {
        e.preventDefault();
        setBusy(true)

        const signinResult = await signIn('credentials', {
            redirect: false,
            email: e.currentTarget.elements.email.value,
            password: e.currentTarget.elements.password.value,
            callbackUrl: "/dashboard"

        })

        if (signinResult?.error) {
            setBusy(false)
            notifyError('Kullanici bilgiliresi hatali')
        }
        else {
            router.replace(AppRoutes.VENDOR_DASHBOARD)
        }

    }

    return (
        <div className='flex justify-center pt-24'>
            <Head>
                <title>Affitime Kullanıcı girişi</title>
            </Head>
            <div className="w-64 flex flex-col gap-4">
                <h1 className='text-xl font-bold text-center mb-6'>Giriş Yap</h1>
                <form className='flex flex-col gap-8' onSubmit={handleSubmit}>
                    <input
                        className='disabled:bg-slate-200 block w-full 
                        rounded-md border-gray-300 shadow-sm 
                        focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        disabled={busy}
                        type="email"
                        name="email"
                        id="email"
                        placeholder='Email' />
                    <input
                        className='disabled:bg-slate-200 block w-full 
                        rounded-md border-gray-300 shadow-sm 
                        focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        disabled={busy}
                        type="password"
                        name="password"
                        id="password"
                        placeholder='Password' />

                    <IconButton
                        icon={<HiLogin color="white" size={"16px"} />}
                        title="Giriş Yap"
                        disabled={busy}
                        fn={() => null} />

                </form>

                <Link className='text-center text-blue-600' href={AppRoutes.SIGNUP}>Kayit Ol</Link>

                {busy ? <div className="fixed inset-0 mt-16 backdrop-blur-nope-sm bg-black/10 flex justify-center items-center">
                    <Loader scale={0.9} />
                </div> : null}

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

