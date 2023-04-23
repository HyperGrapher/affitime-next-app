/* eslint-disable react-hooks/exhaustive-deps */
import LinkIcon from '@mui/icons-material/Search';
import MuiIconButton from '@mui/material/IconButton';
import dynamic from 'next/dynamic';
import Image from "next/image";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import TopBarProgress from "react-topbar-progress-indicator";
import profileImg from '../../../assets/profile.webp';
import type { IPartnerAndLinks } from "../../../interface/dashboard.interface";
import classNames from "../../../utils/classnames";
import { trpc } from "../../../utils/trpc";
import PageCard from "../../card/Card";


const DynamicModalContainer = dynamic(() => import('../../modals/ModalContainer'), {
    ssr: false,
})

const DynamicLinksModal = dynamic(() => import('../../modals/PartnerLinksModal'), {
    ssr: false,
})


const Main = () => {

    const { data: calculated, isLoading: ld1 } = trpc.dashboardVendor.calculateLinksAndPayments.useQuery()
    const { data: linkStats, isLoading: ld2 } = trpc.dashboardVendor.getLinkStats.useQuery()
    const { data: partnerLinks, isLoading: ld3 } = trpc.dashboardVendor.getPartnerAndLinks.useQuery()

    return (
        <div className="">
            {(ld1 && ld2 && ld3) && <TopBarProgress />}

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
                        desc={"Onay bekleyen link sayısı"}
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
                        desc={"Bot ve partner tıklamaları"}
                        info={calculated?.invalid ?? "0"}

                    />

                </section>



            </PageCard>



            <PageCard>
                <Title>Tüm Partnerler</Title>
                <hr />

                <section className="mt-4 flex flex-col gap-4">


                    <VisitTable vd={partnerLinks} />


                </section>
            </PageCard>

        </div>
    )
}

export default Main

type TableProps = {
    vd: IPartnerAndLinks[] | undefined
}

const VisitTable: React.FC<TableProps> = ({ vd }) => {



    return (
        <div className="w-full xxmx-auto overflow-auto">

            <table className="table-auto w-full text-left whitespace-no-wrap text-xs sm:text-sm">
                <thead>
                    <tr>
                        <th className="px-2 py-2 md:px-4 md:py-2 title-font tracking-wider font-medium text-gray-900 text-xs md:text-sm bg-slate-100">Kullanıcı</th>
                        <th className="px-2 py-2 md:px-4 md:py-2 title-font tracking-wider font-medium text-gray-900 text-xs md:text-sm bg-slate-100">Toplam Link</th>
                        <th className="px-2 py-2 md:px-4 md:py-2 title-font tracking-wider font-medium text-gray-900 text-xs md:text-sm bg-slate-100">Aktif Link</th>
                        <th className="px-2 py-2 md:px-4 md:py-2 title-font tracking-wider font-medium text-gray-900 text-xs md:text-sm bg-slate-100">Detay</th>
                    </tr>
                </thead>
                <tbody>

                    {
                        vd?.map(x => (
                            <PartnerItem key={x.id} pl={x} />
                        ))
                    }

                </tbody>
            </table>
        </div>
    )
}




type PartnerItemProps = {
    pl: IPartnerAndLinks;

};


const PartnerItem: React.FC<PartnerItemProps> = ({ pl }) => {

    const [modal, setModal] = useState(false)


    const pc = useMemo(() => {
        const p = pl.partner_links.map(x => x)
        const act = pl.partner_links.filter(x => x.active)
        return { active: act.length, links: p.length }

    }, [pl])
    return (
        <tr>
            <td className="px-0 py-2 md:px-0 md:py-2 whitespace-nowrap">

                <div className="flex space-x-2 items-center">
                    <button
                        className="aspect-square w-8 h-8"
                        onClick={() => setModal(true)}
                    >
                        {pl.image ?
                            <img
                                className="object-cover hover:shadow rounded object-center w-12 h-12 aspect-square"
                                src={pl.image ?? ""}
                                alt={pl.username} />
                            : <Image
                                className={classNames(
                                    "object-cover rounded hover:shadow object-center",
                                    "w-8 h-8 aspect-square",
                                    "border border-1 border-stone-300",
                                    ""
                                )}
                                width={"64"}
                                height={"64"}
                                src={profileImg}
                                alt="Generic profile foto" />
                        }
                    </button>

                    <button
                        onClick={() => setModal(true)}
                        className="text-sm font-bold text-slate-500">
                        {pl.username}
                    </button>

                </div>

            </td>
            <td className="px-2 py-2 md:px-4 md:py-2 whitespace-nowrap text-gray-900 ">{String(pc.links)}</td>
            <td className={`px-2 py-2 md:px-4 md:py-2 whitespace-nowrap text-gray-900  `}>{String(pc.active)}</td>
            <td className={`px-2 py-2 md:px-4 md:py-2 whitespace-nowrap text-gray-900  `}>


                <MuiIconButton
                    size="small"
                    onClick={() => setModal(true)}
                    title="Detay"
                    aria-label="Detay">
                    <LinkIcon className="text-indigo-600 w-4 h-4" />
                </MuiIconButton>

            </td>

            <DynamicModalContainer setModal={() => setModal(false)} state={modal} key={"dynamicLinksModal"}>
                <DynamicLinksModal username={pl.username} links={pl.partner_links} setModal={() => setModal(false)} />
            </DynamicModalContainer>

        </tr>
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
            'bg-slate-100 hover:bg-slate-50 rounded  w-full md:w-fit min-w-[12rem] 2xl:w-full px-4 py-2 aspect-auto',
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
