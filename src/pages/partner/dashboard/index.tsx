/* eslint-disable react-hooks/exhaustive-deps */
import { Tab } from '@headlessui/react';
import type { GetServerSideProps } from "next";
import { getSession, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Main from "../../../components/_partner/dashboard/Main";
import TabItem from "../../../components/tab-item/TabItem";
import { AppRoutes } from '../../../config/appRoutes';
import { USER_IP_SESSION_STORAGE } from "../../../config/constants";
import { UserRoles } from '../../../interface/auth.interface';
import { IpSchema } from "../../../interface/zod.schema";
import classNames from "../../../utils/classnames";
import getClientIp from "../../../utils/getClientIp";
import { trpc } from "../../../utils/trpc";
import Head from "next/head";


const DashboardVendor = () => {

    const [selectedIndex, setSelectedIndex] = useState(0)

    const updateIp = trpc.user.updateUserIp.useMutation()
    const createUserIp = trpc.ips.createIp.useMutation()

    const { data: session } = useSession()

    const setUserIp = async () => {

        const saved = sessionStorage.getItem(USER_IP_SESSION_STORAGE)

        if (!saved) {
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

            <Head>
                <title>Affitime | Dashboard</title>
            </Head>

            <main className="mx-auto container min-h-screen px-2 pt-6">

                <div className="mb-2">
                    <h1 className="text-slate-600 font-bold text-2xl">
                        Merhaba, {session?.email}
                    </h1>
                    <small className="text-slate-400 text-sm">
                        Tüm affiliate bilgilerini bu sayfada görüntüleyebilirsin
                    </small>
                </div>

                <Tab.Group defaultIndex={0} selectedIndex={selectedIndex} onChange={setSelectedIndex}>
                    <Tab.List className={classNames(
                        "flexx space-x-8 hidden"
                    )}>
                        <TabItem id="0" title="Genel" selected={selectedIndex} query="0" />
                        <TabItem id="1" title="Second" selected={selectedIndex} query="1" />
                        <TabItem id="2" title="Third" selected={selectedIndex} query="2" />

                    </Tab.List>
                    <Tab.Panels>
                        <Tab.Panel>{selectedIndex === 0 && <Main />}</Tab.Panel>
                        <Tab.Panel>{selectedIndex === 1 && <div id="2" />}</Tab.Panel>
                        <Tab.Panel>{selectedIndex === 2 && <div id="3" />}</Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>

            </main>
        </div>
    )
}

export default DashboardVendor



export const getServerSideProps: GetServerSideProps = async (context) => {

    const session = await getSession(context)

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