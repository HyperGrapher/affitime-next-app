/* eslint-disable react-hooks/exhaustive-deps */
import type { GetServerSideProps } from "next";
import { type NextPage } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import { useEffect } from "react";
import TopBarProgress from "react-topbar-progress-indicator";
import { z } from "zod";
import { UserRoles } from "../../interface/auth.interface";
import useNotificationStore from "../../store/notifications.store";
import getClientIp from "../../utils/getClientIp";
import { trpc } from "../../utils/trpc";

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

    return { props: {} }

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

    const updateIp = trpc.user.updateUserIp.useMutation()

    const { data: notifs, status: sts } = trpc.notifications.getUnreadNotificationsForPartner.useQuery()
    const setUnread = useNotificationStore(store => store.setUnread)

    useEffect(() => {
        setUnread(notifs?.length ?? 0)
    }, [notifs])


    const setUserIp = async () => {

        try {
            const userIp = await getClientIp()
            const ipData = IpSchema.parse(userIp)
            await updateIp.mutateAsync(ipData)



        } catch (error) {
            console.log(error);
        }


    }

    useEffect(() => { setUserIp() }, [])

    return (
        <div className="auth-container">
            {sts === 'loading' && <TopBarProgress />}
            <Head>
                <title>Affitime Dashboard</title>
                <meta name="description" content="Affiliate uygulamasi" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

        </div>
    )
}

export default Dashboard

