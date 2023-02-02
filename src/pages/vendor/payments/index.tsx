/* eslint-disable react-hooks/exhaustive-deps */
import { Tab } from '@headlessui/react';
import { getSession } from 'next-auth/react';
import Link from "next/link";
import type { GetServerSideProps } from 'next/types';
import { useState } from "react";
import TopBarProgress from 'react-topbar-progress-indicator';
import AwaitingPayments from '../../../components/_vendor/payments/AwaitingPayments';
import PaymentsCompleted from '../../../components/_vendor/payments/PaymentsCompleted';
import TabItem from "../../../components/tab-item/TabItem";
import { AppRoutes } from "../../../config/appRoutes";
import { UserRoles } from '../../../interface/auth.interface';
import classNames from "../../../utils/classnames";
import { trpc } from "../../../utils/trpc";
import Head from "next/head";


const Payments = () => {

    const [selectedIndex, setSelectedIndex] = useState(0)

    const { data: partnersWithVisits, status: sts } = trpc.payments.getUnpaidPartners.useQuery(undefined, {})


    return (
        <div className="auth-container">
            {sts === "loading" && <TopBarProgress />}

            <Head>
                <title>Affitime | Ödemeler</title>
            </Head>
            <main className="mx-auto container min-h-screen px-2 pt-6">

                <div className="mb-2">
                    <h1 className="text-slate-600 font-bold text-2xl">
                        Ödemelerim
                    </h1>
                    <small className="text-slate-400 text-sm">
                        Ödeme detaylarınızı bu sayfada görüntüleyebilirsiiniz.
                        <Link href={AppRoutes.VENDOR_LINKS}> </Link>
                    </small>
                </div>

                <Tab.Group defaultIndex={0} selectedIndex={selectedIndex} onChange={setSelectedIndex}>
                    <Tab.List className={classNames(
                        "flex space-x-8 "
                    )}>
                        <TabItem id="0" title="Bekleyen Ödemeler" selected={selectedIndex} query="awaiting" />
                        <TabItem id="1" title="Yapılan Ödemeler" selected={selectedIndex} query="completed" />

                    </Tab.List>
                    <Tab.Panels>
                        <Tab.Panel>{selectedIndex === 0 && <AwaitingPayments partners={partnersWithVisits} />}</Tab.Panel>
                        <Tab.Panel>{selectedIndex === 1 && <PaymentsCompleted />}</Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>

            </main>
        </div>
    )
}

export default Payments



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

    return { props: {} }
}