/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { NextPage } from 'next'
import { signIn, signOut, useSession } from "next-auth/react";
import { RegisterFormElement } from '../../interface/auth.interface';
import { trpc } from '../../utils/trpc';
import { setCookie } from 'cookies-next';

// interface Props {}
// https://tailwindcss.com/docs/flex-direction
// https://youtu.be/Rh1MOyfQo14?t=1783


const SignUp: NextPage = (): JSX.Element => {

    const { mutateAsync } = trpc.auth.createUser.useMutation()


    async function handleSubmit(e: React.FormEvent<RegisterFormElement>) {
        e.preventDefault();

        console.log({
            my_email: e.currentTarget.elements.email.value,
            el_password: e.currentTarget.elements.password.value,
        });


        const res = await mutateAsync({
            email: e.currentTarget.elements.email.value,
            password: e.currentTarget.elements.password.value,
            role: 'vendor'

        })

        if (res?.id) {

            signIn('credentials', {
                redirect: true,
                email: res?.email,
                password: res?.password,
                callbackUrl: "http://localhost:3000/welcome"

            })
        }




    }

    return (
        <div className='flex justify-center mt-24'>
            <div className="w-64">
                <h1 className='text-xl font-bold text-center mb-6'>Signup</h1>
                <form className='flex flex-col gap-8' onSubmit={handleSubmit}>
                    <input className='py-2 bg-slate-100' type="email" name="email" id="email" placeholder='Email' />
                    <input className='py-2 bg-slate-100' type="password" name="password" id="password" placeholder='Password' />
                    <input className='bg-lime-500 py-4 px-12 text-slate-50' type="submit" value="Login" />
                </form>

            </div>
        </div>
    )
}

export default SignUp