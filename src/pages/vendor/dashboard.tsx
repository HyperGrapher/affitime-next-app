/* eslint-disable react-hooks/exhaustive-deps */
import type { GetServerSideProps } from "next";
import { type NextPage } from "next";
import { getSession, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useEffect } from "react";
import TopBarProgress from "react-topbar-progress-indicator";
import { z } from "zod";
import { USER_IP_SESSION_STORAGE } from "../../config/constants";
import { UserRoles } from "../../interface/auth.interface";
import getClientIp from "../../utils/getClientIp";
import { trpc } from "../../utils/trpc";
import { AppRoutes } from "../../config/appRoutes";


export const getServerSideProps: GetServerSideProps = async (context) => {

    const session = await getSession(context)

    if (!session) return {
        redirect: {
            destination: AppRoutes.SIGNIN,
            permanent: false
        }
    }

    if (session.role !== UserRoles.VENDOR) return {
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

    const updateIp = trpc.user.updateUserIp.useMutation()
    const { data: sessionData, status: sessionStatus } = useSession();
    const createUserIp = trpc.ips.createIp.useMutation()

    const setUserIp = async () => {

        const isSaved = sessionStorage.getItem(USER_IP_SESSION_STORAGE)

        if (isSaved !== 'true') {
            try {
                const userIp = await getClientIp()
                const ipData = IpSchema.parse(userIp)
                await updateIp.mutateAsync(ipData)

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
            {(sessionStatus === 'loading') && <TopBarProgress />}
            <Head>
                <title>Affitime Dashboard</title>
                <meta name="description" content="Affiliate uygulamasi" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="mx-auto container min-h-screen">

                <h1>Dashboard</h1>

                <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">

                    <div className='mt-6 text-slate-500'>
                        Role: {sessionData?.role}
                    </div>
                    <Link className="underline text-blue-500" href={'/'}>Home</Link>
                </div>
            </main>
        </div>
    )
}

export default Dashboard

