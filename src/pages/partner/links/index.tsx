import type { GetServerSideProps } from "next";
import { type NextPage } from "next";
import { getSession } from "next-auth/react";
import TopBarProgress from "react-topbar-progress-indicator";
import LinkList from '../../../components/_partner/links/LinkList';
import PageCard from "../../../components/card/Card";
import { AppRoutes } from "../../../config/appRoutes";
import { UserRoles } from "../../../interface/auth.interface";
import { trpc } from '../../../utils/trpc';
import Head from "next/head";


export const getServerSideProps: GetServerSideProps = async (context) => {

    const session = await getSession(context)


    context.res.setHeader(
        'Cache-Control',
        'public, s-maxage=10, stale-while-revalidate=59'
    )

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
// https://mantine.dev/hooks/use-pagination/
const PartnerLinks: NextPage = () => {
    const { data: links, status: sts, refetch: refetchlinks } = trpc.link.getPartnerLinks.useQuery()

    return (
        <main className="auth-container">
            {sts === 'loading' && <TopBarProgress />}

            <Head>
                <title>Affitime | Linkler</title>
            </Head>

            <PageCard>

                <div className="flex items-center mb-6">

                    <div className="ml-2">
                        <h2 className="font-bold text-xl text-slate-700">Affiliate Linkleri</h2>
                        {links && links?.length > 0 ? (
                            <small>
                                Toplam {links?.length} adet link
                            </small>
                        ) : (<small>Affiliate linkleriniz burada listelenecektir. </small>)}
                    </div>

                </div>


                <section className="mb-4">


                    {links && links?.length > 0
                        ? <LinkList links={links} refetch={refetchlinks} />
                        : null}

                </section>


            </PageCard>
        </main>
    )
}

export default PartnerLinks