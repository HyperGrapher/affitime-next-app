import LinkIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import type { Visit } from "@prisma/client";
import { LinkStatus, type Link as LinkEntity, type Product, type Vendor } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useMemo } from "react";
import { HiCheckCircle, HiXCircle } from 'react-icons/hi';
import productImg from '../../../assets/product.png';
import { AppRoutes } from "../../../config/appRoutes";
import classNames from "../../../utils/classnames";
import { numberWithCommas } from "../../../utils/helpers";
import Divider from "../../shared/Divider";
import { Lira } from "../../shared/HtmlCodes";


type ItemProps = {
    link: (LinkEntity & { vendor: Vendor; product: Product; visits: Visit[] });

}


const LinkItemMobile: React.FC<ItemProps> = ({ link }) => {


    const { push } = useRouter()

    return (
        <li className={
            classNames(
                "border hover:border-black/5 w-full",
                "py-2 px-2 bg-slate-100 hover:bg-slate-50 rounded-md",
                "shadow hover:shadow-md transition-all shadow-slate-300",
                ""
            )}>

            <div className="flex gap-4 items-center">
                {/* IMAGE */}
                <Link
                    className="aspect-square  w-12 h-12 "
                    href={`${AppRoutes.PARTNER_LINK_DETAIL}/${link.id}`}>
                    {link.product.image ?
                        <img
                            className="object-cover hover:shadow rounded object-center w-12 h-12 aspect-square"
                            src={link.product.image ?? ""}
                            alt={link.id} />
                        : <Image
                            className={classNames(
                                "object-cover rounded hover:shadow object-center",
                                "w-12 h-12 aspect-square",
                                "border border-1 border-stone-300"
                            )}
                            width={"85"}
                            height={"85"}
                            src={productImg}
                            alt={"Generic Foto"} />
                    }
                </Link>

                <section className="flex flex-col items-start min-w-[20ch] h-full">
                    <Link href={`${AppRoutes.PARTNER_LINK_DETAIL}/${link.id}`}>
                        <h4 className="text-xs whitespace-nowrap text-stone-5000 
                        font-bold hover:text-sky-500 transition-colors">
                            {link.product.title && link.product.title.length > 25 ? link.product.title.substring(0, 25) + " ..." : link.product.title}
                        </h4>
                    </Link>

                    <p className="text-stone-400 text-xs whitespace-nowrap">
                        <b className="text-stone-500">Fiyat: </b>
                        {numberWithCommas(link.product.price)}
                        <Lira />
                    </p>
                    <p className="text-stone-400 text-xs whitespace-nowrap">
                        <b className="text-stone-500">Mağaza: </b>
                        {link.vendor.brand}
                    </p>

                    {/* STATUS */}

                    <div
                        title={link.active
                            ? "Link talebiniz vendor tarafindan onaylandi"
                            : "Vendor tarafindan iptal edildi"
                        }
                        className="text-center space-x-1 flex items-center">


                        <b className="text-xs font-bold whitespace-nowrap">

                            {link.status === LinkStatus.REQUEST_DENIED && "İptal Edilidi"}
                            {link.status === LinkStatus.CANCELED_BY_VENDOR && "İptal Edilidi"}
                            {link.status === LinkStatus.PRODUCT_DELETED && "Ürün Silindi"}
                            {link.status === LinkStatus.CONFIRMED && "Onaylandı"}
                            {link.status === LinkStatus.PAUSED_BY_VENDOR && "Duraklatıldı"}
                        </b>
                        <b className={`${link.active ? "text-green-500" : "text-red-400"} text-xs font-bold whitespace-nowrap`}>
                            {link.active
                                ? <HiCheckCircle size={"1.25rem"} color="text-green-500" />
                                : <HiXCircle size={"1.25rem"} color="text-red-400" />}
                        </b>

                    </div>

                </section>

                <div className="ml-auto">

                    <IconButton
                        size="small"
                        onClick={() => push(`${AppRoutes.PARTNER_LINK_DETAIL}/${link.id}`)}
                        title="Detay"
                        aria-label="Detay">
                        <LinkIcon className="text-indigo-600 w-4 h-4" />
                    </IconButton>


                </div>




            </div>
        </li>
    )
}

export default LinkItemMobile