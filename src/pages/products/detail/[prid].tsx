/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { useRouter } from 'next/router'
import type { GetServerSideProps } from "next";
import { type NextPage, /*  NextApiRequest, InferGetServerSidePropsType  */ } from "next";
import { getSession, useSession } from "next-auth/react";
import PageCard from "../../../components/card/Card";
import { UserRoles } from '../../../interface/auth.interface';
import { trpc } from '../../../utils/trpc';
import { HiPlus } from 'react-icons/hi'
import LinkButton from "../../../components/buttons/LinkButton";
import Head from "next/head";
import Link from "next/link";
import { decrypt, encrypt } from '../../../utils/cryptography';
import { InferGetServerSidePropsType } from 'next'

// https://nextjs.org/docs/api-reference/data-fetching/get-server-side-props
export const getServerSideProps: GetServerSideProps = async (context) => {

    return { props: { hello: 223 } }

}



const ProducDetailPublic: NextPage = ({ hello }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const router = useRouter()
    const id = router.query.prid as string
    const { data: session, status: sessionStatus } = useSession();



    return (
        <div className={session ? "auth-container" : "px-1 pt-16"}>
            <PageCard>
                Detail: {id}
                <br /> helloId: {hello}
            </PageCard>
        </div>
    )
}

export default ProducDetailPublic