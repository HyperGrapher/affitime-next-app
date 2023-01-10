import { Switch } from '@headlessui/react';
import { QueryClient } from '@tanstack/react-query';
import type { NextPage } from 'next';
import { signIn } from "next-auth/react";
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { z } from 'zod';
import ErrorMessage from '../../components/error-messages/ErrorMessage';
import Loader from '../../components/loader/Loader';
import type { RegisterFormElement } from '../../interface/auth.interface';
import { UserRoles } from '../../interface/auth.interface';
import { trpc } from '../../utils/trpc';
import { AppRoutes } from '../../config/appRoutes';



// https://www.austinshelby.com/blog/build-a-react-form-with-react-hook-form-and-zod
// const FormSchema = z.object({
//     email: z.string().email(),
//     accept: z.literal(true, {
//         invalid_type_error: "You must accept Terms and Conditions.",
//     }),
//     tier: z
//         .string({ invalid_type_error: "Please select a payment tier." })
//         .refine((val) => [{ id: "BRONZE" }, { id: "SILVER" }, { id: "GOLD" }].map((item) => item.id).includes(val)),
// });


const SignUp: NextPage = (): JSX.Element => {

    const createUser = trpc.auth.createUser.useMutation()
    const [isVendor, setIsVendor] = useState(false)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()
    const client = new QueryClient()
    client.invalidateQueries()

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
            username: !isVendor ? e.currentTarget.elements.username.value : "______",
            brand: isVendor ? e.currentTarget.elements.brand.value : "______",
            website: isVendor ? e.currentTarget.elements.website.value : "https://example.com",
            role: isVendor ? UserRoles.VENDOR : UserRoles.PARTNER
        },
            {
                onSuccess: async (data, variables) => {

                    const { email, password } = variables
                    const signinResult = await signIn('credentials', {
                        redirect: false,
                        email: email,
                        password: password,
                        callbackUrl: "/dashboard?reg=true"

                    })

                    if (signinResult?.ok) router.replace('/vendor/dashboard?reg=true')

                },
                onError(error) {
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
                        checked={isVendor}
                        onChange={setIsVendor}
                        className={`${isVendor ? 'bg-blue-600' : 'bg-gray-200'
                            } relative inline-flex h-6 w-11 items-center rounded-full`}
                    >
                        <span className="sr-only">Role secimi</span>
                        <span
                            className={`${isVendor ? 'translate-x-6' : 'translate-x-1'
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

                    {!isVendor ? <input
                        className='disabled:bg-slate-200 block w-full 
                        rounded-md border-gray-300 shadow-sm 
                        focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        disabled={busy}
                        type="text"
                        name="username"
                        id="username"
                        placeholder='Kullanici ismi' />
                        : <>
                            <input
                                className='disabled:bg-slate-200 block w-full 
                                    rounded-md border-gray-300 shadow-sm 
                                 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                                disabled={busy}
                                type="text"
                                name="brand"
                                id="brand"
                                placeholder='Firma ismi' />

                            <input
                                className='disabled:bg-slate-200 block w-full 
                                    rounded-md border-gray-300 shadow-sm 
                                 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                                disabled={busy}
                                type="text"
                                name="website"
                                id="website"
                                placeholder='Website adresi' />
                        </>
                    }
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

                <Link className='text-center text-blue-600' href={AppRoutes.SIGNIN}>Giris Yap</Link>

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