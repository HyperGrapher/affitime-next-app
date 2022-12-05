/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { type NextPage, NextApiRequest, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";
import { useRouter } from "next/router";
import { useEffect } from "react";
import FadingLoader from "../components/loader/FadingLoader";

// import dynamic from 'next/dynamic'
// import { Suspense } from 'react'

// const DynamicHeader = dynamic(() => import('../components/loader/FadingLoader'), {
//   suspense: true,
// })


const Dashboard: NextPage = () => {

    const { data: secretMsg, isLoading: isLoadingSecret, } = trpc.auth.getSecretMessage.useQuery()
    const { data: sessionData, status: sessionStatus } = useSession();
    const router = useRouter()


    useEffect(() => {
        if (sessionStatus === 'unauthenticated') router.push("/");
    }, [sessionData]);


    return (
        <div>
            <Head>
                <title>Affitime {sessionData?.email} dashboard</title>
                <meta name="description" content="Affiliate uygulamasi" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">

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