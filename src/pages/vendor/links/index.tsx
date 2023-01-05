/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { GetServerSideProps } from "next";
import { type NextPage, /*  NextApiRequest, InferGetServerSidePropsType  */ } from "next";
import { getSession } from "next-auth/react";
import TopBarProgress from "react-topbar-progress-indicator";
import PageCard from "../../../components/card/Card";
import ProductList from '../../../components/products/ProductList';
import { UserRoles } from '../../../interface/auth.interface';
import { trpc } from '../../../utils/trpc';
import { HiPlus } from 'react-icons/hi'
import LinkButton from "../../../components/buttons/LinkButton";
import { Link, Partner, Product } from "@prisma/client";
import classNames from "../../../utils/classnames";
import Image from "next/image";
import product from '../../../assets/product.png';
import { numberWithCommas } from "../../../utils/helpers";
// import { Lira } from "../shared/HtmlCodes";
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/DeleteOutlineTwoTone';
import EditIcon from '@mui/icons-material/EditOutlined';
import LinkIcon from '@mui/icons-material/Link';
import LinkList from '../../../components/_vendor/links/LinkList';
import { AppRoutes } from "../../../config/appRoutes";

export const getServerSideProps: GetServerSideProps = async (context) => {

    const session = await getSession(context)


    context.res.setHeader(
        'Cache-Control',
        'public, s-maxage=10, stale-while-revalidate=59'
    )

    if (!session) return {
        redirect: {
            destination: AppRoutes.SIGNIN,
            permanent: false
        }
    }

    if (session.role !== UserRoles.VENDOR) return {
        redirect: {
            destination: `/${session.role.toLowerCase()}/dashboard`,
            permanent: false
        }
    }
    return { props: {  } }

}

// https://mantine.dev/hooks/use-pagination/
const LinkPage: NextPage = () => {


    const { data: links, status: sts, refetch: refetchLinks } = trpc.link.getAllLinksForVendor.useQuery()

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


                    {links && links?.length > 0
                        ? <LinkList links={links} refetch={refetchLinks} />
                        : null}

                </section>


            </PageCard>
        </main>
    )
}

export default LinkPage


