/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { type Product } from "@prisma/client";
import React from "react";
import Image from "next/image";
import productImg from '../../../assets/product.png';
import { numberWithCommas } from "../../../utils/helpers";
import { Lira } from "../../shared/HtmlCodes";
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/DeleteOutlineTwoTone';
import EditIcon from '@mui/icons-material/EditOutlined';
import LinkIcon2 from '@mui/icons-material/Link';
import LinkIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import Chip from '@mui/material/Chip';
import classNames from "../../../utils/classnames";
import { useRouter } from "next/router";
import { AppRoutes } from "../../../config/appRoutes";
import LinkButton from "../../buttons/LinkButton";
import Link from "next/link";

// import { useState, useEffect } from 'react';
// import { HiChevronRight, HiHome, HiCollection, HiOutlineArrowSmRight, HiArrowCircleRight } from 'react-icons/hi'
// import { getSession, signIn, signOut, useSession } from "next-auth/react";
// import { RefetchOptions, RefetchQueryFilters } from "@tanstack/react-query";


type ItemProps = {
    p: Product;
    confirmModal: () => void;
    setDeleteId: (id: string) => void;
}
// 812px ve asgisi icin layout degis
const ProductItem: React.FC<ItemProps> = ({ p, confirmModal, setDeleteId }) => {
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
                    href={`${AppRoutes.PUBLIC_PRODUCT_DETAIL}/${p.id}`}>
                    {p.image ?
                        <img
                            className="object-cover hover:shadow rounded object-center w-12 h-12 aspect-square"
                            src={p.image}
                            alt={p.title!} />
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



                {/* TITLE */}
                <div className="flex flex-col items-start gap-1 min-w-[20ch] h-full">
                    <Link
                        onClick={() => null}
                        href={`${AppRoutes.PUBLIC_PRODUCT_DETAIL}/${p.id}`}>
                        <h4 className="text-xs whitespace-nowrap text-stone-5000 
                        font-bold hover:text-sky-500 transition-colors">
                            {p.title!.length > 25 ? p.title!.substring(0, 25) + " ..." : p.title}
                        </h4>
                    </Link>

                    <p className="text-stone-400 text-xs whitespace-nowrap">
                        <b className="text-stone-500">Fiyat: </b>
                        {numberWithCommas(p.price)}
                        <Lira />
                    </p>

                </div>




                {/* DIVIDER */}
                <div className="w-[1px] bg-zinc-400 pr-[1px] h-8 " />



                {/* COMMISSON */}
                <div className="flex flex-col gap-1 items-start  bg-purplex-200 min-w-[12ch] h-full">

                    <div className="flex justify-between w-full">

                        <b className="text-stone-800 text-xs ">Tiklama:</b>

                        <p className="text-stone-600 text-xs font-medium whitespace-nowrap">
                            {numberWithCommas(p.perClick)} {p.perClickType === "CASH" ? <Lira /> : "%"}
                        </p>


                    </div>

                    <div className="flex justify-between w-full">

                        <b className="text-stone-800 text-xs">Satış: </b>

                        <p className="text-stone-600 text-xs font-medium whitespace-nowrap">
                            {numberWithCommas(p.perSale)} {p.perSaleType === "CASH" ? <Lira /> : "%"}
                        </p>

                    </div>

                </div>



                {/* DIVIDER */}
                <div className="w-[1px] bg-zinc-400 pr-[1px] h-8 " />



                {/* PRODUCT LINK */}
                <div className="">
                    <a className="text-[10px] whitespace-nowrap text-sky-500"
                        href={p.product_url!}
                        target="_blank"
                        rel="noreferrer">

                        {p.product_url ? <>{p.product_url!.length > 25
                            ? p.product_url!.substring(0, 25) + " ..." : p.product_url}</>
                            : <span className="w-[50px]">Lutfen bir ürün linki Ekleyiniz!</span>}
                    </a>
                </div>



                {/* DIVIDER */}
                <div className="w-[1px] bg-zinc-400 pr-[1px] h-8 " />



                {/* EDIT BUTTONS */}
                <div className="w-fulll">
                    <div className="flex flex-row">


                        <div className="mr-4 flex flex-nowrap gap-2 ml-auto h-full place-self-center">
                            <IconButton
                                size="small"
                                onClick={() => push(`${AppRoutes.PUBLIC_PRODUCT_DETAIL}/${p.id}`)}
                                title="Detay"
                                aria-label="Detay">
                                <LinkIcon className="text-indigo-600 w-4 h-4" />
                            </IconButton>
                        </div>

                    </div>


                </div>



            </div>



        </li>)
}

export default ProductItem