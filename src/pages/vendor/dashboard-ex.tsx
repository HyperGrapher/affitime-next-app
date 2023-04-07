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
import { USER_IP_SESSION_STORAGE } from "../../config/constants";
import { UserRoles } from "../../interface/auth.interface";
import getClientIp from "../../utils/getClientIp";
import { trpc } from "../../utils/trpc";
import { AppRoutes } from "../../config/appRoutes";
import classNames from "../../utils/classnames";
import type { IDashboardData, IPartnerAndLinks, IVisitAndPayment } from "../../interface/dashboard.interface";
import PageCard from "../../components/card/Card";


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


    const { status: sessionStatus } = useSession();

    const [partnerLinks, setPartnerLinks] = useState<IPartnerAndLinks[] | undefined>()

    const [linkStats, updateLinkStats] = useReducer(
        (prev: IDashboardData, next: IDashboardData): IDashboardData => {
            return { ...prev, ...next };
        },
        {
            all: "0",
            active: "0",
            passive: "0",
            refused: "0",
            awaiting: "0",
        }
    );

    const [visitStats, updateVisitStats] = useReducer(
        (prev: IVisitAndPayment, next: IVisitAndPayment): IVisitAndPayment => {
            return { ...prev, ...next };
        },
        {
            unpaidTotal: "0",
            paidTotal: "0",
            unpaid: "0",
            paid: "0",
            total: "0",
            valid: "0",
            invalid: "0",
        }
    );

    const updateIp = trpc.user.updateUserIp.useMutation()
    const createUserIp = trpc.ips.createIp.useMutation()

    trpc.dashboardVendor.calculateLinksAndPayments.useQuery(undefined, {
        onSuccess(data) {

            updateVisitStats(data);

        },
    })
    trpc.dashboardVendor.getLinkStats.useQuery(undefined, {
        onSuccess(data) {

            updateLinkStats(data)
        },
    })
    trpc.dashboardVendor.getPartnerAndLinks.useQuery(undefined, {
        onSuccess(data) {

            setPartnerLinks(data)

        },
    })

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
            </Head>
            <main className="mx-auto container min-h-screen px-2 pt-6">

                <div className="mb-8">
                    <h1 className="text-slate-600 font-bold text-2xl">
                        Merhaba, Wendy Ticaret A.Ş.
                    </h1>
                    <small className="text-slate-400 text-sm">
                        Tüm affiliate bilgilerınız bu sayfada bir arada görüntüleyebilirsiiniz.
                        <Link href={AppRoutes.VENDOR_LINKS}> </Link>
                    </small>
                </div>

                <PageCard>
                    <Title>Affiliate Linkleri</Title>
                    <hr />
                    <section className="mt-4 flex justify-between items-center xs:flex-wrap md:flex-wrap gap-4">
                        <SqrBox
                            title={'Linkler'}
                            desc={"Vendor affiliate link sayısı"}
                            info={linkStats.all}

                        />



                        <SqrBox
                            title={'Onay Bekleyen'}
                            desc={"Aktif link sayısı"}
                            info={linkStats.awaiting}

                        />
                        <SqrBox
                            title={'Aktif'}
                            desc={"Aktif link sayısı"}
                            info={linkStats.active}

                        />

                        <SqrBox
                            title={'Rededilen'}
                            desc={"Rededlen link sayısı"}
                            info={linkStats.refused}

                        />

                        <SqrBox
                            title={'Pasif'}
                            desc={"Pasif link sayısı"}
                            info={linkStats.passive}

                        />



                    </section>

                </PageCard>

                <PageCard>
                    <Title>Link Tıklamaları</Title>
                    <hr />
                    <section className="mt-4 flex justify-between xs:flex-wrap md:flex-wrap gap-4">


                        <SqrBox
                            title={'Toplam'}
                            desc={"Affiliate link tıklamaları"}
                            info={visitStats.total}

                        />


                        <SqrBox
                            title={'Geçerli'}
                            desc={"Geçerli link tıklamaları"}
                            info={visitStats.valid}

                        />

                        <SqrBox
                            title={'Geçersiz'}
                            desc={"Bot ve partner tıklamaları"}
                            info={visitStats['invalid']}

                        />

                    </section>



                </PageCard>



                <PageCard>
                    <Title>Partner Performanslari</Title>
                    <hr />

                    <section className="mt-4 flex flex-col gap-4">

                        {
                            partnerLinks?.map(x => <PartnerItem key={x.id} pl={x} />)
                        }

                    </section>
                </PageCard>

            </main>
        </div>
    )
}

export default Dashboard


type PartnerItemProps = {
    pl: IPartnerAndLinks;

};


const PartnerItem: React.FC<PartnerItemProps> = ({ pl }) => {


    const pc = useMemo(() => {
        const p = pl.partner_links.map(x => x)
        const act = pl.partner_links.filter(x => x.active)
        const unique = [...new Set(p.map(x => x.product_id))]
        return { products: unique.length, active: act.length, links: p.length }

    }, [pl])
    return (
        <div
            className="">

            <div className="flex items-center justify-between">
                <b className="text-blue-500">{pl.username}</b>

                <p>Link Sayısı: {String(pc.links)}</p>
                <p>Ürün Sayısı: {String(pc.products)}</p>
                <p>Aktif: {String(pc.active)}</p>

                <Link href={'/'}>Detaylar</Link>
            </div>

        </div>
    )
}

const Title: React.FC<TitleProps> = ({ children }) => <h1
    className="mt- text-xl font-bold text-slate-600">
    {children}
</h1>


type TitleProps = {
    children: ReactNode;

};
type Props = {
    title: string;
    desc: string;
    info: string;
};

const SqrBox: React.FC<Props> = ({ title, desc, info }) => {
    return (
        <section className={classNames(
            'bg-slate-100 hover:bg-slate-50 rounded xs:w-full-md:w-64 min-w-[12rem] 2xl:w-full px-4 py-2 aspect-auto',
            'shadow hover:shadow-md shadow-slate-300 bg-greenx-100',
            'flex items-center'

        )}>
            <div className="bg-redx-100 ">
                <div className="flex flex-col">
                    <h1 className="text-slate-600 font-bold text-xl">
                        {title}
                    </h1>
                    <small className="text-slate-400 whitespace-nowrap">{desc}</small>
                </div>

                <h2 className="mt-2 text-slate-600 font-bold text-3xl">
                    {info}
                </h2>
            </div>
        </section>
    )
}
