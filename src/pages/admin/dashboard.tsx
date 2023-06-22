
import type { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { AppRoutes } from "../../config/appRoutes";
import { UserRoles } from "../../interface/auth.interface";
import classNames from "../../utils/classnames";
import PageCard from "../../components/card/Card";
import { trpc } from "../../utils/trpc";

const AdminDashboard = () => {

    const { data: calculated, isLoading: ld1 } = trpc.dashboardVendor.calculateLinksAndPayments.useQuery()
    const { data: linkStats, isLoading: ld2 } = trpc.dashboardVendor.getLinkStats.useQuery()
    const { data: partnerLinks, isLoading: ld3 } = trpc.dashboardVendor.getPartnerAndLinks.useQuery()


    return (
        <div className="mt-8">

            <main className="mx-auto container min-h-screen px-2 pt-6">

                <PageCard>

                    <section className="mt-4 flex justify-between items-center flex-wrap xl:flex-nowrap gap-4">
                        <SqrBox
                            title={'Vendor'}
                            desc={"Toplam kayitli vendor"}
                            info={"245"}

                        />

                        <SqrBox
                            title={'Partner'}
                            desc={"Toplam kayitli partner"}
                            info={"245"}

                        />

                        <SqrBox
                            title={'Urun'}
                            desc={"Toplam urun"}
                            info={"245"}

                        />

                        <SqrBox
                            title={'Link'}
                            desc={"Toplam link"}
                            info={"245"}

                        />
                    </section>

                </PageCard>

            </main>
        </div>
    )
}

export default AdminDashboard

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



type TableProps = {
    vd: string[] | undefined
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
                            <div className="partnerItem" key={x} >{x} </div>
                        ))
                    }

                </tbody>
            </table>
        </div>
    )
}



export const getServerSideProps: GetServerSideProps = async (context) => {

    const session = await getSession(context)

    if (!session) return {
        redirect: {
            destination: AppRoutes.SIGNIN,
            permanent: false
        }
    }

    if (session.role !== UserRoles.ADMIN) return {
        redirect: {
            destination: `/${session.role.toLowerCase()}/dashboard`,
            permanent: false
        }
    }

    return { props: {} }

}
