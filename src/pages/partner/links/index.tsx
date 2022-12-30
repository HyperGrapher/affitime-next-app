/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { GetServerSideProps } from "next";
import { type NextPage, /*  NextApiRequest, InferGetServerSidePropsType  */ } from "next";
import { getSession } from "next-auth/react";
import TopBarProgress from "react-topbar-progress-indicator";
import PageCard from "../../../components/card/Card";
import LinkList from '../../../components/_partner/links/LinkList';
import { UserRoles } from '../../../interface/auth.interface';
import { trpc } from '../../../utils/trpc';
import { HiPlus } from 'react-icons/hi'
import LinkButton from "../../../components/buttons/LinkButton";
import Pager from "../../../components/pager/Pager";

import { Link, Partner, Product } from "@prisma/client";
import classNames from "../../../utils/classnames";
import Image from "next/image";
import product from '../../../assets/product.png';
import { numberWithCommas } from "../../../utils/helpers";


const PartnerLinks: NextPage = () => {
    const { data: links, status: sts, refetch: refetchlinks } = trpc.link.getAllLinksForPartner.useQuery()

    return (
        <main className="auth-container">
            {sts === 'loading' && <TopBarProgress />}

            <PageCard>

                <div className="flex items-center mb-6">

                    <div className="ml-2">
                        <h2 className="font-bold text-xl text-slate-700">Affiliate Linkleri</h2>
                        {links && links?.length > 0 ? (
                            <small>
                                Toplam {links?.length} adet link
                            </small>
                        ) : null}
                    </div>

                </div>


                <section className="mb-4">

                    {/* <div>
                        {links?.map(ln => <div className="mb-4 border-2 px-2 py-4" key={ln.id}>
                            {ln?.id} - <small>{JSON.stringify(ln)}</small>

                        </div>)}
                    </div> */}

                    {links && links?.length > 0
                        ? <LinkList prod={links} refetch={refetchlinks} />
                        : null}

                </section>




                {/* <Pager /> */}

            </PageCard>
        </main>
    )
}

export default PartnerLinks