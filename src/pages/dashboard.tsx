/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { GetServerSideProps } from "next";
import { type NextPage, NextApiRequest, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { getSession, signIn, signOut, useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";
import { useRouter } from "next/router";
import { useEffect, useTransition } from "react";
import getClientIp from "../utils/getClientIp";
import usePersistedState from "../hooks/usePersistedState";
import TopBarProgress from "react-topbar-progress-indicator";
// import dynamic from 'next/dynamic'
// import { Suspense } from 'react'

// const DynamicHeader = dynamic(() => import('../components/loader/FadingLoader'), {
//   suspense: true,
// })


const Dashboard: NextPage = () => {

    const { data: secretMsg, isLoading: isLoadingSecret, } = trpc.auth.getSecretMessage.useQuery()
    const updateIp = trpc.user.upsertUserIp.useMutation()
    const [isPending, startTransition] = useTransition();
    const { data: sessionData, status: sessionStatus } = useSession();
    const [_, setPersistedIp] = usePersistedState('ip', '')
    const [__, setData] = usePersistedState('data', {})

    const setUserIp = async () => {
        const userIp = await getClientIp()
        const ipRes = await updateIp.mutateAsync(userIp)
        console.log({ ipRes });

        startTransition(() => {
            setPersistedIp(userIp?.ip)
            setData(userIp)
        });

    }

    useEffect(() => { setUserIp() }, [])

    return (
        <div className="bg-gradient-to-b from-[#2e026d] to-[#15162c]">
            {(sessionStatus === 'loading' && window !== undefined) && <TopBarProgress />}

            <Head>
                <title>Affitime {sessionData?.email} dashboard</title>
                <meta name="description" content="Affiliate uygulamasi" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="mx-auto container  min-h-screen">

                <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
                    <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-[2rem]">
                        {(sessionStatus === 'loading') ? "Loading" : secretMsg}
                    </h1>

                    <div className='mt-6 text-white'>
                        Role: {sessionData?.role}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Dashboard


export const getServerSideProps: GetServerSideProps = async (context) => {

    const session = await getSession(context)

    if (!session) return {
        redirect: {
            destination: '/auth/signin',
            permanent: false
        }
    }

    return { props: { session } }

}