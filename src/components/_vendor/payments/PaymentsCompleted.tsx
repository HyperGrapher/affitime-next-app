import TopBarProgress from "react-topbar-progress-indicator";
import classNames from "../../../utils/classnames";
import PageCard from "../../../components/card/Card";
import Link from "next/link";
import { useEffect, useState } from "react";
import EmptyListView from "../../shared/EmptyListView";

const Title: React.FC<TitleProps> = ({ children }) => <h1
  className="mt- text-xl font-bold text-slate-600">
  {children}
</h1>


type TitleProps = {
  children: React.ReactNode;

};

const PaymentsCompleted = () => {
  return (
    <div>
      <PageCard>
        <Title>Yapılan Ödemeler</Title>
        <hr />
        <section className="space-y-2 mt-4">

          <EmptyListView title="Henüz yapılmış ödemeniz bulunmuyor" />

        </section>

      </PageCard>



    </div>
  )
}

export default PaymentsCompleted

