import { type Link as LinkEntity, type Vendor, type Product } from "@prisma/client";
import React from "react";
import NotificationItem from "./NotificationItem";
import { useMediaQuery as useMQ } from 'react-responsive';
import NotificationItemMobile from "./NotificationItemMobile";


type Props = {
  prod: (LinkEntity & { vendor: Vendor; product: Product; })[] | undefined
  refetch: () => void;
}

const NotificationList: React.FC<Props> = ({ prod, refetch }) => {
  const isMobile = useMQ({
    maxWidth: 767,
  })

  return (<>

    {prod?.length === 0 ? <p className='text-center'>Bildiriminiz bulunmuyor</p> : (<>

      {/* <LinkListHeader /> */}
      <ul className='flex gap-2 flex-col items-center min-h-full maxos-w-[700px]  mx-auto'>
        {prod?.map(p => (
          <React.Fragment key={p.id}>
            {isMobile ? <NotificationItemMobile
              key={p.id}
              link={p}
              refetch={refetch}
            /> : <NotificationItem
              key={p.id}
              link={p}
              refetch={refetch}
            />}

          </React.Fragment>))}
      </ul>


    </>
    )}

  </>);
};

export default NotificationList;

