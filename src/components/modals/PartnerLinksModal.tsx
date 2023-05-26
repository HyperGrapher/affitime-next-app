import { LinkStatus, type Link, type Product } from '@prisma/client'
import Image from "next/image"
import NextLink from 'next/link'
import React from 'react'
import { HiCheckCircle, HiXCircle } from 'react-icons/hi'
import productImg from '../../assets/product.png'
import { AppRoutes } from '../../config/appRoutes'
import classNames from '../../utils/classnames'


type Props = {
    links: (Link & {
        product: Product
    })[],
    closeModal: () => void,
    username: string,
}

const PartnerLinksModal: React.FC<Props> = ({ links, closeModal, username }) => (
    <section
        className={classNames(
            "bg-white shadow-2xl rounded-xl",
            "flex flex-col items-center ",
            "px-12 py-8 w-full sm:w-3/5",
            "min-w-full"
        )}>


        <h4 className="text-xl font-semibold mb-5 text-center ">
            {username} kullanıcısına ait linkler
        </h4>

        <div className="space-y-2 overflow-y-scroll">
            {links.map(link => (
                <main
                    key={link.id}
                    className={classNames(
                        "border hover:border-black/5 w-full",
                        "py-2 px-2 bg-slate-100 hover:bg-slate-50 rounded-md",
                        "shadow hover:shadow-md transition-all shadow-slate-300",
                        "md:min-w-[400px]"
                    )} >

                    <NextLink
                        href={`${AppRoutes.VENDOR_LINK_DETAIL}/${link.id}`}
                        className="flex gap-4 items-center justify-between">

                        <div className="flex items-center space-x-2">
                            <div
                                className="aspect-square  w-8 h-8 "
                            >
                                {link.product.image ?
                                    <img
                                        className="object-cover hover:shadow rounded object-center w-8 h-8 aspect-square"
                                        src={link.product.image ?? ""}
                                        alt={link.id} />
                                    : <Image
                                        className={classNames(
                                            "object-cover rounded hover:shadow object-center",
                                            "w-8 h-8 aspect-square",
                                            "border border-1 border-stone-300"
                                        )}
                                        width={"32"}
                                        height={"32"}
                                        src={productImg}
                                        alt={"Generic Foto"} />
                                }
                            </div>

                            <div

                                className='text-xs md:text-sm font-medium text-left whitespace-nowrap text-blue-700'>
                                {link.product.title && link.product.title.length > 18 ? link.product.title.substring(0, 18) + " ..." : link.product.title}
                            </div>
                        </div>

                        <div
                            title={link.active
                                ? "Onaylandi"
                                : "İptal edildi"
                            }
                            className="text-center gap-1 flex flex-col items-center min-w-[8ch]">

                            <b className={`${link.active ? "text-green-500" : "text-red-400"} text-xs font-bold whitespace-nowrap`}>
                                {link.active
                                    ? <HiCheckCircle size={"1.25rem"} color="text-green-500" />
                                    : <HiXCircle size={"1.25rem"} color="text-red-400" />}
                            </b>

                            <b className="text-xs font-bold whitespace-nowrap">

                                {link.status === LinkStatus.AWAITING && "Onay Bekliyor"}
                                {link.status === LinkStatus.REQUEST_DENIED && "Onaylanmadı"}
                                {link.status === LinkStatus.CANCELED_BY_VENDOR && "İptal Edilidi"}
                                {link.status === LinkStatus.PRODUCT_DELETED && "Ürün Silindi"}
                                {link.status === LinkStatus.CONFIRMED && "Onaylandı"}
                                {link.status === LinkStatus.PAUSED_BY_VENDOR && "Duraklatıldı"}
                            </b>

                        </div>

                    </NextLink>


                </main>
            ))}
        </div>

        <button
            onClick={() => closeModal()}
            className={classNames(
                "bg-violet-600 hover:bg-violet-700 transition",
                "w-full sm:w-36 md:w-40",
                "shadow-sm hover:shadow-lg rounded-md",
                "py-2 px-8 mt-8",
                "text-white font-medium text-sm",
                "disabled:bg-violet-400 disabled:shadow-none",
                "aria-disabled:bg-violet-400 aria-disabled:shadow-none",
            )}>
            Kapat
        </button>

    </section>
)


export default PartnerLinksModal

