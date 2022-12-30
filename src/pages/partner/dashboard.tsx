/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { GetServerSideProps } from "next";
import { type NextPage } from "next";
import { getSession, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useTransition } from "react";
import TopBarProgress from "react-topbar-progress-indicator";
import { z } from "zod";
import usePersistedState from "../../hooks/usePersistedState";
import getClientIp from "../../utils/getClientIp";
import { trpc } from "../../utils/trpc";
import { UserRoles } from "../../interface/auth.interface";
import useNotificationStore from "../../store/notifications.store";
// import { type NextPage, NextApiRequest, InferGetServerSidePropsType } from "next";

// import dynamic from 'next/dynamic'
// import { Suspense } from 'react'

// const DynamicHeader = dynamic(() => import('../components/loader/FadingLoader'), {
//   suspense: true,
// })


export const getServerSideProps: GetServerSideProps = async (context) => {

    const session = await getSession(context)

    if (!session) return {
        redirect: {
            destination: '/auth/signin',
            permanent: false
        }
    }

    if (session.role !== UserRoles.PARTNER) return {
        redirect: {
            destination: `/${session.role.toLowerCase()}/dashboard`,
            permanent: false
        }
    }

    return { props: { userId: session.id } }

}

const IpSchema = z
    .object({
        ip: z.string(),
        network: z.string().optional(),
        city: z.string().optional(),
        region: z.string().optional(),
        country: z.string().optional(),
        country_name: z.string().optional(),
        currency: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        org: z.string().optional(),
        in_eu: z.boolean().optional(),
    })

const Dashboard: NextPage = () => {

    const { data: secretMsg, isLoading: isLoadingSecret, } = trpc.auth.getSecretMessage.useQuery()
    const updateIp = trpc.user.updateUserIp.useMutation()
    const [isPending, startTransition] = useTransition();
    const { data: sessionData, status: sessionStatus } = useSession();
    const [_, setPersistedIp] = usePersistedState('ip', '')
    const [__, setData] = usePersistedState('data', {})
    const { query } = useRouter()
    const { reg } = query // is user just registered?

    const { data: notifs } = trpc.notifications.getUnreadNotificationsForPartner.useQuery()
    const setUnread = useNotificationStore(store => store.setUnread)

    useEffect(() => {
        setUnread(notifs?.length ?? 0)
    }, [notifs])


    const setUserIp = async () => {

        try {
            const userIp = await getClientIp()
            const ipData = IpSchema.parse(userIp)
            const ipRes = await updateIp.mutateAsync(ipData)
            console.log({ ipRes });

            startTransition(() => {
                setPersistedIp(userIp?.ip)
                setData(userIp)
            });
        } catch (error) {
            console.log(error);
        }


    }

    useEffect(() => { setUserIp() }, [])

    return (
        <div className="auth-container">
            {(sessionStatus === 'loading') && <TopBarProgress />}
            <Head>
                <title>Affitime Dashboard</title>
                <meta name="description" content="Affiliate uygulamasi" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="mx-auto container min-h-screen">

                <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-700 sm:text-[2rem]">
                        {(sessionStatus === 'loading') ? "Loading" : secretMsg}
                    </h1>

                    <div className='mt-6 text-slate-500'>
                        Role: {sessionData?.role}
                        <br />
                        Profil ID: {sessionData?.partnerId}
                    </div>
                    <Link className="underline text-blue-500" href={'/'}>Home</Link>
                </div>
            </main>
        </div>
    )
}

export default Dashboard

