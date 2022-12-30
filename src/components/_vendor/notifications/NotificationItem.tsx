/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { type Link as LinkEntity, type Partner, type Product } from "@prisma/client";
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
import CheckIcon from '@mui/icons-material/CheckCircle';
import Chip from '@mui/material/Chip';
import classNames from "../../../utils/classnames";
import { useRouter } from "next/router";
import { AppRoutes } from "../../../config/appRoutes";
import LinkButton from "../../buttons/LinkButton";
import Link from "next/link";
import Divider from "../../shared/Divider";
import { HiCheckCircle, HiXCircle, HiCheck } from 'react-icons/hi'
import TimeAgo from "timeago-react";


// import { useState, useEffect } from 'react';
// import { HiChevronRight, HiHome, HiCollection, HiOutlineArrowSmRight, HiArrowCircleRight } from 'react-icons/hi'
// import { getSession, signIn, signOut, useSession } from "next-auth/react";
// import { RefetchOptions, RefetchQueryFilters } from "@tanstack/react-query";

// interface LinkItemEntity { p: LinkEntity, {a: string}}

// (Link & {
//     vendor: Vendor;
//     product: Product;
// })

type ItemProps = {
    p: (LinkEntity & { partner: Partner; product: Product; });
    confirmModal: () => void;
    setDeleteId: (id: string) => void;
}
// 812px ve asgisi icin layout degis
const NotificationItem: React.FC<ItemProps> = ({ p, confirmModal, setDeleteId }) => {
    const { push } = useRouter()

    function del(id: string) {
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

                </div>



                <Divider />

                {/* COMMISSON */}
                {/* <div className="min-w-[5ch] h-full">

                    <b className="text-violet-600 text-sm font-medium whitespace-nowrap">
                        {p.partner.username}
                    </b>

                </div> */}

                <div className="flex flex-col items-center gap-1 min-w-[5ch] h-full">
                    <b className="text-xs whitespace-nowrap text-slate-500  text-center
                        font-bold transition-colors">
                        Kullanici:
                    </b>


                    <b className="text-violet-600 text-sm font-medium whitespace-nowrap text-center">
                        {p.partner.username}
                    </b>


                </div>



                <Divider />

                <div className="min-w-[5ch]">

                    <small className="text-slate-500 text-xs font-medium whitespace-nowrap">
                        <TimeAgo
                            className="whitespace-nowrap"
                            title={formatDateTR(p.createdAt)}
                            datetime={p.createdAt as Date}
                            locale={'tr'}
                        />
                    </small>
                </div>



                <Divider />


                {/* EDIT BUTTONS */}
                <div className="w-fulll">
                    <div className="flex flex-row">


                        <div className=" flex flex-nowrap gap-2 ml-auto mr-4 h-full place-self-center">

                            <IconButton
                                size="small"
                                onClick={() => del(p.id)}
                                title="Affiliate Linkini Sil"
                                aria-label="Sil">
                                <DeleteIcon className="text-red-400 w-6 h-6" />
                            </IconButton>
                            <IconButton
                                size="small"
                                title="Affiliate Linki Onayla"
                                onClick={() => push(`${AppRoutes.VENDOR_CREATE_PRODUCT}?edit=true&pid=${p.id}`)}
                                aria-label="Düzenle">
                                <CheckIcon className="text-green-600 w-6 h-6" />
                            </IconButton>
                        </div>

                    </div>


                </div>



            </div>



        </li>)
}

export default NotificationItem