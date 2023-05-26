import { type Product } from "@prisma/client";
import React from "react";
import Image from "next/image";
import product from '../../assets/product.png';
import { numberWithCommas } from "../../utils/helpers";
import { Lira } from "../shared/HtmlCodes";
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/DeleteOutlineTwoTone';
import EditIcon from '@mui/icons-material/EditOutlined';
import classNames from "../../utils/classnames";
import { useRouter } from "next/router";
import { AppRoutes } from "../../config/appRoutes";
import Link from "next/link";


type ItemProps = {
    p: Product;
    confirmModal: () => void;
    setDeleteId: (id: string) => void;
}

const VendorProductItem: React.FC<ItemProps> = ({ p, confirmModal, setDeleteId }) => {
    const { push } = useRouter()

    function pasifyProduct(id: string) {
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
            <div className="flex gap-4 items-center justify-between">
                <Link
                    href={`${AppRoutes.PUBLIC_PRODUCT_DETAIL}/${p.id}`}
                    className="aspect-square  w-12 h-12">
                    {p.image ?
                        <img
                            className="object-cover hover:shadow rounded object-center w-12 h-12 aspect-square"
                            src={p.image}
                            alt={p.title ?? "urun fotosu"} />
                        : <Image
                            className={classNames(
                                "object-cover rounded hover:shadow object-center",
                                "w-12 h-12 aspect-square",
                                "border border-1 border-stone-300"
                            )}
                            width={"85"}
                            height={"85"}
                            src={product}
                            alt={"Generic Foto"} />
                    }
                </Link>



                {/* TITLE */}
                <div className="flex flex-col items-start gap-1 min-w-[20ch] h-full">
                    <Link href={`${AppRoutes.PUBLIC_PRODUCT_DETAIL}/${p.id}`}>
                        <h4 className="text-xs whitespace-nowrap text-stone-5000 
                        font-bold hover:text-sky-500 transition-colors">
                            {p.title && p.title.length > 25 ? p.title.substring(0, 25) + " ..." : p.title}
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

                        <b className="text-stone-800 text-xs ">Tıklama:</b>

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
                        href={p.product_url ?? "#"}
                        target="_blank"
                        rel="noreferrer">

                        {p.product_url ? <>{p.product_url.length > 25
                            ? p.product_url.substring(0, 25) + " ..." : p.product_url}</>
                            : <span className="w-[50px]">Lütfen bir ürün linki ekleyin!</span>}
                    </a>
                </div>


                {/* DIVIDER */}
                <div className="w-[1px] bg-zinc-400 pr-[1px] h-8 " />



                {/* STATUS */}
                <div className="text-center min-w-[5ch] ">

                    <b className={`${p.active ? "text-green-500" : "text-red-400"} text-xs font-bold whitespace-nowrap`}>
                        {p.active ? "Aktif" : "Silindi"}
                    </b>

                </div>


                {/* DIVIDER */}
                <div className="w-[1px] bg-zinc-400 pr-[1px] h-8 " />


                {/* EDIT BUTTONS */}
                <div className="w-fulll">
                    <div className="flex flex-row">


                        <div className=" flex flex-nowrap gap-2 ml-auto h-full place-self-center">

                            <IconButton
                                size="small"
                                onClick={() => pasifyProduct(p.id)}
                                title="Sil"
                                aria-label="Sil">
                                <DeleteIcon className="text-red-400 w-4 h-4" />
                            </IconButton>
                            <IconButton
                                size="small"
                                title="Düzenle"
                                onClick={() => push(`${AppRoutes.VENDOR_CREATE_PRODUCT}?edit=true&pid=${p.id}`)}
                                aria-label="Düzenle">
                                <EditIcon className="text-blue-400 w-4 h-4" />
                            </IconButton>
                        </div>

                    </div>


                </div>



            </div>



        </li>)
}

export default VendorProductItem