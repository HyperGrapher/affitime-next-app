import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { type NextPage } from "next";
import { getSession } from "next-auth/react";
import dynamic from 'next/dynamic';
import Image from "next/image";
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { HiArrowLeft as BackIcon, HiBell } from 'react-icons/hi';
import TopBarProgress from "react-topbar-progress-indicator";
import Balancer from 'react-wrap-balancer';
import productImg from '../../../../assets/product.png';
import IconButton from '../../../../components/buttons/IconButton';
import PageCard from "../../../../components/card/Card";
import { Lira, Space } from '../../../../components/shared/HtmlCodes';
import { AppRoutes } from '../../../../config/appRoutes';
import { UserRoles } from '../../../../interface/auth.interface';
import classNames from '../../../../utils/classnames';
import { trpc } from '../../../../utils/trpc';

const DynamicModalContainer = dynamic(() => import('../../../../components/modals/ModalContainer'), {
    ssr: false,
})

const DynamicConfirmDialog = dynamic(() => import('../../../../components/modals/ConfirmDialog'), {
    ssr: false,
})

const LinkDetail: NextPage = ({ id }: InferGetServerSidePropsType<typeof getServerSideProps>) => {


    const [busy] = useState(false)
    const [modal, setModal] = useState(false)

    const { back, query } = useRouter()
    const created = query.created === "true"

    const { data: link, status: sts } = trpc.link.getLinkDetails.useQuery({ id })



    return (
        <div className={"auth-container"}>
            {sts === 'loading' && <TopBarProgress />}
            <PageCard>
                <div className="flex items-center">

                    <h2 className="font-bold text-xl text-slate-700 ml-2">
                        Link Detayları
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
                            Affiliate linki detay sayfasi
                        </Balancer>
                    </p>

                </div>

                {created && !link?.link.vendor_notified && (
                    <div className="bg-yellow-50 px-2 py-2 rounded mb-2 flex items-center space-x-3">
                        <span className="bg-yellow-100 border border-yellow-200 rounded-full p-2"><HiBell className="text-yellow-500 w-5 h-5" /></span>
                        <b className="text-neutral-500 text-sm">
                            Affiliate link isteğiniz mağazaya iletildi. Mağaza onayından sonra <Space />
                            <Link className="text-blue-500 underline" href={"/"}>Affiliate Linklerim</Link> sayfasında listelenecektir.
                        </b>
                    </div>
                )

                }

                <hr className='' />
                {/*Meta Data with Image */}
                <section className="mb-4 mt-4">
                    <Link className='' href={`${AppRoutes.PUBLIC_PRODUCT_DETAIL}/${link?.link.product_id}`}>
                        <h1 className='text-slate-600 text-2xl  mb-2 font-medium leading-tight'>
                            {link?.link.product.title}
                        </h1>

                    </Link>

                    <div className="flex space-x-4 mt-4 items-center">
                        {link?.link.product.image ?
                            <img
                                className="object-cover hover:shadow rounded object-center w-32 h-32 aspect-square"
                                src={link?.link.product.image}
                                alt={link?.link.product.title ?? ""} />
                            : <Image
                                className={classNames(
                                    "object-cover rounded hover:shadow object-center",
                                    "w-32 h-32 aspect-square",
                                    "border border-1 border-stone-300"
                                )}
                                width={"85"}
                                height={"85"}
                                src={productImg}
                                alt={"Generic Foto"} />
                        }

                        <div className='space-y-[0.18rem]'>
                            <p className="text-sm">
                                <b className='text-neutral-500'> Durum: </b>
                                <b className={`${link?.link.active ? "text-green-500" : "text-red-500"}`}>
                                    {link?.link.active
                                        ? "Aktif"
                                        : (created && !link?.link.vendor_notified)
                                            ? "Mağaza Onayı Bekleniyor"
                                            : "Pasif"
                                    }
                                </b>
                            </p>
                            <p className="text-sm">
                                <b className='text-neutral-500'> Urun Fiyati: </b>
                                <span className=''>{link?.link.product.price} <Lira /> </span>
                            </p>
                            <p className="text-sm">
                                <b className='text-neutral-500'> Affiliate Linki:</b>

                                {link?.link.active
                                    ? <a title={`http://affiti.me/r/${link?.link.url ?? ""}`} className='text-blue-500' href={`http://affiti.me/r/${link?.link.url ?? ""}`}> {`affiti.me/r/${link?.link.url ?? ""}`}</a>
                                    : <span> Sadece aktif linkler görülebilir </span>
                                }

                            </p>
                            <p className="text-sm">
                                <b className='text-neutral-500'> Hedef Link: </b>
                                <a title={link?.link.product.product_url ?? ""} className='text-blue-500' href={link?.link.product.product_url ?? "#"}>{link?.link.product.product_url?.slice(0, 44)} ...</a>
                            </p>
                            <p className="text-sm">
                                <b className='text-neutral-500'>Ürün Sahibi:</b> {link?.link.vendor.brand}
                            </p>
                            <p className="text-sm">
                                <b className='text-neutral-500'>Website:</b>
                                <a title={link?.link.vendor.website ?? ""} className='text-blue-500' href={link?.link.vendor.website ?? "#"}> {link?.link.vendor.website?.slice(0, 48)}</a>

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
                            <p className='text-base'><b className='text-neutral-500'>Tiklama Odeme Sekli: </b> {link?.link.perClickType === 'CASH' ? 'Nakit' : 'Yüzde'}</p>
                            <hr />
                            <p className='text-base'><b className='text-neutral-500'>Tiklama Basi Bedeli: </b> {link?.link.perClick} {link?.link.perClickType === 'CASH' ? <Lira /> : '%'} </p>
                        </div>
                        <div className="flex-1">
                            <p className='text-base'><b className='text-neutral-500'>Satis Odeme Sekli: </b> {link?.link.perSaleType === 'CASH' ? 'Nakit' : 'Yüzde'}</p>
                            <hr />
                            <p className='text-base'><b className='text-neutral-500'>Satis Basi Bedeli: </b>{link?.link.perSale} {link?.link.perSaleType === 'CASH' ? <Lira /> : '%'} </p>
                        </div>
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
                        Cookie Süresi:  <span> {link?.link.product.cookieLife} Gün</span>


                    </h3>

                </section>

                {/* Affiliate Details */}
                <section className={classNames(
                    "bg-slate-100 hover:bg-slate-50",
                    "w-full rounded-md  py-4 px-2   ",
                    "shadow hover:shadow-md shadow-slate-300 transition-all",
                    "border hover:border-black/5 ",
                    'mt-2'

                )}>

                    <h3
                        className={classNames(
                            "font-medium text-base  pl-2 mb-4"
                        )}
                    >
                        Tiklama Odemeleri
                    </h3>

                    <section className='flex items-center justify-between px-2'>
                        <div className=" flex-1">
                            <p className='text-base'><b className='text-neutral-500'>Toplam Tiklama : </b> {(link?.validClicks ?? 0) + (link?.dubiousClicks ?? 0)} </p>
                            <hr />
                            <p className='text-base'><b className='text-neutral-500'>Geçersiz Tiklama: </b> {link?.dubiousClicks} </p>
                        </div>
                        <div className="flex-1">
                            <p className='text-base'><b className='text-neutral-500'>Gecerli Tiklama: </b> {link?.validClicks} </p>
                            <hr />
                            <p className='text-base'><b className='text-neutral-500'>Odeme Bedeli: </b> {link?.totalDuePayment}  <Lira />  </p>
                        </div>
                    </section>

                </section>
                {/* Submit */}
                {/* <button
                    disabled={busy}
                    onClick={() => setModal(true)}
                    type='submit'
                    className={classNames(
                        "bg-red-600 hover:bg-red-700 transition-colors",
                        "flex items-center justify-center flex-nowrap space-x-2",
                        "shadow-sm hover:shadow-lg rounded-md ",
                        "py-4 px-8 mt-6",
                        "disabled:bg-red-400 disabled:shadow-none"
                    )} >

                    <HiPlus color="white" size="18px" />

                    <span className="text-slate-50 text-sm font-medium tracking-wide text-center">
                        Affiliate Linkini Askiya Al
                    </span>
                </button> */}



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
                        confirmFn={() => null}
                    />
                </DynamicModalContainer>




            </PageCard>
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