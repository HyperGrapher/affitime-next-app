import LinkIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import { type Product } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import productImg from '../../../assets/product.png';
import { AppRoutes } from "../../../config/appRoutes";
import classNames from "../../../utils/classnames";
import { numberWithCommas } from "../../../utils/helpers";
import { Lira } from "../../shared/HtmlCodes";
import Divider from '../../shared/Divider';



type ItemProps = {
    p: Product;
    store: string;
}

const ProductItemMobile: React.FC<ItemProps> = ({ p }) => {

    const { push } = useRouter()

    return (
        <li className={
            classNames(
                "border hover:border-black/5 w-full",
                "py-2 px-2 bg-slate-100 hover:bg-slate-50 rounded-md",
                "shadow hover:shadow-md transition-all shadow-slate-300",
                ""
            )}>
            <div className="flex gap-4 items-center xjustify-between">


                {/* IMAGE */}
                <Link
                    className="aspect-square  w-12 h-12 "
                    href={`${AppRoutes.PUBLIC_PRODUCT_DETAIL}/${p.id}`}>
                    {p.image ?
                        <img
                            className="object-cover hover:shadow rounded object-center w-12 h-12 aspect-square"
                            src={p.image}
                            alt={p.title ?? "product"} />
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


                <div className="flex flex-col items-start gap-1 min-w-[20ch] h-full">
                    <Link
                        onClick={() => null}
                        href={`${AppRoutes.PUBLIC_PRODUCT_DETAIL}/${p.id}`}>
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



                <div className="w-fulll ml-auto">
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

                {/* END innerDiv */}
            </div>



        </li>
    )
}

export default ProductItemMobile