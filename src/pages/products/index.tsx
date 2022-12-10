/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { trpc } from '../../utils/trpc';
import Link from 'next/link';
import type { GetServerSideProps } from "next";
import { type NextPage, NextApiRequest, InferGetServerSidePropsType } from "next";
import { getSession, signIn, signOut, useSession } from "next-auth/react";
import { Product, Vendor } from '@prisma/client';
import { useState } from 'react';
import ProductList from '../../components/products/ProductList';
import TopBarProgress from "react-topbar-progress-indicator";


const Products: NextPage = () => {

    // const { data: sessionData, status } = useSession()
    const [error, setError] = useState('')
    const { data: vendor, status: prodStatus, refetch: refetchProducts } = trpc.product.getAllProductsBySessionVendor.useQuery()

    return (
        <div className="bg-zinc-800 min-h-screen" >
            {prodStatus === 'loading' && <TopBarProgress />}
            <main className='container mx-auto sm:w-5/6 lg:w-4/6'>
                <h2 className='text-4xl text-center text-slate-200'>Products</h2>

                <div className="flex flex-col items-center gap-2 mt-6">

                    <Link className="bg-blue-500 py-2 px-8 text-slate-50 text-xs" href={'/products/create'}>Create Product</Link>
                    <Link className="bg-green-500 py-2 px-8 text-slate-50 text-xs" href={'/'}>Home</Link>
                </div>

                <section className="mt-12">

                    <ProductList prod={vendor?.products} refetch={refetchProducts} />

                </section>
            </main>
        </div>
    )
}

export default Products

export const getServerSideProps: GetServerSideProps = async (context) => {

    const session = await getSession(context)

    if (!session) return {
        redirect: {
            destination: '/auth/signin',
            permanent: false
        }
    }

    if (session.role !== 'vendor') return {
        redirect: {
            destination: '/dashboard',
            permanent: false
        }
    }

    return { props: { userId: session.id } }

}