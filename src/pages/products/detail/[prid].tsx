/* eslint-disable @next/next/no-img-element */
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
import { InferGetServerSidePropsType } from 'next'
import Container from "@mui/material/Container";
import { prisma } from "../../../server/db/client";
import IconButton from '../../../components/buttons/IconButton';
import TopBarProgress from 'react-topbar-progress-indicator';
import classNames from '../../../utils/classnames';
import { notifyError, notifySuccessTC, notifySuccessBR } from '../../../utils/notifications';
import Image from "next/image";
import productImg from '../../../assets/product.png';
import { HiArrowLeft as BackIcon } from 'react-icons/hi'
import { Lira } from '../../../components/shared/HtmlCodes';
import { MouseEvent, useState } from 'react';
// import { Lira } from "../../shared/HtmlCodes";

// https://nextjs.org/docs/api-reference/data-fetching/get-server-side-props
export const getServerSideProps: GetServerSideProps = async (context) => {

    const id = context.params?.prid


    const session = await getSession(context)

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

    // const data = await prisma.user.findMany({
    //     select: {
    //         id: true,
    //     }
    // });

    // prisma.$disconnect()


    // if (!data) return {
    //     redirect: {
    //         destination: `/${session.role.toLowerCase()}/dashboard`,
    //         permanent: false
    //     }
    // }


    return { props: { id } }

}

