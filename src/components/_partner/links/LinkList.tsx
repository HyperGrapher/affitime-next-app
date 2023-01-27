import type { Visit } from "@prisma/client";
import { type Link as LinkEntity, type Product, type Vendor } from "@prisma/client";
import React from "react";
import LinkItem from "./LinkItem";

type Props = {
  links: (LinkEntity & { vendor: Vendor; product: Product; visits: Visit[] })[] | undefined;
  refetch: () => void;
}

const PartnerLinkList: React.FC<Props> = ({ links }) => {

  return (<>
    {links?.length === 0 ? <p className='text-center'>Henüz bir ürün bulunmuyor</p> : (<>

      {/* <LinkListHeader /> */}
      <ul className='flex gap-2 flex-col items-center min-h-full maxos-w-[700px]  mx-auto'>
        {links?.map(p => (
          <LinkItem
            key={p.id}
            link={p}
          />))}
      </ul>

    </>
    )}

  </>);
};

export default PartnerLinkList;

