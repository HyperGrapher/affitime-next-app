import { type Product } from "@prisma/client";
import React from "react";
import ProductItem from "./ProductItem";
import ProductListHeader from "./ProductListHeader";



type Props = {
  prod: Product[] | undefined;
  refetch: () => void;
}

const PartnerProductList: React.FC<Props> = ({ prod }) => {

  return (<>

    {prod?.length === 0 ? <p className='text-center'>Henüz bir ürün bulunmuyor</p> : (<>

      <ProductListHeader />
      <ul className='flex gap-2 flex-col items-center min-h-full maxos-w-[700px]  mx-auto'>
        {prod?.map(p => (
          <ProductItem key={p.id} p={p} />)
        )}
      </ul>

    </>
    )}

  </>);
};

export default PartnerProductList;

