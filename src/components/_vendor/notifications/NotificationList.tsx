import { type Link as LinkEntity, type Partner, type Product } from "@prisma/client";
import React, { useState } from "react";
import { notifyError } from "../../../utils/notifications";
import { trpc } from '../../../utils/trpc';
import NotificationItem from "./NotificationItem";
import dynamic from 'next/dynamic'

const DynamicModalContainer = dynamic(() => import('../../modals/ModalContainer'), {
  ssr: false,
})

const DynamicWarnDialog = dynamic(() => import('../../modals/WarnDialog'), {
  ssr: false,
})


const DynamicConfirmDialog = dynamic(() => import('../../modals/ConfirmDialog'), {
  ssr: false,
})


type Props = {
  links: (LinkEntity & { partner: Partner; product: Product; })[] | undefined
  refetch: () => void;
}

const NotificationList: React.FC<Props> = ({ links, refetch }) => {
  const [cancelModal, setCancelModal] = useState(false)
  const [confirmModal, setConfirmModal] = useState(false)
  const [linkId, setLinkId] = useState('')

  const update = trpc.link.confirmOrDenyLinkRequest.useMutation()

  const handleAction = async (confirmed: boolean) => {


    update.mutate({ id: linkId, confirmed }, {
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

  return (<>

    {links?.length === 0 ? <p className='text-center'>Henüz bir bildiriminiz bulunmuyor</p> : (<>

      {/* <LinkListHeader /> */}
      <ul className='flex gap-2 flex-col items-center min-h-full maxos-w-[700px]  mx-auto'>
        {links?.map(p => (
          <NotificationItem
            key={p.id}
            link={p}
            setLinkId={setLinkId}
            confirmModal={() => setConfirmModal(true)}
            cancelModal={() => setCancelModal(true)}
          />))}
      </ul>

      <DynamicModalContainer state={cancelModal}>
        <DynamicWarnDialog
          title="Affiliate link isteğini iptal etmek istiyor musunuz?"
          desc="
          Affiliate link kullanımı onayınıza bağlıdır. 
          İptal etmeniz durumunda partner için affiliate linki oluşturulmayacaktır.
          "
          confirmBtnText='İptal Et'
          dismissFn={() => setCancelModal(false)}
          confirmFn={() => handleAction(false)}
        />
      </DynamicModalContainer>

      <DynamicModalContainer state={confirmModal}>
        <DynamicConfirmDialog
          title="Affiliate link isteğini onaylamak istiyor musunuz?"
          desc="
          Affiliate link kullanımı onayınıza bağlıdır. 
          Onaylamaniz durumunda partner için affiliate linki oluşturulacaktir.
          "
          confirmBtnText='Onayla'
          dismissFn={() => setConfirmModal(false)}
          confirmFn={() => handleAction(true)}
        />
      </DynamicModalContainer>

    </>
    )}

  </>);
};

export default NotificationList;

