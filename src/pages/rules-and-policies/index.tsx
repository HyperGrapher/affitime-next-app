import { Tab } from '@headlessui/react';
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from "react";
import PageCard from '../../components/card/Card';
import TabItem from "../../components/tab-item/TabItem";
import classNames from "../../utils/classnames";


const PrivacyPolicy = dynamic(() => import('../../components/rules-and-policies/PrivacyPolicy'), {
    ssr: false,
})

const CookiePolicy = dynamic(() => import('../../components/rules-and-policies/CookiePolicy'), {
    ssr: false,
})

const UserAgreement = dynamic(() => import('../../components/rules-and-policies/UserAgreement'), {
    ssr: false,
})


const RulesAndPolicies = ({ tab }: InferGetServerSidePropsType<typeof getServerSideProps>) => {

    const [selectedIndex, setSelectedIndex] = useState(0)

    const { data } = useSession()

    useEffect(() => {

        tab && setSelectedIndex(Number(tab))

    }, [tab])


    return (
        <div className={data ? 'auth-container' : "container mx-auto"}>

            <Tab.Group defaultIndex={0} selectedIndex={selectedIndex} onChange={setSelectedIndex}>
                <Tab.List className={classNames(
                    "flex space-x-8 mt-16"
                )}>
                    <TabItem id="0" title="Kullanıcı Sözleşmesi" selected={selectedIndex} query="0" />
                    <TabItem id="1" title="Gizlilik Sözleşmesi" selected={selectedIndex} query="1" />
                    <TabItem id="2" title="Çerez Politikası" selected={selectedIndex} query="2" />

                </Tab.List>
                <Tab.Panels>
                    <PageCard>
                        <Tab.Panel>{selectedIndex === 0 && <UserAgreement />}</Tab.Panel>
                        <Tab.Panel>{selectedIndex === 1 && <PrivacyPolicy />}</Tab.Panel>
                        <Tab.Panel>{selectedIndex === 2 && <CookiePolicy />}</Tab.Panel>
                    </PageCard>
                </Tab.Panels>
            </Tab.Group>
        </div>
    )
}

export default RulesAndPolicies

export const getServerSideProps: GetServerSideProps<{ tab: string }> = async (context) => {

    const tab = context.query?.tab as string

    context.res.setHeader(
        'Cache-Control',
        'public, s-maxage=10, stale-while-revalidate=59'
    )


    return { props: { tab: tab ?? 0 } }

}
