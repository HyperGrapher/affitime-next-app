/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { GetServerSideProps } from "next";
import { type NextPage, /*  NextApiRequest, InferGetServerSidePropsType  */ } from "next";
import { getSession } from "next-auth/react";
import TopBarProgress from "react-topbar-progress-indicator";
import PageCard from "../../../components/card/Card";
import ProductList from '../../../components/_partner/products/ProductList';
import ProductList2 from '../../../components/products/ProductList';

import { UserRoles } from '../../../interface/auth.interface';
import { trpc } from '../../../utils/trpc';
import { HiPlus } from 'react-icons/hi'
import LinkButton from "../../../components/buttons/LinkButton";
import Pager from "../../../components/pager/Pager";

// https://mantine.dev/hooks/use-pagination/
export const getServerSideProps: GetServerSideProps = async (context) => {

    const session = await getSession(context)

    context.res.setHeader(
        'Cache-Control',
        'public, s-maxage=60, stale-while-revalidate=120'
    )

    if (!session) return {
        redirect: {
            destination: '/auth/signin',
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

    const { data: products, status: prodStatus, refetch: refetchProducts } = trpc.product.getAllProductsForVendor.useQuery()

    return (
        <main className="auth-container">
            {prodStatus === 'loading' && <TopBarProgress />}

            <PageCard>

                <div className="flex items-center mb-6">

                    <div className="ml-2">
                        <h2 className="font-bold text-xl text-slate-700">Kampanya Ürünleri</h2>
                        {products && products?.length > 0 ? (
                            <small>
                                Toplam {products?.length} adet ürün
                            </small>
                        ) : null}
                    </div>

                </div>


                <section className="mb-4">

                    {/* <div>
                        {products?.map(p => <div className="mb-4 border-2 px-2 py-4" key={p.id}>
                            {p.title} - <small>{p.vendor.user.packageType}</small>

                        </div>)}
                    </div> */}

                    {products && products?.length > 0 ? <ProductList prod={products} refetch={refetchProducts} /> : null}

                </section>

                <Pager />

            </PageCard>
        </main>
    )
}

export default Products

