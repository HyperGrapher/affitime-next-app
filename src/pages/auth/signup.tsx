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
import { User } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { useRouter } from 'next/router';
import ErrorMessage from '../../components/error-messages/ErrorMessage';
import { QueryClient } from '@tanstack/react-query';
import Loader from '../../components/loader/Loader';
import { useForm, SubmitHandler } from "react-hook-form";
import PageCard from '../../components/card/Card';
import LinkButton from "../../components/link-button/LinkButton";
import classNames from '../../utils/classnames';
import { RadioGroup } from '@headlessui/react'
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod'


// interface Props {}
// https://tailwindcss.com/docs/flex-direction
// https://youtu.be/Rh1MOyfQo14?t=1783



// https://www.austinshelby.com/blog/build-a-react-form-with-react-hook-form-and-zod
const FormSchema = z.object({
    email: z.string().email(),
    accept: z.literal(true, {
        invalid_type_error: "You must accept Terms and Conditions.",
    }),
    tier: z
        .string({ invalid_type_error: "Please select a payment tier." })
        .refine((val) => [{ id: "BRONZE" }, { id: "SILVER" }, { id: "GOLD" }].map((item) => item.id).includes(val)),
});


const SignUp: NextPage = (): JSX.Element => {

    const createUser = trpc.auth.createUser.useMutation()
    const [enabled, setEnabled] = useState(false)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()
    const client = new QueryClient()

    async function handleSubmit(e: React.FormEvent<RegisterFormElement>) {

        setBusy(true)
        e.preventDefault();

        console.log({
            email: e.currentTarget.elements.email.value,
            password: e.currentTarget.elements.password.value,
        });

        createUser.mutate({
            email: e.currentTarget.elements.email.value,
            password: e.currentTarget.elements.password.value,
            role: enabled ? UserRoles.VENDOR : UserRoles.PARTNER
        },
            {
                onSuccess: async (data, variables, context) => {
                    console.log('Success');
                    console.log({ data, variables, context });

                    const { email, password } = variables
                    const signinResult = await signIn('credentials', {
                        redirect: false,
                        email: email,
                        password: password,
                        callbackUrl: "/dashboard?reg=true"

                    })

                    console.log({ signinResult });
                    if (signinResult?.ok) router.replace('/dashboard?reg=true')

                    // client.invalidateQueries(['useQuery([queryName])'])

                },
                onError(error, variables, context) {
                    setError(error.message)
                },
                onSettled: () => {
                    console.log("OnSettled");
                    setBusy(false)
                }
            }

        )

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
                        value="Kayıt Ol" />
                </form>

                <Link className='text-center text-blue-600' href={'/auth/signin'}>Giris Yap</Link>

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

export default SignUp