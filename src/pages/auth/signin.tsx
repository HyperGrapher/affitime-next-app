/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { NextPage } from 'next'
import { RegisterFormElement } from '../../interface/auth.interface';
import { signIn, signOut, useSession } from "next-auth/react";
import Link from 'next/link';

const Signin: NextPage = (): JSX.Element => {

    const { data, status } = useSession()

    async function handleSubmit(e: React.FormEvent<RegisterFormElement>) {
        e.preventDefault();

        console.log({
            email: e.currentTarget.elements.email.value,
            password: e.currentTarget.elements.password.value,
        });

        await signIn("credentials", {
            redirect: true,
            email: e.currentTarget.elements.email.value,
            password: e.currentTarget.elements.password.value,
            callbackUrl: '/welcome'
        })


    }


    return (
        <div className='flex justify-center pt-24'>
            <div className="w-64">
                <h1 className='text-xl font-bold text-center mb-6'>Giriş Yap</h1>
                <form className='flex flex-col gap-8' onSubmit={handleSubmit}>
                    <input className='block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm' type="email" name="email" id="email" placeholder='Email' />
                    <input className='block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm' type="password" name="password" id="password" placeholder='Password' />
                    <input className='rounded-full bg-indigo-700 px-10 py-3 font-semibold text-white no-underline transition hover:bg-indigo-500' type="submit" value="Giriş Yap" />
                </form>

            </div>
        </div>
    )
}

export default Signin