/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { Tab } from '@headlessui/react';
import Link from "next/link";
import { useEffect, useState } from "react";
import Main from "../../../components/_vendor/dashboard/Main";
import TabItem from "../../../components/tab-item/TabItem";
import { AppRoutes } from "../../../config/appRoutes";
import { USER_IP_SESSION_STORAGE } from "../../../config/constants";
import { IpSchema } from "../../../interface/zod.schema";
import classNames from "../../../utils/classnames";
import getClientIp from "../../../utils/getClientIp";
import { trpc } from "../../../utils/trpc";
import PaymentsIndex from '../../../components/_vendor/payments/PaymentsIndex';

const Payments = () => {

    const [selectedIndex, setSelectedIndex] = useState(0)

    return (
        <div className="auth-container">

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
                        <TabItem id="0" title="Bekleyen Ödemeler" selected={selectedIndex} query="main" />
                        <TabItem id="1" title="Yapılan Ödemeler" selected={selectedIndex} query="second" />

                    </Tab.List>
                    <Tab.Panels>
                        <Tab.Panel>{selectedIndex === 0 && <PaymentsIndex />}</Tab.Panel>
                        <Tab.Panel>{selectedIndex === 1 && <div id="2" />}</Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>

            </main>
        </div>
    )
}

export default Payments
