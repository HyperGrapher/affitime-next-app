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


const VendorProductItemMobile: React.FC<ItemProps> = ({ p, confirmModal, setDeleteId }) => {

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
            <div className="flex gap-4 items-center">
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
                <div className="flex flex-col items-start space-y-1 min-w-[20ch] h-full">
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


                    {/* STATUS */}
                    <p className="text-stone-400 text-xs whitespace-nowrap space-x-1">
                        <b className="text-xs text-stone-500">Durum:</b>
                        <b className={`${p.active ? "text-green-500" : "text-red-400"} text-xs font-bold whitespace-nowrap`}>
                            {p.active ? "Aktif" : "Silindi"}
                        </b>

                    </p>

                </div>


                <div className="ml-auto">

                    <div className="flex flex-row">
                        <div className="mr-4 flex flex-nowrap gap-2 ml-auto h-full place-self-center">
                            
                            <IconButton
                                size="small"
                                onClick={() => pasifyProduct(p.id)}
                                title="Sil"
                                aria-label="Sil">
                                <DeleteIcon className="text-red-400 w-4 h-4" />
                            </IconButton>
                            <IconButton
                                disabled={!p.active}
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
        </li>
    )
}

export default VendorProductItemMobile