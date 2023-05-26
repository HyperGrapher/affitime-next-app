import type { Visit } from "@prisma/client";
import { type Link as LinkEntity, type Partner, type Product } from "@prisma/client";
import dynamic from 'next/dynamic';
import React, { useState } from "react";
import { useMediaQuery as useMQ } from 'react-responsive';
import { trpc } from '../../../utils/trpc';
import VendorLinkItem from "./LinkItem";
import LinkItemMobile from "./LinkItemMobile";


const DynamicModalContainer = dynamic(() => import('../../modals/ModalContainer'), {
  ssr: false,
})

const DynamicWarnDialog = dynamic(() => import('../../modals/WarnDialog'), {
  ssr: false,
})


type Props = {
  links: (LinkEntity & { partner: Partner; product: Product; visits: Visit[] })[] | undefined;
  refetch: () => void;
}

const VendorLinkList: React.FC<Props> = ({ links }) => {
  const [modal, setModal] = useState(false)
  const [deleteId, setDeleteId] = useState('')
  const isMobile = useMQ({
    maxWidth: 767,
  })
  const pasifyLinkMutation = trpc.product.pasifyProduct.useMutation()

  const handlePasifyLink = async () => {

    console.log('pasifyLink', deleteId);
    pasifyLinkMutation.mutate({
      id: "ad"
    })
  }

  return (<>


    {links?.length === 0
      ? <p className='text-center'>Henüz bir affiliate linki bulunmuyor</p>
      :
      (
        <>

          <ul className='flex gap-2 flex-col items-center min-h-full maxos-w-[700px]  mx-auto'>
            {links?.map(p => (
              <React.Fragment key={p.id}>
                {isMobile
                  ? <LinkItemMobile
                    key={p.id}
                    link={p}
                    setDeleteId={setDeleteId}
                    confirmModal={() => setModal(true)} />
                  : <VendorLinkItem
                    key={p.id}
                    link={p}
                    setDeleteId={setDeleteId}
                    confirmModal={() => setModal(true)} />}

              </React.Fragment>

            ))}
          </ul>

          <DynamicModalContainer state={modal} key={"justakey"}>
            <DynamicWarnDialog
              title="Affiliate linkini duraklatmak istiyor musunuz?"
              desc="
          Link pasif hale gelerek hata sayfasina yönlendirilecektir. 
          Link tıklamaları mağazanıza ulaşmayacatır.
          "
              confirmBtnText='Duraklat'
              dismissFn={() => setModal(false)}
              confirmFn={() => handlePasifyLink()}
            />
          </DynamicModalContainer>

        </>
      )
    }

  </>);
};

export default VendorLinkList;

