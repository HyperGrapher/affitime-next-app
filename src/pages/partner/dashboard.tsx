/* eslint-disable react-hooks/exhaustive-deps */
import type { GetServerSideProps } from "next";
import { type NextPage } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import { useEffect } from "react";
import TopBarProgress from "react-topbar-progress-indicator";
import { z } from "zod";
import { USER_IP_SESSION_STORAGE } from "../../config/constants";
import { UserRoles } from "../../interface/auth.interface";
import useNotificationStore from "../../store/notifications.store";
import getClientIp from "../../utils/getClientIp";
import { trpc } from "../../utils/trpc";
import { AppRoutes } from "../../config/appRoutes";


export const getServerSideProps: GetServerSideProps = async (context) => {

    const session = await getSession(context)
    session?.user?.id
    if (!session) return {
        redirect: {
            destination: AppRoutes.SIGNIN,
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

    const updateUserIp = trpc.user.updateUserIp.useMutation()
    const createUserIp = trpc.ips.createIp.useMutation()

    const { data: notifs, status: sts } = trpc.notifications.getUnreadNotificationsForPartner.useQuery()
    const setUnread = useNotificationStore(store => store.setUnread)

    useEffect(() => {
        setUnread(notifs?.length ?? 0)
    }, [notifs])


    const setUserIp = async () => {

        const isSaved = sessionStorage.getItem(USER_IP_SESSION_STORAGE)

        if (isSaved !== 'true') {
            try {
                const userIp = await getClientIp()
                const ipData = IpSchema.parse(userIp)
                await updateUserIp.mutateAsync(ipData)

                createUserIp.mutate({
                    ip: ipData.ip,
                    country: ipData?.country ?? "unknown",
                    ipInfo: ipData
                }, {
                    onSuccess() {
                        sessionStorage.setItem(USER_IP_SESSION_STORAGE, "true")
                    },
                })

            } catch (error) {
                console.log(error);
            }
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

