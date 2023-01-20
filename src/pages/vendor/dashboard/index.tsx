/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import type { GetServerSideProps } from "next";
import { type NextPage } from "next";
import { getSession, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { useEffect, useReducer, useState } from "react";
import TopBarProgress from "react-topbar-progress-indicator";
import { z } from "zod";
import { USER_IP_SESSION_STORAGE } from "../../../config/constants";
import { UserRoles } from "../../../interface/auth.interface";
import getClientIp from "../../../utils/getClientIp";
import { trpc } from "../../../utils/trpc";
import { AppRoutes } from "../../../config/appRoutes";
import classNames from "../../../utils/classnames";
import type { IDashboardData, IPartnerAndLinks, IVisitAndPayment } from "../../../interface/dashboard.interface";
import PageCard from "../../../components/card/Card";
import { Tab } from '@headlessui/react'
import { useRouter } from "next/router";
import { IpSchema } from "../../../interface/zod.schema";
import Main from "../../../components/_vendor/dashboard/Main";

const Dash = () => {

    const { status: sessionStatus } = useSession();
    const [selectedIndex, setSelectedIndex] = useState(0)


    const updateIp = trpc.user.updateUserIp.useMutation()
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

    const { push } = useRouter()



    return (
        <div className="auth-container">

            <main className="mx-auto container min-h-screen px-2 pt-6">

                <div className="mb-2">
                    <h1 className="text-slate-600 font-bold text-2xl">
                        Merhaba, Wendy Ticaret A.Ş.a
                    </h1>
                    <small className="text-slate-400 text-sm">
                        Tüm affiliate bilgilerınız bu sayfada bir arada görüntüleyebilirsiiniz.
                        <Link href={AppRoutes.VENDOR_LINKS}> </Link>
                    </small>
                </div>

                <Tab.Group defaultIndex={0} selectedIndex={selectedIndex} onChange={setSelectedIndex}>
                    <Tab.List className={classNames(
                        "flex space-x-8 "
                    )}>
                        <TabItem id="0" title="Genel" selected={selectedIndex} query="main" />
                        <TabItem id="1" title="Second" selected={selectedIndex} query="second" />
                        <TabItem id="2" title="Third" selected={selectedIndex} query="third" />

                    </Tab.List>
                    <Tab.Panels>
                        <Tab.Panel>{selectedIndex === 0 && <Main />}</Tab.Panel>
                        <Tab.Panel>{selectedIndex === 1 && <Pagem id="2" />}</Tab.Panel>
                        <Tab.Panel>{selectedIndex === 2 && <Pagem id="3" />}</Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>

            </main>
        </div>
    )
}

export default Dash

type props = {
    id: string
}

const Pagem: React.FC<props> = ({ id }) => {

    console.log('SUB PAGE RENDER' + id);



    return (
        <div>index {id}</div>
    )
}


type TabProps = {
    id: string,
    selected: number,
    query: string,
    title: string
}

const TabItem: React.FC<TabProps> = ({ id, selected, query, title }) => {

    const { push } = useRouter()

    return (
        <Tab
            className={classNames(
                "bg-slate-100  py-1 text-sm text-slate-500",
                `${String(selected) === id && "underline underline-offset-8 "}`,
                'outline-0 font-medium',
                ""
            )}
            onClick={() => push({ query: { tab: query } })}>
            {title}
        </Tab>
    )
}

