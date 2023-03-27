import type { Visit } from "@prisma/client";
import { type Link as LinkEntity, type Product, type Vendor } from "@prisma/client";
import React from "react";
import LinkItem from "./LinkItem";
import { useMediaQuery as useMQ } from 'react-responsive';
import LinkItemMobile from "./LinkItemMobile";

type Props = {
  links: (LinkEntity & { vendor: Vendor; product: Product; visits: Visit[] })[] | undefined;
  refetch: () => void;
}

const PartnerLinkList: React.FC<Props> = ({ links }) => {
  const isMobile = useMQ({
    maxWidth: 767,
  })
  return (<>
    {links?.length === 0 ? <p className='text-center'>Henüz bir ürün bulunmuyor</p> : (<>

      {/* <LinkListHeader /> */}
      <ul className='flex gap-2 flex-col items-center min-h-full maxos-w-[700px]  mx-auto'>
        {links?.map(p => (
          <React.Fragment key={p.id}>
            {isMobile ?
              <LinkItemMobile
                key={p.id}
                link={p}
              /> :
              <LinkItem
                key={p.id}
                link={p}
              />}

          </React.Fragment>
        ))}
      </ul>

    </>
    )}

  </>);
};

export default PartnerLinkList;

