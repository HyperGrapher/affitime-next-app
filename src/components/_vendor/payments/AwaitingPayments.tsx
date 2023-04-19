import React from "react";
import PageCard from "../../../components/card/Card";
import type { IUnpaidItemForVendor } from "../../../interface/dashboard.interface";
import EmptyListView from "../../shared/EmptyListView";
import AwaitingItem from "./AwaitingItem";
import { useMediaQuery as useMQ } from 'react-responsive';
import AwaitingItemMobile from "./AwaitingItemMobile";



const Title: React.FC<TitleProps> = ({ children }) => <h1
  className="mt- text-xl font-bold text-slate-600">
  {children}
</h1>


type TitleProps = {
  children: React.ReactNode;

};

type Props = {
  partners: IUnpaidItemForVendor[] | undefined
}

const AwaitingPayments: React.FC<Props> = ({ partners }) => {

  const isMobile = useMQ({
    maxWidth: 767,
  })

  return (
    <div>
      <PageCard>
        <Title>Ödemesi Bekleyen Partnerler</Title>

        <hr />
        <section className="space-y-2 mt-4">

          {(!partners || partners?.length === 0) && <EmptyListView title="Henüz bekleyen ödemeniz bulunmuyor" />}

          {partners?.map(x => <React.Fragment key={x.id}>
            {isMobile
              ? <AwaitingItemMobile key={x.id} item={x} />
              : <AwaitingItem key={x.id} item={x} />
            }

          </React.Fragment>)}






        </section>

      </PageCard>



    </div>
  )
}

export default AwaitingPayments