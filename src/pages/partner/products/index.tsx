import type { GetServerSideProps } from "next";
import { type NextPage } from "next";
import { getSession } from "next-auth/react";
import TopBarProgress from "react-topbar-progress-indicator";
import PartnerProductList from '../../../components/_partner/products/ProductList';
import PageCard from "../../../components/card/Card";
import { UserRoles } from '../../../interface/auth.interface';
import { trpc } from '../../../utils/trpc';
import { AppRoutes } from "../../../config/appRoutes";
import Head from "next/head";



// https://mantine.dev/hooks/use-pagination/
export const getServerSideProps: GetServerSideProps = async (context) => {

    const session = await getSession(context)

    context.res.setHeader(
        'Cache-Control',
        'public, s-maxage=60, stale-while-revalidate=120'
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


const Products: NextPage = () => {

    const { data: products, status: sts, refetch: refetchProducts } = trpc.product.getAllProductsForPartner.useQuery()

    return (
        <main className="auth-container">
            {sts === 'loading' && <TopBarProgress />}

            <Head>
                <title>Affitime | Ürünler</title>
            </Head>

            <PageCard>

                <div className="flex items-center mb-6">

                    <div className="ml-2">
                        <h2 className="font-bold text-xl text-slate-700">Kampanya Ürünleri</h2>
                        {products && products?.length > 0
                            ? (
                                <small>
                                    Toplam {products?.length} adet ürün
                                </small>
                            )
                            : null
                        }
                    </div>

                </div>


                <section className="mb-4">

                    {products && products?.length > 0
                        ? <PartnerProductList prod={products} refetch={refetchProducts} />
                        : null
                    }

                </section>

            </PageCard>
        </main>
    )
}

export default Products

