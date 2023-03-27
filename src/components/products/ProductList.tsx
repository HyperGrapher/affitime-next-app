import { type Product } from "@prisma/client";
import React, { useState } from "react";
import { notifyError, notifySuccessTC } from "../../utils/notifications";
import { trpc } from '../../utils/trpc';
import VendorProductItem from "./ProductItem";
import ProductListHeader from "./ProductListHeader";
import dynamic from 'next/dynamic'
import EmptyListView from "../shared/EmptyListView";
import { useMediaQuery as useMQ } from 'react-responsive';
import VendorProductItemMobile from "./ProductItemMobile";


const DynamicModalContainer = dynamic(() => import('../modals/ModalContainer'), {
  ssr: false,
  // loading: () => <div></div>
})

const DynamicWarnDialog = dynamic(() => import('../modals/WarnDialog'), {
  ssr: false,
  // loading: () => <div></div>
})


type Props = {
  prod: Product[] | undefined;
  refetch: () => void;
}

const VendorProductList: React.FC<Props> = ({ prod, refetch }) => {

  const [modal, setModal] = useState(false)
  const [deleteId, setDeleteId] = useState('')
  const isMobile = useMQ({
    maxWidth: 767,
  })
  const pasifyProduct = trpc.product.pasifyProduct.useMutation()

  const handleDelete = async () => {

    if (!deleteId) return notifyError('İşlem başarısız! [ID]');

    const res = await pasifyProduct.mutateAsync({ id: deleteId })

    if (res.error) return notifyError('İşlem başarısız! [DB]');

    setDeleteId('')
    notifySuccessTC("İşlem başarılı", true)
    refetch()
    setModal(false)

  }

  return (<>

    {prod?.length === 0 ? <EmptyListView title="Henüz bir ürün eklemediniz" /> : (<>

      {isMobile ? null : <ProductListHeader />}
      <ul className='flex gap-2 flex-col items-center min-h-full maxos-w-[700px]  mx-auto'>
        {prod?.map(p => (
          <React.Fragment key={p.id}>
            {isMobile
              ? <VendorProductItemMobile
                key={p.id}
                p={p}
                setDeleteId={setDeleteId}
                confirmModal={() => setModal(true)} />
              : <VendorProductItem
                key={p.id}
                p={p}
                setDeleteId={setDeleteId}
                confirmModal={() => setModal(true)} />}

          </React.Fragment>))}
      </ul>

      <DynamicModalContainer state={modal} key={"adda"}>
        <DynamicWarnDialog
          title="Ürünü kaldırmak istiyor musunuz?"
          desc="
          Ürün pasif hale gelecek ve oluşturulan 
          tüm Affiliate Linklerim geçersiz hale gelerek 
          hata sayfasina yönlendirilecektir. 
          "
          confirmBtnText="Kaldır"
          dismissFn={() => setModal(false)}
          confirmFn={() => handleDelete()}
        />
      </DynamicModalContainer>

    </>
    )}

  </>);
};

export default VendorProductList;