const ProducDetailPublic: NextPage = ({ id }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const { back } = useRouter()
    const [busy, setBusy] = useState(false)

    const { data: session, status: sessionStatus } = useSession();
    const { data: pd, status: prodStatus, refetch: refetchProducts } = trpc.product.getProductById.useQuery({ id })

    // console.log(pd);


    function handleLinkCreation(): void {
        console.log(pd?.id);

        const vendorId = pd?.vendor_profile_id

    }

    return (
        <div className={session ? "auth-container" : "px-1 pt-16"}>
            <PageCard>
                <div className="flex items-center">

                    <h2 className="font-bold text-xl text-slate-700 ml-2">
                        Ürün Detayları
                    </h2>

                    <IconButton
                        title={"Geri Git"}
                        // disabled={busy}
                        icon={<BackIcon color="white" size="16px" />}
                        twClasses="ml-auto w-38"
                        fn={back} />

                </div>

                <div className='mb-6 ml-2 w-1/2 sm:w-80'>
                    <p className="text-slate-400 text-sm font- leading-tight">
                        Aşağıda detayları verilen ürün için web üzerinde paylaşabileceğiniz bir link oluşturun.
                    </p>
                </div>

                <hr className='' />
                {/*Meta Data with Image */}
                <section className="mb-4 mt-4">
                    <h1 className='text-slate-600 text-2xl  mb-2 font-medium leading-tight'>
                        {pd?.title}
                    </h1>
                    <div className="flex space-x-4 mt-4 items-center">
                        {pd?.image ?
                            <img
                                className="object-cover hover:shadow rounded object-center w-24 h-24 aspect-square"
                                src={pd?.image}
                                alt={pd?.title ?? ""} />
                            : <Image
                                className={classNames(
                                    "object-cover rounded hover:shadow object-center",
                                    "w-24 h-24 aspect-square",
                                    "border border-1 border-stone-300"
                                )}
                                width={"85"}
                                height={"85"}
                                src={productImg}
                                alt={"Generic Foto"} />
                        }

                        <div className='space-y-2'>
                            <p className="text-sm">
                                <b className='text-neutral-500'> Hedef Link: </b>
                                <a title={pd?.product_url ?? ""} className='text-blue-500' href={pd?.product_url ?? "#"}>{pd?.product_url?.slice(0, 44)} ...</a>
                            </p>
                            <p className="text-sm">
                                <b className='text-neutral-500'> ID:</b> {pd?.id}
                            </p>
                            <p className="text-sm">
                                <b className='text-neutral-500'>Ürün Sahibi:</b> {pd?.vendor.brand}
                            </p>
                            <p className="text-sm">
                                <b className='text-neutral-500'>Website:</b>
                                <a title={pd?.vendor.website ?? ""} className='text-blue-500' href={pd?.vendor.website ?? "#"}> {pd?.vendor.website?.slice(0, 48)}</a>

                            </p>
                        </div>
                    </div>
                </section>
                <hr className='py-2' />

                {/* Commissions */}
                <section className={classNames(
                    "bg-slate-100 hover:bg-slate-50",
                    "w-full rounded-md  py-2 px-2   ",
                    "shadow hover:shadow-md shadow-slate-300 transition-all",
                    "border hover:border-black/5 space-y-2 pb-8 "

                )}>

                    <h3
                        className={classNames(
                            "font-medium text-base  pl-2 mb-4"
                        )}
                    >
                        Komisyon Oranları
                    </h3>

                    <section className='flex items-center justify-between px-2'>
                        <div className=" flex-1">
                            <p className='text-base'><b className='text-slate-500'>Tiklama Odeme Sekli: </b> {pd?.perClickType === 'CASH' ? 'Nakit' : 'Yüzde'}</p>
                            <hr />
                            <p className='text-base'><b className='text-slate-500'>Tiklama Basi Bedeli: </b> {pd?.perClick} {pd?.perClickType === 'CASH' ? <Lira /> : '%'} </p>
                        </div>
                        <div className="flex-1">
                            <p className='text-base'><b className='text-slate-500'>Satis Odeme Sekli: </b> {pd?.perSaleType === 'CASH' ? 'Nakit' : 'Yüzde'}</p>
                            <hr />
                            <p className='text-base'><b className='text-slate-500'>Satis Basi Bedeli: </b>{pd?.perSale} {pd?.perSaleType === 'CASH' ? <Lira /> : '%'} </p>
                        </div>
                    </section>

                </section>


                {/* Desc */}
                <section className={classNames(
                    "bg-slate-100 hover:bg-slate-50",
                    "w-full rounded-md  py-2 px-2   ",
                    "shadow hover:shadow-md shadow-slate-300 transition-all",
                    "border hover:border-black/5 space-y-2 pb-8 ",
                    'mt-2'

                )}>

                    <h3
                        className={classNames(
                            "font-medium text-base  pl-2 mb-4"
                        )}
                    >
                        Ürün Açıklaması
                    </h3>

                    <section className='flex items-center justify-between px-2'>
                        <p>
                            {pd?.desc}
                        </p>
                    </section>

                </section>



                {/* Cookiee Life */}
                <section className={classNames(
                    "bg-slate-100 hover:bg-slate-50",
                    "w-full rounded-md  py-0 px-2   ",
                    "shadow hover:shadow-md shadow-slate-300 transition-all",
                    "border hover:border-black/5 ",
                    'mt-2'

                )}>

                    <h3
                        className={classNames(
                            "font-medium text-base px-2 py-4"
                        )}
                    >
                        Cookie Süresi:  <span> {pd?.cookieLife} Gün</span>


                    </h3>

                </section>

                {/* Submit */}
                <button
                    // disabled={busy}
                    onClick={handleLinkCreation}
                    type='submit'
                    className={classNames(
                        "bg-violet-600 hover:bg-violet-700 transition-colors",
                        "flex items-center justify-center flex-nowrap space-x-2",
                        "shadow-sm hover:shadow-lg rounded-md ",
                        "py-4 px-8 mt-6",
                        "disabled:bg-violet-400 disabled:shadow-none"
                    )}

                >

                    <HiPlus color="white" size="18px" />

                    <span className="text-slate-50 text-sm font-medium tracking-wide text-center">
                        Affiliate Linki Oluştur
                    </span>
                </button>




            </PageCard>
        </div>
    )
}

export default ProducDetailPublic