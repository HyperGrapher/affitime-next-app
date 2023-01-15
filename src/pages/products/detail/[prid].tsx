import type { Link as LinkEntity } from "@prisma/client";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from 'next/router';
import { useState } from 'react';
import { HiArrowLeft as BackIcon, HiPlus } from 'react-icons/hi';
import Balancer from 'react-wrap-balancer';
import productImg from '../../../assets/product.png';
import IconButton from '../../../components/buttons/IconButton';
import PageCard from "../../../components/card/Card";
import { Lira } from '../../../components/shared/HtmlCodes';
import { AppRoutes } from '../../../config/appRoutes';
import { UserRoles } from '../../../interface/auth.interface';
import classNames from '../../../utils/classnames';
import { notifyError, notifySuccessTC } from '../../../utils/notifications';
import { trpc } from '../../../utils/trpc';
import dynamic from 'next/dynamic'
import Head from "next/head";
import { prisma } from "../../../server/db/client";

const DynamicModalContainer = dynamic(() => import('../../../components/modals/ModalContainer'), {
    ssr: false,
})

const DynamicConfirmDialog = dynamic(() => import('../../../components/modals/ConfirmDialog'), {
    ssr: false,
})


export const getServerSideProps: GetServerSideProps = async (context) => {

    const id = context.params?.prid as string

    context.res.setHeader(
        'Cache-Control',
        'public, s-maxage=10, stale-while-revalidate=59'
    )

    const pd = await prisma.product.findFirst({
        where: { id },
        select: {
            createdAt: false,
            updatedAt: false,
            id: true,
            product_url: true,
            image: true,
            perClick: true,
            perClickType: true,
            perSaleType: true,
            perSale: true,
            title: true,
            desc: true,
            cookieLife: true,
            vendor: {
                select: {
                    brand: true,
                    website: true
                }
            },
        }
    });


    return { props: { pd } }

}

const ProducDetailPublic: NextPage = ({ pd }: InferGetServerSidePropsType<typeof getServerSideProps>) => {

    const { back, push } = useRouter()
    const [busy, setBusy] = useState(false)
    const [modal, setModal] = useState(false)

    const { data: session } = useSession();
    const createLinkMutate = trpc.link.createLink.useMutation()


    function handleLinkCreation(): void {

        setBusy(true)

        if (!session) {
            push(AppRoutes.SIGNIN)
            return
        }

        if (session.role !== UserRoles.PARTNER) {
            notifyError('Vendor hesabı ile link oluşturulamaz.')
            setBusy(false)
            return
        }

        createLinkMutate.mutate({
            productId: pd?.id ?? ""
        },
            {
                onSuccess: async (data) => {
                    const res = data as LinkEntity
                    const lid = res.id

                    if (!lid) {
                        notifyError("Bir hata olustu")
                        return
                    }

                    setTimeout(() => {
                        notifySuccessTC('Link isteği iletildi.', true)
                        push(`${AppRoutes.PARTNER_LINK_DETAIL}/${lid}?created=true`)

                    }, 2050);



                },
                onError(error) {
                    notifyError(error.message)
                },
                onSettled: () => {
                    setTimeout(() => {
                        setModal(false)
                        setBusy(false)
                    }, 2000);
                }
            }

        )

    }

    return (
        <div className={session ? "auth-container" : "px-1 pt-16"}>

            <Head>
                <title>{pd?.title ?? ""}</title>
                <meta name="description" content={pd?.desc ?? ""} />
                <meta name="theme-color" content="#8b71ff" />

                <meta property="og:url" content="https://affitime.com" />
                <meta property="og:site_name" content="affitime" />
                <meta property="og:locale" content="tr_TR" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content={pd?.title ?? ""} />
                <meta property="og:description" content={pd?.desc ?? ""} />
                <meta property="og:image" content={pd?.image ?? ""} />
                <meta property="og:image:type" content="image/png" />


                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:image" content={pd?.image ?? ""} />
                <meta property="twitter:domain" content="affitime.com" />
                <meta property="twitter:url" content="https://affitime.com" />
                <meta name="twitter:title" content={pd?.title ?? ""} />
                <meta name="twitter:description" content={pd?.desc ?? ""} />

            </Head>

            <PageCard>
                <div className="flex items-center">

                    <h2 className="font-bold text-xl text-slate-700 ml-2">
                        Ürün Detayları
                    </h2>

                    <IconButton
                        title={"Geri Git"}
                        disabled={busy}
                        icon={<BackIcon color="white" size="16px" />}
                        twClasses="ml-auto w-38"
                        fn={back} />

                </div>

                <div className='mb-6 ml-2 w-1/2 sm:w-80'>


                    <p className="text-slate-400 text-sm leading-tight">
                        <Balancer>
                            Aşağıda detayları verilen ürün için web üzerinde paylaşabileceğiniz
                            bir affiliate linki oluşturun.
                        </Balancer>
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
                        <Balancer>
                            {pd?.desc}
                        </Balancer>

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
                    disabled={busy}
                    onClick={() => setModal(true)}
                    type='submit'
                    className={classNames(
                        "bg-violet-600 hover:bg-violet-700 transition-colors",
                        "flex items-center justify-center flex-nowrap space-x-2",
                        "shadow-sm hover:shadow-lg rounded-md ",
                        "py-4 px-8 mt-6",
                        "disabled:bg-violet-400 disabled:shadow-none"
                    )} >

                    <HiPlus color="white" size="18px" />

                    <span className="text-slate-50 text-sm font-medium tracking-wide text-center">
                        Affiliate Linki Oluştur
                    </span>
                </button>

                <DynamicModalContainer state={modal} key={"adda"}>
                    <DynamicConfirmDialog
                        title="Affiliate linki oluşturmak istiyor musunuz?"
                        confirmBtnText='Oluştur'
                        busy={busy}
                        desc="
                            Ürün için web üzerinde paylaşabileceğiniz 
                            bir link oluşturulacaktır. 
                            Vendor onayindan sonra kullanılabilir hale gelecektir."
                        dismissFn={() => setModal(false)}
                        confirmFn={handleLinkCreation}
                    />
                </DynamicModalContainer>




            </PageCard>
        </div>
    )
}

export default ProducDetailPublic