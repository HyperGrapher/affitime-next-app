/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { trpc } from '../utils/trpc';
import Link from 'next/link';
import type { GetServerSideProps } from "next";
import { type NextPage, NextApiRequest, InferGetServerSidePropsType } from "next";
import { getSession, signIn, signOut, useSession } from "next-auth/react";
import { Product, Vendor } from '@prisma/client';
import { useState } from 'react';

const ptitles = [
    'NCMOTORS 2020 BAYİ AMG GT43 DESIGNO HEAD UP BURMESTR AIRMTC 360°',
    'LG 38 inch Ultrawide Monitor',
    'Fender Stratocaster 1974'
]
const pdescs = [
    'NC MOTORSTAN BAYİ ÇIKIŞLI 2020 MERCEDES AMG GT43+ 4MATIC 2024 KASIM AYINA KADAR GARANTİLİ',
    'Best LG Ultrawide screen',
    'Great Fender start from 1974 in good condition'
]

const ProductCreate: NextPage = () => {

    const { data, status } = useSession()
    const [createdProduct, setCreatedProduct] = useState<Product | undefined>()
    const [error, setError] = useState('')
    const createProd = trpc.product.createProduct.useMutation()
    const { data: vendor, status: prodStatus, refetch: refetchProducts } = trpc.product.getAllProductsBySessionVendor.useQuery()
    const deleteProd = trpc.product.deleteProduct.useMutation()



    const createProduct = async () => {
        const p = {
            title: ptitles[0] as string,
            desc: pdescs[0] as string,
            store_url: 'https://store.com/p/123',
            image: 'https://productImage.com/p/123',
            price: 68250.00,
        }

        const prodRes = await createProd.mutateAsync(p)

        if (!prodRes) {
            setError('Cannot create product')
            return
        }
        setCreatedProduct(prodRes)
        refetchProducts()

    }
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
        <div className='container'>
            <h2 className='text-4xl text-center'>Products</h2>


            <div className="flex flex-col items-center gap-2 mt-6">

                <button className="bg-blue-500 py-2 px-8 text-slate-50 text-xs" onClick={createProduct}>Create Product</button>
                <Link className="bg-green-500 py-2 px-8 text-slate-50 text-xs" href={'/'}>Home</Link>
            </div>

            {error && <p className="text-sm text-center mt-5 text-red-600">Error: {error} </p>}

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

        </div>
    )
}

export default ProductCreate

export const getServerSideProps: GetServerSideProps = async (context) => {

    const session = await getSession(context)

    if (!session) return {
        redirect: {
            destination: '/auth/signin',
            permanent: false
        }
    }

    return { props: { userId: session.id } }

}