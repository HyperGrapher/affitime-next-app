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

export const getServerSideProps: GetServerSideProps = async (context) => {

    const session = await getSession(context)
    const query = context.query.id

    // ? DON'T Use api calls on getServerSideProps
    // const res = await fetch('http://localhost:3000/api/examples', {
    //     headers: {
    //       cookie: context.req.headers.cookie || "",
    //     },
    //   })
    // const data = await res.json() ?? null

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

    if (session.role !== UserRoles.PARTNER) return {
        redirect: {
            destination: `/${session.role.toLowerCase()}/dashboard`,
            permanent: false
        }
    }

    // const data = await prisma.user.findMany({
    //     select: {
    //         id: true,
    //         role: true,
    //         email: true,
    //         image: true,
    //         password: false,
    //         pro: true,
    //         trial: true,
    //         active: true,
    //         emailVerified: true,
    //         vendor: true,
    //         partner: true,
    //     }
    // });

    // prisma.$disconnect()


    // if (!data) return {
    //     redirect: {
    //         destination: `/${session.role.toLowerCase()}/dashboard`,
    //         permanent: false
    //     }
    // }

    return { props: {} }
    // return { props: { data: JSON.parse(JSON.stringify(data)) } }

}

const pr = {
    "id": "clbxcin8d0001cqj0i2lw6cld",
    "title": "1974 Fender Stratocaster, Sunburst",
    "vendor": {
        "id": "clbjqz7kk0003cqns571g7ggc",
        "userId": "clbjqz7k40000cqnsntrpxsft",
        "user": {
            "image": null,
            "active": true,
            "trial": true,
            "pro": false,
            "packageType": "BASIC"
        }
    }
}

const Products: NextPage = () => {

    const { data: products, status: prodStatus, refetch: refetchProducts } = trpc.product.getAllProductsForVendor.useQuery()

    return (
        <main className="px-1">
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

                    {products && products?.length > 0 ?  <ProductList prod={products} refetch={refetchProducts} /> : null}

                </section>

                <Pager />

            </PageCard>
        </main>
    )
}

export default Products

