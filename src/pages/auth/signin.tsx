/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { NextPage } from 'next'
import { RegisterFormElement } from '../../interface/auth.interface';
import { signIn, signOut, useSession } from "next-auth/react";
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import ErrorMessage from '../../components/error-messages/ErrorMessage';
import Loader from '../../components/loader/Loader';

const Signin: NextPage = (): JSX.Element => {

    const { data, status } = useSession()
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()


    async function handleSubmit(e: React.FormEvent<RegisterFormElement>) {
        e.preventDefault();

        console.log({
            email: e.currentTarget.elements.email.value,
            password: e.currentTarget.elements.password.value,
        });

        const signinResult = await signIn('credentials', {
            redirect: false,
            email: e.currentTarget.elements.email.value,
            password: e.currentTarget.elements.password.value,
            callbackUrl: "/dashboard"

        })

        console.log({ signinResult });
        if (signinResult?.ok) router.replace('/dashboard')
        else {
            setError("Kullanici bilgiliresi hatali")
        }

    }


    return (
        <div className='flex justify-center pt-24'>
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
                    <input
                        className='disabled:bg-indigo-400 shadow-lg disabled:shadow-none 
                        rounded-full bg-indigo-700 px-10 py-3 font-semibold text-white no-underline transition 
                        hover:bg-indigo-500'
                        type="submit"
                        disabled={busy}
                        value="Giriş Yap" />

                </form>

                <Link className='text-center text-blue-600' href={'/auth/signup'}>Kayit Ol</Link>

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