/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { GetServerSideProps } from "next";
import { type NextPage, /*  NextApiRequest, InferGetServerSidePropsType  */ } from "next";
import { getSession } from "next-auth/react";
import TopBarProgress from "react-topbar-progress-indicator";
import PageCard from "../../../components/card/Card";
import ProductList from '../../../components/products/ProductList';
import { UserRoles } from '../../../interface/auth.interface';
import { trpc } from '../../../utils/trpc';
import { HiPlus } from 'react-icons/hi'
import LinkButton from "../../../components/buttons/LinkButton";
import { AppRoutes } from "../../../config/appRoutes";
// import { prisma } from "../../../server/db/client";

export const getServerSideProps: GetServerSideProps = async (context) => {

    const session = await getSession(context)

    // This value is considered fresh for ten seconds (s-maxage=10).
    // If a request is repeated within the next 10 seconds, the previously
    // cached value will still be fresh. If the request is repeated before 59 seconds,
    // the cached value will be stale but still render (stale-while-revalidate=59).
    //
    // In the background, a revalidation request will be made to populate the cache
    // with a fresh value. If you refresh the page, you will see the new value.

    context.res.setHeader(
        'Cache-Control',
        'public, s-maxage=10, stale-while-revalidate=59'
    )

    if (!session) return {
        redirect: {
            destination: '/auth/signin',
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

const Products: NextPage = () => {

    const { data: vendor, status: prodStatus, refetch: refetchProducts } = trpc.product.getAllProductsBySessionVendor.useQuery()

    return (
        <main className="auth-container">
            {prodStatus === 'loading' && <TopBarProgress />}

            <PageCard>

                <div className="flex items-center mb-6">

                    <div className="ml-2">
                        <h2 className="font-bold text-xl text-slate-700">Kampanya Ürünleri</h2>
                        {vendor?.products && vendor?.products.length > 0 ? (
                            <small>
                                Toplam {vendor?.products.length} adet ürün
                            </small>
                        ) : null}
                    </div>

                    <LinkButton
                        title={"Ürün Ekle"}
                        href={AppRoutes.VENDOR_CREATE_PRODUCT}
                        icon={<HiPlus color="white" size="16px" />}
                        twClasses="ml-auto w-38" />

                </div>


                <section className="">

                    <ProductList prod={vendor?.products} refetch={refetchProducts} />

                </section>

            </PageCard>
        </main>
    )
}

export default Products

