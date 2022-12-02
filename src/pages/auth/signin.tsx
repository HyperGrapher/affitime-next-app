/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { NextPage } from 'next'
import { RegisterFormElement } from '../../interface/auth.interface';
import { signIn, signOut, useSession } from "next-auth/react";
import Link from 'next/link';
import { setCookie } from 'cookies-next';

const Signin: NextPage = (): JSX.Element => {

    const {data, status} = useSession()

    async function handleSubmit(e: React.FormEvent<RegisterFormElement>) {
        e.preventDefault();

        console.log({
            my_email: e.currentTarget.elements.email.value,
            el_password: e.currentTarget.elements.password.value,
        });

        // TODO call find user here and assign user cookie if it exist


        const getLoginStatus = await signIn("credentials", {
            redirect: true,
            email: e.currentTarget.elements.email.value,
            password: e.currentTarget.elements.password.value,
            callbackUrl: '/welcome'
        })

        console.log({getLoginStatus}); // Always undefined




    }


    return (
        <div className='flex justify-center mt-24'>
            <div className="w-64">
                <h1 className='text-xl font-bold text-center mb-6'>Login</h1>
                <form className='flex flex-col gap-8' onSubmit={handleSubmit}>
                    <input className='py-2 bg-slate-100' type="email" name="email" id="email" placeholder='Email' />
                    <input className='py-2 bg-slate-100' type="password" name="password" id="password" placeholder='Password' />
                    <input className='bg-lime-500 py-4 px-12 text-slate-50' type="submit" value="Login" />
                </form>

                <button className='bg-red-500 py-4 px-12 text-slate-50 mt-2' onClick={() => signOut()}>LOGOUT</button>

                <div className='mt-6'>

                    <Link className='bg-blue-500 py-4 px-12 text-slate-50 mt-6'  href={'/'}>HOME</Link>
                </div>

                <div className='mt-6'>
                    {JSON.stringify({data, status})}
                </div>

            </div>
        </div>
    )
}

export default Signin