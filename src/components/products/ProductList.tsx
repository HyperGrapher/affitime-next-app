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
import ProductItem from "./ProductItem";
import ProductListHeader from "./ProductListHeader";
import Button from "@mui/material/Button";
// import { getSession, signIn, signOut, useSession } from "next-auth/react";
// import { RefetchOptions, RefetchQueryFilters } from "@tanstack/react-query";


type Props = {
  prod: Product[] | undefined;
  refetch: () => void;
}

const ProductList: React.FC<Props> = ({ prod, refetch }) => {

  const deleteProd = trpc.product.deleteProduct.useMutation()
  const [error, setError] = useState('')


  const deleteProduct = async (id: string) => {

    const deleteRes = await deleteProd.mutateAsync({ id })

    if (deleteRes.error) {
      setError('Cannot delete product')
      return
    }
    refetch()

  }

  return (<>

    {prod?.length === 0 ? <p className='text-center'>Henüz ürün eklemediniz</p> : (<>

      <ProductListHeader />
      <ul className='flex gap-2 flex-col items-center min-h-full maxos-w-[700px]  mx-auto'>
        {prod?.map(p => (<ProductItem key={p.id} p={p} deleteProduct={deleteProduct} />))}
      </ul>
    </>
    )}

  </>);
};

export default ProductList;

