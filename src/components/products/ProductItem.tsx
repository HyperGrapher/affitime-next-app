/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { type Product } from "@prisma/client";
import React from "react";
import { trpc } from '../../utils/trpc';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import styled from '@emotion/styled'
import Image from "next/image";
import profileImg from '../../assets/profile.webp'
// import { getSession, signIn, signOut, useSession } from "next-auth/react";
// import { RefetchOptions, RefetchQueryFilters } from "@tanstack/react-query";


type ItemProps = {
    p: Product;
    deleteProduct: (id: string) => void;
}

const ProductItem: React.FC<ItemProps> = ({ p, deleteProduct }) => {

    return (<li className="border hover:border-black w-full h-36 py-2 px-4 bg-slate-200 rounded-md shadow-sm shadow-slate-300 ">


        <div className="flex gap-4">

            {/* <Image className="object-cover w-48 h-48 spect-square"  width={"85"} height={"85"} src={ p.image ?? profileImg} alt={"p.title"} /> */}
            <img className="object-cover object-center w-24 h-24 aspect-square" src={p.image!} alt={p.title!} />

            <div className="w-full">
                <div className="flex flex-row ">
                    <h4 className="text-lg text-stone-5000 font-bold">{p.title}</h4>

                    <div className="flex flex-nowrap gap-2 ml-auto">
                        <button className="bg-red-500 py-2 px-6 text-slate-50 text-xs" onClick={() => deleteProduct(p.id)}>Sil</button>
                        <button className="bg-blue-500 py-2 px-2 text-slate-50 text-xs" onClick={() => deleteProduct(p.id)}>Duzenle</button>
                    </div>

                </div>

                <div className="bg-salmon-200 text-sm mt-2">
                    <p className="text-stone-600 text-sm mb-2"><b>Fiyat: </b>{p.price} TL</p>
                    <p className="text-stone-600 text-sm mb-2"><b>Link: </b>{p.product_url} TL</p>
                    <p className="text-stone-600 text-sm">{p.desc}</p>
                </div>
            </div>



        </div>



    </li>)
}

export default ProductItem