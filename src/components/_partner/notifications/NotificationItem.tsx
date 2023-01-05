/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { type Link as LinkEntity, type Vendor, type Product } from "@prisma/client";
import React from "react";
import Image from "next/image";
import productImg from '../../../assets/product.png';
import { formatDateTR, numberWithCommas } from "../../../utils/helpers";
import { Lira } from "../../shared/HtmlCodes";
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/DeleteOutlineTwoTone';
import EditIcon from '@mui/icons-material/EditOutlined';
import LinkIcon2 from '@mui/icons-material/Link';
import LinkIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import CheckIcon from '@mui/icons-material/CheckCircleOutline';
import Chip from '@mui/material/Chip';
import classNames from "../../../utils/classnames";
import { useRouter } from "next/router";
import { AppRoutes } from "../../../config/appRoutes";
import LinkButton from "../../buttons/LinkButton";
import Link from "next/link";
import Divider from "../../shared/Divider";
import { HiCheckCircle, HiXCircle, HiCheck } from 'react-icons/hi'
import TimeAgo from "timeago-react";
import { trpc } from "../../../utils/trpc";


type ItemProps = {
    p: (LinkEntity & { vendor: Vendor; product: Product; });
    refetch: () => void

}

const NotificationItem: React.FC<ItemProps> = ({ p, refetch }) => {

    const update = trpc.notifications.updateNotificationReadByPartner.useMutation()

    const handleUpdate = async () => {
        update.mutate({
            id: p.id,
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
                    href={`${AppRoutes.PUBLIC_PRODUCT_DETAIL}/${p.product.id}`}>
                    {p.product.image ?
                        <img
                            className="object-cover hover:shadow rounded object-center w-12 h-12 aspect-square"
                            src={p.product.image ?? ""}
                            alt={p.id!} />
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
                    <Link href={`${AppRoutes.PUBLIC_PRODUCT_DETAIL}/${p.product.id}`}>
                        <h4 className="text-xs whitespace-nowrap
                        font-bold hover:text-sky-500 transition-colors">
                            {p.product.title!.length > 25 ? p.product.title!.substring(0, 25) + " ..." : p.product.title}
                        </h4>
                    </Link>

                    <p className="text-stone-400 text-xs whitespace-nowrap">
                        <b className="text-stone-500">Fiyat: </b>
                        {numberWithCommas(p.product.price)}
                        <Lira />
                    </p>
                    <p className="text-stone-400 text-xs whitespace-nowrap">
                        <b className="text-stone-500">Mağaza: </b>
                        {p.vendor.brand!}
                    </p>

                </div>



                <Divider />


                {/* STATUS */}
                <div
                    title={p.confirmed
                        ? "Link talebiniz vendor tarafindan onaylandi"
                        : "Link talebiniz vendor tarafindan iptal edildi"
                    }
                    className="text-center gap-1 flex flex-col items-center">

                    <b className={`${p.active ? "text-green-500" : "text-red-400"} text-xs font-bold whitespace-nowrap`}>
                        {p.active
                            ? <HiCheckCircle size={"1.25rem"} color="text-green-500" />
                            : <HiXCircle size={"1.25rem"} color="text-red-400" />}
                    </b>

                    <b className="text-xs font-bold whitespace-nowrap">

                        {p.active
                            ? "Onaylandı"
                            : 'İptal Edilidi'}
                    </b>

                </div>


                <Divider />


                <div className="flex flex-col items-center gap-1 min-w-[15ch] h-full">
                    <b className="text-xs whitespace-nowrap text-slate-500  text-center
                        font-bold transition-colors">
                        Affiliate Linki:
                    </b>

                    <b className="text-violet-600 text-sm font-medium whitespace-nowrap text-center">
                        {p.confirmed ? `affi/${p.url}` : "--"}
                    </b>

                </div>


                <Divider />

                <div className="min-w-[12ch] text-center">

                    <small className="text-slate-500 text-xs font-medium whitespace-nowrap">
                        <TimeAgo
                            className="whitespace-nowrap"
                            title={formatDateTR(p.updatedAt)}
                            datetime={p.updatedAt as Date}
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