/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { trpc } from '../../utils/trpc';
import Link from 'next/link';
import type { GetServerSideProps } from "next";
import { type NextPage, NextApiRequest, InferGetServerSidePropsType } from "next";
import { getSession, signIn, signOut, useSession } from "next-auth/react";
import { Product, Vendor } from '@prisma/client';
import { useState } from 'react';
import { useRouter } from 'next/router'
import TopBarProgress from 'react-topbar-progress-indicator';
import { UserRoles } from '../../interface/auth.interface';


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
    const [busy, setBusy] = useState(false)
    const createProduct = trpc.product.createProduct.useMutation()
    const { back } = useRouter()


    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onCreateProduct = async (e: React.FormEvent<any>) => {
        setBusy(true)
        e.preventDefault()

        const p = {
            title: e.currentTarget?.title?.value,
            desc: e.currentTarget?.desc?.value,
            product_url: e.currentTarget?.product_url?.value,
            image: e.currentTarget?.image?.value,
            price: e.currentTarget?.price?.valueAsNumber,
        }

        console.log(p);


        const prodRes = await createProduct.mutateAsync(p)

        if (!prodRes) {
            setBusy(false)
            setError('Cannot create product')
            return
        }

        setBusy(false)
        back()
        // setCreatedProduct(prodRes)


    }


    if (status === 'loading') return <div>Loading</div>

    return (
        <div className='min-h-screen'>
            <main className='container mx-auto sm:w-3/6 lg:w-2/6'>
                <h2 className='text-4xl text-center font-bold'>Create Product</h2>
                <div className="flex flex-col items-center gap-2 mt-6">

                    <Link className="bg-green-500 py-2 px-8 text-slate-50 text-xs" href={'/products'}>Back</Link>
                </div>

                {error && <p className="text-sm text-center mt-5 text-red-600">Error: {error} </p>}

                <section className="mt-12 ">

                    <form className="flex flex-col gap-4" onSubmit={onCreateProduct}>

                        <input className='block w-full rounded-md border-gray-300 shadow-sm 
                            focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                            type="text"
                            name="title"
                            id="title"
                            min={'5'}
                            placeholder='Urun ismi'
                        />

                        <input className='block w-full rounded-md border-gray-300 shadow-sm 
                            focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                            type="text"
                            name="desc"
                            id="desc"
                            min={'5'}
                            placeholder='Urun Aciklamasi'
                        />


                        <input className='block w-full rounded-md border-gray-300 shadow-sm 
                            focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                            type="text"
                            name="product_url"
                            id="product_url"
                            placeholder='Urun Magaza Linki'
                        />


                        <input className='block w-full rounded-md border-gray-300 shadow-sm 
                            focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                            type="number"
                            name="price"
                            id="price"
                            placeholder='Urun Fiyati'
                        />


                        <input className='block w-full rounded-md border-gray-300 shadow-sm 
                            focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                            type="text"
                            name="image"
                            id="iamge"
                            placeholder='Urun Gorsel Linki'
                        />


                        <button type='submit' className="bg-blue-500 py-2 px-8 text-slate-50 text-xs">Create Product</button>

                    </form>

                </section>
            </main>

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
    if (session.role !== UserRoles.VENDOR) return {
        redirect: {
            destination: '/dashboard',
            permanent: false
        }
    }

    return { props: { userId: session.id } }

}