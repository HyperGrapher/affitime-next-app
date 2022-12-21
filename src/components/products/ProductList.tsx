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
import { notifyError, notifySuccessBR, notifySuccessTC } from "../../utils/notifications";
import ModalContainer from "../modals/ModalContainer";
import ConfirmDeleteDialog from "../modals/ConfirmDialog";
import IconButton from "../buttons/IconButton";
// import { getSession, signIn, signOut, useSession } from "next-auth/react";
// import { RefetchOptions, RefetchQueryFilters } from "@tanstack/react-query";


type Props = {
  prod: Product[] | undefined;
  refetch: () => void;
}

const ProductList: React.FC<Props> = ({ prod, refetch }) => {
  const [modal, setModal] = useState(false)
  const [deleteId, setDeleteId] = useState('')

  const deleteProd = trpc.product.deleteProduct.useMutation()

  const handleDelete = async () => {

    if (!deleteId) return notifyError('Silme işlemi başarısız! [ID]');

    const deleteRes = await deleteProd.mutateAsync({ id: deleteId })

    if (deleteRes.error) return notifyError('Silme işlemi başarısız! [DB]');

    setDeleteId('')
    notifySuccessTC("Ürün silindi!", true)
    refetch()
    setModal(false)

  }

  // TODO: EMPTY STATE 
  return (<>

    {prod?.length === 0 ? <p className='text-center'>Henüz ürün eklemediniz</p> : (<>

      <ProductListHeader />
      <ul className='flex gap-2 flex-col items-center min-h-full maxos-w-[700px]  mx-auto'>
        {prod?.map(p => (
          <ProductItem
            key={p.id}
            p={p}
            setDeleteId={setDeleteId}
            confirmModal={() => setModal(true)} />))}
      </ul>

      <ModalContainer state={modal} key={"adda"}>
        <ConfirmDeleteDialog
          title="Ürünü silmek istiyor musunuz?"
          desc="
          Ürün listenizden silinecek ve oluşturulan 
          tüm affiliate linkleri geçersiz hale gelerek 
          hata sayfasina yönlendirilecektir. 
          "
          dismissFn={() => setModal(false)}
          confirmFn={() => handleDelete()}
        />
      </ModalContainer>

    </>
    )}

  </>);
};

export default ProductList;

