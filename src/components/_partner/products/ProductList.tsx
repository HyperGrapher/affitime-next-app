import type { Vendor } from "@prisma/client";
import { type Product } from "@prisma/client";
import React from "react";
import ProductItem from "./ProductItem";
import ProductListHeader from "./ProductListHeader";
import { useMediaQuery as useMQ } from 'react-responsive';
import ProductItemMobile from "./ProductItemMobile";


type Props = {
  prod: (Product & {
    vendor: Vendor
  })[] | undefined;
  refetch: () => void;
}

const PartnerProductList: React.FC<Props> = ({ prod }) => {

  const isTabletMobile = useMQ({
    maxWidth: 767,
  })

  return (<>

    {prod?.length === 0 ? <p className='text-center'>Henüz bir ürün bulunmuyor</p> : (<>

      {isTabletMobile ? null : <ProductListHeader />}
      <ul className='flex gap-2 flex-col items-center min-h-full maxos-w-[700px]  mx-auto'>
        {prod?.map(p => (
          isTabletMobile ? <ProductItemMobile key={p.id} p={p} store={p.vendor.brand} /> : <ProductItem key={p.id} p={p} store={p.vendor.brand} />)
        )}
      </ul>

    </>
    )}

  </>);
};

export default PartnerProductList;

