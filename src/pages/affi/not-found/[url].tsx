import React from 'react'
import { getSession } from "next-auth/react";
import type { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next";


export const getServerSideProps: GetServerSideProps = async (context) => {

    const session = await getSession(context)

    const url = context.params?.url as string

    return {
        props: {
            url,
        }
    }

}


const NotFound: NextPage = ({ url }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    return (
        <div className=''>

            <h1 className='text-center'> {url}  bir kayit bulunamadi</h1>


        </div>
    )
}

export default NotFound