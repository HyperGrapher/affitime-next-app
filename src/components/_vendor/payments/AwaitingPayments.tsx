import PageCard from "../../../components/card/Card";
import type { IUnpaidItemForVendor } from "../../../interface/dashboard.interface";
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
  partners: IUnpaidItemForVendor[] | undefined
}

const AwaitingPayments: React.FC<Props> = ({ partners }) => {
  return (
    <div>
      <PageCard>
        <Title>Ödemesi Bekleyen Partnerler</Title>

        <hr />
        <section className="space-y-2 mt-4">

          {(!partners || partners?.length === 0 ) && <EmptyListView title="Henüz bekleyen ödemeniz bulunmuyor" />}

          {partners?.map(x => <AwaitingItem key={x.id} item={x} />)}


        </section>

      </PageCard>



    </div>
  )
}

export default AwaitingPayments