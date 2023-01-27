import PageCard from "../../../components/card/Card";
import type { IUnpaidItemForPartner } from "../../../interface/dashboard.interface";
import EmptyListView from "../../shared/EmptyListView";
import AwaitingItem from "./AwaitingItem";

const Title: React.FC<TitleProps> = ({ children }) => <h1
  className="mt- text-xl font-bold text-slate-600">
  {children}
</h1>


type TitleProps = {
  children: React.ReactNode;

};

type Props = {
  vendors: IUnpaidItemForPartner[] | undefined
}

const AwaitingPayments: React.FC<Props> = ({ vendors }) => {
  return (
    <div>
      <PageCard>
        <Title>Bekleyen Ödemelerim</Title>

        <hr />
        <section className="space-y-2 mt-4">

          {(!vendors || vendors?.length === 0 ) && <EmptyListView title="Henüz bekleyen ödemeniz bulunmuyor" />}

          {vendors?.map(x => <AwaitingItem key={x.id} item={x} />)}


        </section>

      </PageCard>



    </div>
  )
}

export default AwaitingPayments