import type { NextPage } from 'next'
import type { RegisterFormElement } from '../../interface/auth.interface';
import { signIn } from "next-auth/react";
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import ErrorMessage from '../../components/error-messages/ErrorMessage';
import Loader from '../../components/loader/Loader';
import { AppRoutes } from '../../config/appRoutes';
import { notifyError } from '../../utils/notifications';
import { HiLogin } from 'react-icons/hi';
import Head from "next/head";
import IconButton from "../../components/buttons/IconButton";


const Signin: NextPage = (): JSX.Element => {

    const [busy, setBusy] = useState(false)
    const [error, setError] = useState("")
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
            setError("Kullanici bilgiliresi hatali")
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

                <div>
                    <ErrorMessage
                        state={!!error}
                        message={error} />
                </div>

                {busy ? <div className="fixed inset-0 mt-16 backdrop-blur-nope-sm bg-black/10 flex justify-center items-center">
                    <Loader scale={0.9} />
                </div> : null}

            </div>
        </div>
    )
}

export default Signin