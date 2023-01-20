import TopBarProgress from "react-topbar-progress-indicator";
import classNames from "../../../utils/classnames";
import PageCard from "../../../components/card/Card";
import Link from "next/link";
import { useEffect, useState } from "react";

const Title: React.FC<TitleProps> = ({ children }) => <h1
  className="mt- text-xl font-bold text-slate-600">
  {children}
</h1>


type TitleProps = {
  children: React.ReactNode;

};

const PaymentsIndex = () => {
  return (
    <div>
      <PageCard>
        <Title>Odemesi Bekleyen Partnerler</Title>
        <hr />
        <section className="mt-4 flex justify-between items-center xs:flex-wrap md:flex-wrap gap-4">




        </section>

      </PageCard>



    </div>
  )
}

export default PaymentsIndex