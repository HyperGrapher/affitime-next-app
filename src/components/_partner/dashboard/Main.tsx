/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo } from "react";
import TopBarProgress from "react-topbar-progress-indicator";
import type { IPartnerAndLinks } from "../../../interface/dashboard.interface";
import classNames from "../../../utils/classnames";
import { trpc } from "../../../utils/trpc";
import PageCard from "../../card/Card";


const Main = () => {

    const { data: calculated, isLoading: ld1 } = trpc.dashboardPartner.calculateLinksAndPayments.useQuery()
    const { data: linkStats, isLoading: ld2 } = trpc.dashboardPartner.getLinkStats.useQuery()
    // const { data: partnerLinks, isLoading: ld3 } = trpc.dashboardPartner.getPartnerAndLinks.useQuery()

    return (
        <div className="">
            {(ld1 && ld2 ) && <TopBarProgress />}

            <PageCard>
                <Title>Affiliate Linkleri</Title>
                <hr />
                <section className="mt-4 flex justify-between items-center flex-wrap xl:flex-nowrap gap-4">

                    <SqrBox
                        title={'Linkler'}
                        desc={"Affiliate link sayısı"}
                        info={linkStats?.all ?? "0"}

                    />


                    <SqrBox
                        title={'Onay Bekleyen'}
                        desc={"Onay Bekleyen link sayısı"}
                        info={linkStats?.awaiting ?? "0"}

                    />
                    <SqrBox
                        title={'Aktif'}
                        desc={"Aktif link sayısı"}
                        info={linkStats?.active ?? "0"}

                    />

                    <SqrBox
                        title={'Reddedilen'}
                        desc={"Reddedilen link sayısı"}
                        info={linkStats?.refused ?? "0"}

                    />

                    <SqrBox
                        title={'Pasif'}
                        desc={"Pasif link sayısı"}
                        info={linkStats?.passive ?? "0"}

                    />



                </section>

            </PageCard>

            <PageCard>
                <Title>Link Tıklamaları</Title>
                <hr />
                <section className="mt-4 flex justify-between flex-wrap xl:flex-nowrap gap-4">

                    <SqrBox
                        title={'Toplam'}
                        desc={"Affiliate link tıklamaları"}
                        info={calculated?.total ?? "0"}

                    />


                    <SqrBox
                        title={'Geçerli'}
                        desc={"Geçerli link tıklamaları"}
                        info={calculated?.valid ?? "0"}

                    />

                    <SqrBox
                        title={'Geçersiz'}
                        desc={"Bot tıklamaları"}
                        info={calculated?.invalid ?? "0"}

                    />

                </section>



            </PageCard>


        </div>
    )
}

export default Main



type PartnerItemProps = {
    pl: IPartnerAndLinks;

};


const PartnerItem: React.FC<PartnerItemProps> = ({ pl }) => {

    // useEffect(() => {

    // }, [pl])

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

                <p>Link Sayisi: {String(pc.links)}</p>
                <p>Urun sayisi: {String(pc.products)}</p>
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
    info: string | undefined;
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
