/* eslint-disable react-hooks/exhaustive-deps */
import type { GetServerSideProps } from "next";
import { type NextPage } from "next";
import { getSession, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useReducer } from "react";
import TopBarProgress from "react-topbar-progress-indicator";
import { z } from "zod";
import { USER_IP_SESSION_STORAGE } from "../../config/constants";
import { UserRoles } from "../../interface/auth.interface";
import getClientIp from "../../utils/getClientIp";
import { trpc } from "../../utils/trpc";
import { AppRoutes } from "../../config/appRoutes";
import classNames from "../../utils/classnames";
import type { IDashboardData } from "../../interface/dashboard.interface";


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

    const [data, updateData] = useReducer(
        (prev: IDashboardData, next: IDashboardData): IDashboardData => {
            return { ...prev, ...next };
        },
        {
            all: "",
            active: "",
            passive: "",
            refused: "",
            awaiting: "",
            total: "",
            valid: "",
            declined: "",
        }
    );

    const updateIp = trpc.user.updateUserIp.useMutation()
    const { status: sessionStatus } = useSession();
    const createUserIp = trpc.ips.createIp.useMutation()
    trpc.dashboard.getXForVendor.useQuery(undefined, {
        onSuccess(data) {

            updateData(data)
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
            <main className="mx-auto container min-h-screen p-6">

                <div className="mb-8">
                    <h1 className="text-slate-600 font-bold text-2xl">
                        Merhaba, Wendy Ticaret A.Ş.
                    </h1>
                    <small className="text-slate-400 text-sm">
                        Tüm affiliate bilgilerınız bu sayfada bir arada görüntüleyebilirsiiniz.
                        <Link href={AppRoutes.VENDOR_LINKS}> Affi</Link>
                    </small>
                </div>


                <Title>Affiliate Linkleri</Title>
                <hr />
                <section className="mt-2 flex justify-between xs:flex-wrap md:flex-wrap gap-4">
                    <SqrBox
                        title={'Linkler'}
                        desc={"Vendor affiliate link sayısı"}
                        info={data.all}

                    />



                    <SqrBox
                        title={'Onay Bekleyen'}
                        desc={"Aktif link sayısı"}
                        info={data.awaiting}

                    />
                    <SqrBox
                        title={'Aktif'}
                        desc={"Aktif link sayısı"}
                        info={data.active}

                    />

                    <SqrBox
                        title={'Rededilen'}
                        desc={"Rededlen link sayısı"}
                        info={data.refused}

                    />

                    <SqrBox
                        title={'Pasif'}
                        desc={"Pasif link sayısı"}
                        info={data.passive}

                    />



                </section>

                <Title>Linkleri Tıklamaları</Title>
                <hr />
                <section className="mt-2 flex justify-between xs:flex-wrap md:flex-wrap gap-4">


                    <SqrBox
                        title={'Toplam'}
                        desc={"Affiliate link tıklamaları"}
                        info={data.total}

                    />


                    <SqrBox
                        title={'Geçerli'}
                        desc={"Geçerli link tıklamaları"}
                        info={data.valid}

                    />

                    <SqrBox
                        title={'Geçersiz'}
                        desc={"Partner link tıklamaları"}
                        info={data['declined']}

                    />




                </section>

            </main>
        </div>
    )
}

export default Dashboard

const Title: React.FC<TitleProps> = ({ children }) => <h1
    className="mt-8 text-xl font-bold text-slate-600">
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
            'bg-white rounded xs:w-full-md:w-64 min-w-[12rem] 2xl:w-full px-4 py-2 aspect-auto',
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
