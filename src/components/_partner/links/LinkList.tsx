/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { type Link as LinkEntity, type Vendor, type Product } from "@prisma/client";
import React from "react";
import { trpc } from '../../../utils/trpc';
import NLink from 'next/link';
import { useState, useEffect } from 'react';
import styled from '@emotion/styled'
import Image from "next/image";
import profileImg from '../../assets/profile.webp'
import LinkItem from "./LinkItem";
import LinkListHeader from "./LinkListHeader";
import Button from "@mui/material/Button";
import { notifyError, notifySuccessBR, notifySuccessTC } from "../../../utils/notifications";
import ModalContainer from "../../modals/ModalContainer";
import WarnDialog from "../../modals/WarnDialog";
import IconButton from "../../buttons/IconButton";
// import { getSession, signIn, signOut, useSession } from "next-auth/react";
// import { RefetchOptions, RefetchQueryFilters } from "@tanstack/react-query";


type Props = {
  links: (LinkEntity & { vendor: Vendor; product: Product; })[] | undefined;
  refetch: () => void;
}

const PartnerLinkList: React.FC<Props> = ({ links, refetch }) => {
  const [modal, setModal] = useState(false)
  const [deleteId, setDeleteId] = useState('')

  // PARTNER has no del button
  // const pasifyLink = trpc.product.pasifyProduct.useMutation()

  const handleDelete = async () => {

    console.log('');

  }

  return (<>


    {links?.length === 0 ? <p className='text-center'>Henüz bir ürün bulunmuyor</p> : (<>

      {/* <LinkListHeader /> */}
      <ul className='flex gap-2 flex-col items-center min-h-full maxos-w-[700px]  mx-auto'>
        {links?.map(p => (
          <LinkItem
            key={p.id}
            p={p}
            setDeleteId={setDeleteId}
            confirmModal={() => setModal(true)} />))}
      </ul>

      <ModalContainer state={modal} key={"adda"}>
        <WarnDialog
          title="Ürünü silmek istiyor musunuz?"
          desc="
          Ürün listenizden silinecek ve oluşturulan 
          tüm affiliate linkleri geçersiz hale gelerek 
          hata sayfasina yönlendirilecektir. 
          "
          confirmBtnText='Sil'
          dismissFn={() => setModal(false)}
          confirmFn={() => handleDelete()}
        />
      </ModalContainer>

    </>
    )}

  </>);
};

export default PartnerLinkList;

