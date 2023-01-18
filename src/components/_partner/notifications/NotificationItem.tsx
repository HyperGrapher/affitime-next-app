import CheckIcon from '@mui/icons-material/CheckCircleOutline';
import IconButton from '@mui/material/IconButton';
import { LinkStatus, type Link as LinkEntity, type Product, type Vendor } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { HiCheckCircle, HiXCircle } from 'react-icons/hi';
import TimeAgo from "timeago-react";
import productImg from '../../../assets/product.png';
import { AppRoutes } from "../../../config/appRoutes";
import classNames from "../../../utils/classnames";
import { formatDateTR, numberWithCommas } from "../../../utils/helpers";
import { trpc } from "../../../utils/trpc";
import Divider from "../../shared/Divider";
import { Lira } from "../../shared/HtmlCodes";


type ItemProps = {
    link: (LinkEntity & { vendor: Vendor; product: Product; });
    refetch: () => void

}

const NotificationItem: React.FC<ItemProps> = ({ link, refetch }) => {

    const update = trpc.notifications.updateNotificationReadByPartner.useMutation()

    const handleUpdate = async () => {
        update.mutate({
            id: link.id,
        }, {
            onError(error) {
                console.log(error);

            },
            onSettled: () => {
                refetch()
            }
        })

    }


    return (
        <li className={
            classNames(
                "border hover:border-black/5 w-full",
                "py-2 px-2 bg-slate-100 hover:bg-slate-50 rounded-md",
                "shadow hover:shadow-md transition-all shadow-slate-300",
                ""
            )}>

            {/* IMAGE */}
            <div className="flex gap-4 items-center justify-between">
                <Link
                    className="aspect-square  w-12 h-12 "
                    href={`${AppRoutes.PUBLIC_PRODUCT_DETAIL}/${link.product.id}`}>
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


                <div className="flex flex-col gap-1 items-start min-w-[20ch] h-full">
                    <Link href={`${AppRoutes.PUBLIC_PRODUCT_DETAIL}/${link.product.id}`}>
                        <h4 className="text-xs whitespace-nowrap
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

                </div>



                <Divider />


                {/* STATUS */}
                <div
                    title={link.active
                        ? "Link talebiniz vendor tarafindan onaylandi"
                        : "Vendor tarafindan iptal edildi"
                    }
                    className="text-center gap-1 flex flex-col items-center">

                    <b className={`${link.active ? "text-green-500" : "text-red-400"} text-xs font-bold whitespace-nowrap`}>
                        {link.active
                            ? <HiCheckCircle size={"1.25rem"} color="text-green-500" />
                            : <HiXCircle size={"1.25rem"} color="text-red-400" />}
                    </b>

                    <b className="text-xs font-bold whitespace-nowrap">

                        {link.status === LinkStatus.REQUEST_DENIED && "İptal Edilidi"}
                        {link.status === LinkStatus.CANCELED_BY_VENDOR && "İptal Edilidi"}
                        {link.status === LinkStatus.PRODUCT_DELETED && "Ürün Silindi"}
                        {link.status === LinkStatus.CONFIRMED && "Onaylandı"}
                        {link.status === LinkStatus.PAUSED_BY_VENDOR && "Duraklatıldı"}
                    </b>

                </div>


                <Divider />


                <div className="flex flex-col items-center gap-1 min-w-[15ch] h-full">
                    <b className="text-xs whitespace-nowrap text-slate-500  text-center
                        font-bold transition-colors">
                        Affiliate Linki:
                    </b>

                    <b className="text-violet-600 text-sm font-medium whitespace-nowrap text-center">
                        {link.active ? `affiti.me/r/${link.url}` : "--"}
                    </b>

                </div>


                <Divider />

                <div className="min-w-[12ch] text-center">

                    <small className="text-slate-500 text-xs font-medium whitespace-nowrap">
                        <TimeAgo
                            className="whitespace-nowrap"
                            title={formatDateTR(link.updatedAt)}
                            datetime={link.updatedAt as Date}
                            locale={'tr'}
                        />
                    </small>
                </div>

                <Divider />

                <div className="flex flex-row">


                    <div className="mr-4 flex flex-nowrap gap-2 ml-auto h-full place-self-center">
                        <IconButton
                            size="medium"
                            onClick={() => handleUpdate()}
                            title="Okundu"
                            aria-label="Okundu">
                            <CheckIcon className="text-green-500 w-6 h-6" />
                        </IconButton>
                    </div>

                </div>



            </div>



        </li>)
}

export default NotificationItem