import React from 'react'
import { getSession } from "next-auth/react";
import type { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next";
import Link from 'next/link';


export const getServerSideProps: GetServerSideProps<{ url: string }> = async (context) => {

    const session = await getSession(context)

    const url = context.params?.url as string

    return {
        props: {
            url,
        }
    }

}


const NotFound = ({ url }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    return (
        <section className="text-gray-600 body-font">
            <div className="container px-5 py-24 mx-auto">
                <div className="text-center mb-20">
                    <h1 className="sm:text-3xl text-2xl font-medium text-center title-font text-gray-900 mb-4">Aranılan ürün bulunamadı</h1>
                    <p className="text-base leading-relaxed xl:w-2/4 lg:w-3/4 mx-auto">Ulaşmak istediğiniz link silinmiş yada artık aktif değil.</p>
                </div>
                <Link href="/" className="flex mx-auto mt-16 w-36 text-center text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg">
                    Anasayfa
                </Link>
            </div>
        </section>
    )
}

export default NotFound