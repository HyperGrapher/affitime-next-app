/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { trpc } from '../../utils/trpc';
import Link from 'next/link';
import type { GetServerSideProps } from "next";
import { type NextPage, NextApiRequest, InferGetServerSidePropsType } from "next";
import { getSession, signIn, signOut, useSession } from "next-auth/react";
import { Product, User, Vendor } from '@prisma/client';
import { useState } from 'react';
import ProductList from '../../components/products/ProductList';
import TopBarProgress from "react-topbar-progress-indicator";
import { UserRoles } from '../../interface/auth.interface';
import { prisma } from "../../server/db/client";


const Products: NextPage<{ data: User[] }> = (props) => {

    console.log(props);

    // const { data: sessionData, status } = useSession()
    const [error, setError] = useState('')
    const { data: vendor, status: prodStatus, refetch: refetchProducts } = trpc.product.getAllProductsBySessionVendor.useQuery()

    return (
        <div className="" >
            {prodStatus === 'loading' && <TopBarProgress />}
            <main className='mx-auto sm:w-5/6 lg:w-4/6'>
                <h2 className='text-4xl text-center text-slate-700'>Products</h2>

                <div className="flex flex-col items-center gap-2 mt-6">

                    <Link className="bg-blue-500 py-2 px-8 text-slate-50 text-xs" href={'/products/create'}>Create Product</Link>
                    <Link className="bg-green-500 py-2 px-8 text-slate-50 text-xs" href={'/'}>Home</Link>
                </div>

                <section className="mt-12">

                    <ProductList prod={vendor?.products} refetch={refetchProducts} />

                </section>

                {props?.data?.map((v) => <div className='text-white' key={v.id}>{v.email}</div>)}
            </main>
        </div>
    )
}

export default Products

export const getServerSideProps: GetServerSideProps = async (context) => {

    const session = await getSession(context)
    const query = context.query.id

    // ! DON'T Use api calls on getServerSideProps
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

    if (session.role !== UserRoles.VENDOR) return {
        redirect: {
            destination: '/dashboard',
            permanent: false
        }
    }

    const data = await prisma.user.findMany({
        select: {
            id: true,
            role: true,
            email: true,
            image: true,
            password: false,
            pro: true,
            trial: true,
            active: true,
            emailVerified: true,
            vendor: true,
            partner: true,
        }
    });

    prisma.$disconnect()


    if (!data) return {
        redirect: {
            destination: '/dashboard',
            permanent: false
        }
    }

    return { props: { data: JSON.parse(JSON.stringify(data)) } }

}