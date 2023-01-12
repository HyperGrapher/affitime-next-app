import type { NextPage } from 'next';
import { signIn } from "next-auth/react";
import { useRouter } from 'next/router';
import { useState } from 'react';
import ErrorMessage from '../../components/error-messages/ErrorMessage';
import Loader from '../../components/loader/Loader';
import type { AdminRegisterFormElement } from '../../interface/auth.interface';
import { TRPCError } from '@trpc/server';
import { HiPlus } from 'react-icons/hi';
import { AppRoutes } from '../../config/appRoutes';
import { trpc } from '../../utils/trpc';
import Head from "next/head";
import IconButton from "../../components/buttons/IconButton";

const AdminSignUp: NextPage = (): JSX.Element => {

    const createUser = trpc.auth.createAdmin.useMutation()
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()


    async function handleSubmit(e: React.FormEvent<AdminRegisterFormElement>) {

        setBusy(true)
        e.preventDefault();

        createUser.mutate({
            email: e.currentTarget.elements.email.value,
            password: e.currentTarget.elements.password.value,
            adminpass: e.currentTarget.elements.adminpass.value,

        },
            {
                onSuccess: async (data, variables) => {

                    const { email, password } = variables
                    const signinResult = await signIn('credentials', {
                        redirect: false,
                        email: email,
                        password: password,
                        callbackUrl: "/admin/dashboard?reg=true"

                    })

                    if (signinResult?.ok) router.replace(`${AppRoutes.ADMIN_DASHBOARD}`)

                },
                onError(error) {

                    if (error instanceof Error) {

                        setError(error.message)
                    }

                    if (error instanceof TRPCError) {

                        setError(error.message)
                    }

                },
                onSettled: () => {

                    setBusy(false)
                }
            }

        )

    }





    return (
        <div className='flex justify-center pt-24'>

            <Head>
                <title>Affitime Admin Kayıt</title>
            </Head>
            <div className="w-64 flex flex-col gap-4">
                <h1 className='text-xl font-bold text-center mb-6'>Admin Kayıt</h1>


                <form className='flex flex-col gap-8' onSubmit={handleSubmit}>
                    <input
                        className='disabled:bg-slate-200 block w-full 
                        rounded-md border-gray-300 shadow-sm 
                        focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        disabled={busy}
                        type="email"
                        name="email"
                        placeholder='Email' />


                    <input
                        className='disabled:bg-slate-200 block w-full 
                        rounded-md border-gray-300 shadow-sm 
                        focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        disabled={busy}
                        type="password"
                        name="password"
                        placeholder='Password' />


                    <input
                        className='disabled:bg-slate-200 block w-full 
                        rounded-md border-gray-300 shadow-sm 
                        focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        disabled={busy}
                        type="password"
                        name="adminpass"
                        placeholder='Parola' />

                    <IconButton
                        icon={<HiPlus color="white" size={"16px"} />}
                        title="Kayıt"
                        disabled={busy}
                        fn={() => null} />
                </form>


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

export default AdminSignUp