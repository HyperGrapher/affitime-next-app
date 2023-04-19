import DeleteIcon from '@mui/icons-material/DeleteOutlineTwoTone';
import PlayIcon from '@mui/icons-material/PlayCircle';
import LinkIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import type { Visit } from "@prisma/client";
import { LinkStatus, type Link as LinkEntity, type Partner, type Product } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { HiCheckCircle, HiXCircle } from 'react-icons/hi';
import productImg from '../../../assets/product.png';
import { AppRoutes } from "../../../config/appRoutes";
import classNames from "../../../utils/classnames";
import { numberWithCommas } from "../../../utils/helpers";
import { Lira } from "../../shared/HtmlCodes";



type ItemProps = {
    link: (LinkEntity & { partner: Partner; product: Product; visits: Visit[] });
    confirmModal: () => void;
    setDeleteId: (id: string) => void;
}


const LinkItemMobile: React.FC<ItemProps> = ({ link, confirmModal, setDeleteId }) => {

    const { push } = useRouter()

    function del(id: string) {
        setDeleteId(id);
        confirmModal()
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
            <div className="flex gap-4 items-center">
                <Link
                    className="aspect-square w-12 h-12"
                    href={`${AppRoutes.VENDOR_LINK_DETAIL}/${link.id}`}>
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

                <div className="flex flex-col items-start min-w-[20ch] h-full">
                    <Link href={`${AppRoutes.VENDOR_LINK_DETAIL}/${link.id}`}>
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
                        <b className="text-stone-500">Kullanici: </b>
                        {link.partner.username}
                    </p>

                    {/* STATUS */}
                    <div
                        title={link.active
                            ? "Onaylandi"
                            : "İptal edildi"
                        }
                        className="text-center space-x-1 flex items-center ">


                        <b className="text-xs font-bold whitespace-nowrap">

                            {link.status === LinkStatus.AWAITING && "Onay Bekliyor"}
                            {link.status === LinkStatus.REQUEST_DENIED && "Onaylanmadı"}
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

                </div>

                <div className="ml-auto">


                        <div className="flex flex-nowrap space-x-1 h-full -translate-x-3">
                            {link.active ? <IconButton
                                size="small"
                                title="Durdur"
                                aria-label="Detay"
                                onClick={() => del(link.id)}>
                                <DeleteIcon className="text-red-400 w-4 h-4" />
                            </IconButton>
                                :

                                <IconButton
                                    size="small"
                                    title="Durdur"
                                    aria-label="Detay"
                                    onClick={() => del(link.id)}>
                                    <PlayIcon className="text-green-400 w-4 h-4" />
                                </IconButton>


                            }

                            <IconButton
                                size="small"
                                onClick={() => push(`${AppRoutes.VENDOR_LINK_DETAIL}/${link.id}`)}
                                title="Detay"
                                aria-label="Detay">
                                <LinkIcon className="text-indigo-600 w-4 h-4" />
                            </IconButton>
                        </div>

                    </div>

            </div>
        </li>
    )
}

export default LinkItemMobile