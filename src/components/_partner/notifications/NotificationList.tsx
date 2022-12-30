/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { type Link as LinkEntity, type Vendor, type Product } from "@prisma/client";
import React from "react";
import NotificationItem from "./NotificationItem";


// import LinkListHeader from "./LinkListHeader";
// import { getSession, signIn, signOut, useSession } from "next-auth/react";
// import { RefetchOptions, RefetchQueryFilters } from "@tanstack/react-query";


type Props = {
  prod: (LinkEntity & { vendor: Vendor; product: Product; })[] | undefined
  refetch: () => void;
}

const NotificationList: React.FC<Props> = ({ prod, refetch }) => {


  return (<>


    {prod?.length === 0 ? <p className='text-center'>Henüz bir bildiriminiz bulunmuyor</p> : (<>

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

