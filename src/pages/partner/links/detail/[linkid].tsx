/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { useRouter } from 'next/router'
import type { GetServerSideProps } from "next";
import { type NextPage, /*  NextApiRequest, InferGetServerSidePropsType  */ } from "next";
import { getSession } from "next-auth/react";
import PageCard from "../../../../components/card/Card";
import { UserRoles } from '../../../../interface/auth.interface';
import { trpc } from '../../../../utils/trpc';
import { HiPlus } from 'react-icons/hi'
import LinkButton from "../../../../components/buttons/LinkButton";
import { useSession } from "next-auth/react";
import IconButton from '../../../../components/buttons/IconButton';
import TopBarProgress from 'react-topbar-progress-indicator';
import classNames from '../../../../utils/classnames';
import { notifyError, notifySuccessTC, notifySuccessBR } from '../../../../utils/notifications';
import Image from "next/image";
import productImg from '../../../assets/product.png';
import { HiArrowLeft as BackIcon } from 'react-icons/hi'
import { Lira } from '../../../../components/shared/HtmlCodes';
import { AppRoutes } from '../../../../config/appRoutes';
import ModalContainer from "../../../../components/modals/ModalContainer";
import { useEffect, useState } from 'react';
import { InferGetServerSidePropsType } from 'next'


const LinkDetail: NextPage = ({ id }: InferGetServerSidePropsType<typeof getServerSideProps>) => {


    const { back, push, query } = useRouter()
    // const id = query.linkid as string

    const [busy, setBusy] = useState(false)
    const [modal, setModal] = useState(false)


    const { data: session, status: sessionStatus } = useSession();
    const { data: ln, status: lnStatus, refetch: refetchLink } = trpc.link.getLinkById.useQuery({ id })

    console.log({ lnStatus });
    console.log({ ln });

    useEffect(() => {
        refetchLink()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])


    return (
        <div className='auth-container'>

            <div className="">
                Link ID: {id}

            </div>


            <p className='my-2'>
                created:    {String(ln?.createdAt)}
            </p>


            <p className='my-2'>
                pid:   {ln?.product_id}
            </p>


            <p className='my-2'>
                P Title  {ln?.product.title}
            </p>


            <p className='my-2'>
                Brand:  {ln?.vendor.brand}
            </p>

        </div>
    )
}

export default LinkDetail


export const getServerSideProps: GetServerSideProps = async (context) => {

    const session = await getSession(context)

    const id = context.params?.linkid


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
            destination: AppRoutes.SIGNIN,
            permanent: false
        }
    }

    if (session.role !== UserRoles.PARTNER) return {
        redirect: {
            destination: `/${session.role.toLowerCase()}/dashboard`,
            permanent: false
        }
    }
    return { props: { id } }

}