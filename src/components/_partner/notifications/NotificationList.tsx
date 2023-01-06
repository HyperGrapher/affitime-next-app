import { type Link as LinkEntity, type Vendor, type Product } from "@prisma/client";
import React from "react";
import NotificationItem from "./NotificationItem";

type Props = {
  prod: (LinkEntity & { vendor: Vendor; product: Product; })[] | undefined
  refetch: () => void;
}

const NotificationList: React.FC<Props> = ({ prod, refetch }) => {


  return (<>

    {prod?.length === 0 ? <p className='text-center'>Bildiriminiz bulunmuyor</p> : (<>

      {/* <LinkListHeader /> */}
      <ul className='flex gap-2 flex-col items-center min-h-full maxos-w-[700px]  mx-auto'>
        {prod?.map(p => (
          <NotificationItem
            key={p.id}
            p={p}
            refetch={refetch}
          />))}
      </ul>


    </>
    )}

  </>);
};

export default NotificationList;

