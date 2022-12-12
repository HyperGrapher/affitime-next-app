/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { type Product } from "@prisma/client";
import React from "react";
import Image from "next/image";
import product from '../../assets/product.png';
// import { useState, useEffect } from 'react';
// import { HiChevronRight, HiHome, HiCollection, HiOutlineArrowSmRight, HiArrowCircleRight } from 'react-icons/hi'
// import { getSession, signIn, signOut, useSession } from "next-auth/react";
// import { RefetchOptions, RefetchQueryFilters } from "@tanstack/react-query";


type ItemProps = {
    p: Product;
    deleteProduct: (id: string) => void;
}

const ProductItem: React.FC<ItemProps> = ({ p, deleteProduct }) => {

    return (<li className="border hover:border-black/5 w-full  py-2 px-2 bg-slate-200 rounded-md shadow hover:shadow-md transition-all shadow-slate-300 ">

        <div className="flex gap-4">

            {/* <Image className="object-cover w-48 h-48 spect-square"  width={"85"} height={"85"} src={ p.image ?? profileImg} alt={"p.title"} /> */}
            {p.image ?
                <img
                    className="object-cover rounded object-center w-20 h-20 aspect-square"
                    src={p.image}
                    alt={p.title!} />
                : <Image
                    className="object-cover rounded object-center w-20 h-20 aspect-square border border-1 border-stone-300"
                    width={"85"}
                    height={"85"}
                    src={product}
                    alt={"Generic Foto"} />
            }

            <div className="w-full">
                <div className="flex flex-row">
                    <h4 className="text-sm text-stone-5000 font-bold">{p.title}</h4>

                    <div className=" flex flex-nowrap gap-2 ml-auto h-full place-self-center">
                        <button className="bg-red-500 hover:bg-red-600 transition-colors h-6 shadow border px-6 text-red-100 text-xs" onClick={() => deleteProduct(p.id)}>Sil</button>
                        <button className="bg-blue-500 hover:bg-blue-600 transition-colors h-6 shadow border px-2 text-blue-100 text-xs" onClick={() => deleteProduct(p.id)}>Duzenle</button>
                    </div>

                </div>

                <div className="bg-salmon-200 text-sm mt-2">
                    <p className="text-stone-600 text-xs"><b>Fiyat: </b>{p.price} TL</p>
                    <a
                        target="_blank"
                        rel="noreferrer"
                        aria-label={p.product_url!}
                        title={p.product_url!}
                        href={p.product_url!}
                        className="text-blue-600 text-xs mb-1 underline">Magaza Linki</a>




                </div>
            </div>



        </div>



    </li>)
}

export default ProductItem