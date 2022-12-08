/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { trpc } from '../../utils/trpc';
import Link from 'next/link';
import type { GetServerSideProps } from "next";
import { type NextPage, NextApiRequest, InferGetServerSidePropsType } from "next";
import { getSession, signIn, signOut, useSession } from "next-auth/react";
import { Product, Vendor } from '@prisma/client';
import { useState } from 'react';


const Products: NextPage = () => {

    const { data: sessionData, status } = useSession()
    const [error, setError] = useState('')
    const { data: vendor, status: prodStatus, refetch: refetchProducts } = trpc.product.getAllProductsBySessionVendor.useQuery()
    const deleteProd = trpc.product.deleteProduct.useMutation()


    const deleteProduct = async (id: string) => {

        const deleteRes = await deleteProd.mutateAsync({ id })
        console.log({ deleteRes });

        if (!deleteRes) {
            setError('Cannot create product')
            return
        }
        refetchProducts()

    }

    if (status === 'loading') return <div>Loading</div>

    return (
        <div className="" >
            <main className='container mx-auto sm:w-3/6 lg:w-2/6'>
            <h2 className='text-4xl text-center'>Products</h2>


            <div className="flex flex-col items-center gap-2 mt-6">

                <Link className="bg-blue-500 py-2 px-8 text-slate-50 text-xs" href={'/products/create'}>Create Product</Link>
                <Link className="bg-green-500 py-2 px-8 text-slate-50 text-xs" href={'/'}>Home</Link>
            </div>

            <section className="mt-12">

                {vendor?.products.length === 0 ? <p className='text-center'>Henüz ürün eklemediniz</p> : (
                    <ul className='flex gap-4 flex-col'>
                        {vendor?.products.map(p => (
                            <li key={p.id} className="border-b-2 border-slate-400 shadow-lg">
                                <div className="bg-slate-200">
                                    <h4 className="text-lg">{p.title}</h4>
                                </div>

                                <div className="bg-blue-200 text-sm">
                                    {p.desc}
                                </div>

                                <button className="bg-red-500 py-2 px-2 text-slate-50 text-xs" onClick={() => deleteProduct(p.id)}>Delete</button>

                            </li>))
                        }
                    </ul>
                )}

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