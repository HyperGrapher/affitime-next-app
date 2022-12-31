/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { type Link as LinkEntity, type Partner, type Product } from "@prisma/client";
import React from "react";
import { trpc } from '../../../utils/trpc';
import { useState, useEffect } from 'react';
import styled from '@emotion/styled'
import Image from "next/image";
import profileImg from '../../assets/profile.webp'
import NotificationItem from "./NotificationItem";
import Button from "@mui/material/Button";
import { notifyError, notifySuccessBR, notifySuccessTC } from "../../../utils/notifications";
import ModalContainer from "../../modals/ModalContainer";
import WarnDialog from "../../modals/WarnDialog";
import IconButton from "../../buttons/IconButton";
import ConfirmDialog from "../../modals/ConfirmDialog";
// import LinkListHeader from "./LinkListHeader";

type Props = {
  prod: (LinkEntity & { partner: Partner; product: Product; })[] | undefined
  refetch: () => void;
}

const NotificationList: React.FC<Props> = ({ prod, refetch }) => {
  const [cancelModal, setCancelModal] = useState(false)
  const [confirmModal, setConfirmModal] = useState(false)
  const [linkId, setLinkId] = useState('')

  // TODO: move to notifications route
  const update = trpc.link.updateLinkStatusByVendor.useMutation()

  const handleAction = async (confirmed: boolean) => {


    update.mutate({ id: linkId, isConfirmed: confirmed }, {

      onError(error) {
        console.log(error);
        notifyError("Bir hata olustu")

      },
      onSettled: () => {
        refetch()
        setCancelModal(false)
        setConfirmModal(false)
      }
    })


  }

  // TODO: EMPTY STATE 
  return (<>


    {prod?.length === 0 ? <p className='text-center'>Henüz bir bildiriminiz bulunmuyor</p> : (<>

      {/* <LinkListHeader /> */}
      <ul className='flex gap-2 flex-col items-center min-h-full maxos-w-[700px]  mx-auto'>
        {prod?.map(p => (
          <NotificationItem
            key={p.id}
            p={p}
            setLinkId={setLinkId}
            confirmModal={() => setConfirmModal(true)}
            cancelModal={() => setCancelModal(true)}
          />))}
      </ul>

      <ModalContainer state={cancelModal}>
        <WarnDialog
          title="Affiliate link istegini iptal etmek istiyor musunuz?"
          desc="
          Partner linki onayınıza bağlıdır. 
          İptal etmeniz durumunda partner için affiliate linki oluşturulmayacaktır.
          "
          confirmBtnText='İptal Et'
          dismissFn={() => setCancelModal(false)}
          confirmFn={() => handleAction(false)}
        />
      </ModalContainer>

      <ModalContainer state={confirmModal}>
        <ConfirmDialog
          title="Affiliate link istegini onaylamak istiyor musunuz?"
          desc="
          Partner linki onayınıza bağlıdır. 
          Onaylamaniz durumunda partner için affiliate linki oluşturulacaktir.
          "
          confirmBtnText='Onayla'
          dismissFn={() => setConfirmModal(false)}
          confirmFn={() => handleAction(true)}
        />
      </ModalContainer>

    </>
    )}

  </>);
};

export default NotificationList;

