/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { NextPage } from 'next'
import { signIn, signOut, useSession } from "next-auth/react";
import { RegisterFormElement, UserRoles } from '../../interface/auth.interface';
import { trpc } from '../../utils/trpc';
import { setCookie } from 'cookies-next';
import { Switch } from '@headlessui/react'
import { useState } from 'react';
import Link from 'next/link';

// interface Props {}
// https://tailwindcss.com/docs/flex-direction
// https://youtu.be/Rh1MOyfQo14?t=1783


const SignUp: NextPage = (): JSX.Element => {

    const { mutateAsync } = trpc.auth.createUser.useMutation()
    const [enabled, setEnabled] = useState(false)
    const [busy, setBusy] = useState(false)


    async function handleSubmit(e: React.FormEvent<RegisterFormElement>) {
        e.preventDefault();

        console.log({
            my_email: e.currentTarget.elements.email.value,
            el_password: e.currentTarget.elements.password.value,
        });


        const res = await mutateAsync({
            email: e.currentTarget.elements.email.value,
            password: e.currentTarget.elements.password.value,
            role: enabled ? UserRoles.VENDOR : UserRoles.PARTNER
        })

        if (res?.id) {

            signIn('credentials', {
                redirect: true,
                email: res?.email,
                password: res?.password,
                callbackUrl: "/dashboard?reg=true"

            })
        }




    }

    return (
        <div className='flex justify-center pt-24'>
            <div className="w-64 flex flex-col gap-4">
                <h1 className='text-xl font-bold text-center mb-6'>Kayıt Ol</h1>

                <div className="flex flex-row w-48 justify-between mx-auto mb-4">
                    <p className="text-sm">Partner</p>
                    <Switch
                        checked={enabled}
                        onChange={setEnabled}
                        className={`${enabled ? 'bg-blue-600' : 'bg-gray-200'
                            } relative inline-flex h-6 w-11 items-center rounded-full`}
                    >
                        <span className="sr-only">Role secimi</span>
                        <span
                            className={`${enabled ? 'translate-x-6' : 'translate-x-1'
                                } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                        />
                    </Switch>
                    <p className="text-sm">Vendor</p>

                </div>

                <form className='flex flex-col gap-8' onSubmit={handleSubmit}>
                    <input className='block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm' type="email" name="email" id="email" placeholder='Email' />
                    <input className='block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm' type="password" name="password" id="password" placeholder='Password' />
                    <input className='rounded-full bg-indigo-700 px-10 py-3 font-semibold text-white no-underline transition hover:bg-indigo-500' type="submit" value="Kayıt Ol" />
                </form>

                <Link className='text-center text-blue-600' href={'/auth/signin'}>Giris Yap</Link>


            </div>
        </div>
    )
}

export default SignUp