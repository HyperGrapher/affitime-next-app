import PageCard from "../../../components/card/Card";
import type { IUnpaidPartnerAndLinks } from "../../../interface/dashboard.interface";

const Title: React.FC<TitleProps> = ({ children }) => <h1
  className="mt- text-xl font-bold text-slate-600">
  {children}
</h1>


type TitleProps = {
  children: React.ReactNode;

};

type Props = {
  partners: IUnpaidPartnerAndLinks[] | undefined
}

const AwaitingPayments: React.FC<Props> = ({ partners }) => {
  return (
    <div>
      <PageCard>
        <Title>Odemesi Bekleyen Partnerler</Title>

        <hr />
        <section className="mt-4 xflex justify-between items-center xs:flex-wrap md:flex-wrap gap-4">

          {partners?.map(x => <div key={x.id}>{x.username}</div>)}


        </section>

      </PageCard>



    </div>
  )
}

export default AwaitingPayments