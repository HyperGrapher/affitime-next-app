import { type Link as LinkEntity, type Partner, type Product } from "@prisma/client";
import React, { useState } from "react";
import { trpc } from '../../../utils/trpc';
import LinkItem from "./LinkItem";
import dynamic from 'next/dynamic'

const DynamicModalContainer = dynamic(() => import('../../modals/ModalContainer'), {
  ssr: false,
})

const DynamicWarnDialog = dynamic(() => import('../../modals/WarnDialog'), {
  ssr: false,
})


type Props = {
  links: (LinkEntity & { partner: Partner; product: Product; })[] | undefined;
  refetch: () => void;
}

const VendorLinkList: React.FC<Props> = ({ links }) => {
  const [modal, setModal] = useState(false)
  const [deleteId, setDeleteId] = useState('')

  const pasifyLinkMutation = trpc.product.pasifyProduct.useMutation()

  const handlePasifyLink = async () => {

    console.log('pasifyLink', deleteId);
    pasifyLinkMutation.mutate({
      id: "ad"
    })
  }

  return (<>


    {links?.length === 0 ? <p className='text-center'>Henüz bir affiliate linki bulunmuyor</p> : (<>

      {/* <LinkListHeader /> */}
      <ul className='flex gap-2 flex-col items-center min-h-full maxos-w-[700px]  mx-auto'>
        {links?.map(p => (
          <LinkItem
            key={p.id}
            p={p}
            setDeleteId={setDeleteId}
            confirmModal={() => setModal(true)} />))}
      </ul>

      <DynamicModalContainer state={modal} key={"adda"}>
        <DynamicWarnDialog
          title="Affiliate linkini duraklatmak istiyor musunuz?"
          desc="
          Link pasif hale gelerek ve oluşturulan 
          tüm Affiliate Linklerim hata sayfasina yönlendirilecektir. 
          "
          confirmBtnText='Sil'
          dismissFn={() => setModal(false)}
          confirmFn={() => handlePasifyLink()}
        />
      </DynamicModalContainer>

    </>
    )}

  </>);
};

export default VendorLinkList;

