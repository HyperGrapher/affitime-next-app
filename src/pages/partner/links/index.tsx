/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { GetServerSideProps } from "next";
import { type NextPage, /*  NextApiRequest, InferGetServerSidePropsType  */ } from "next";
import { getSession } from "next-auth/react";
import TopBarProgress from "react-topbar-progress-indicator";
import PageCard from "../../../components/card/Card";
import ProductList from '../../../components/_partner/products/ProductList';
import ProductList2 from '../../../components/products/ProductList';
import { UserRoles } from '../../../interface/auth.interface';
import { trpc } from '../../../utils/trpc';
import { HiPlus } from 'react-icons/hi'
import LinkButton from "../../../components/buttons/LinkButton";
import Pager from "../../../components/pager/Pager";


const PartnerLinks: NextPage = () => {
    return (
        <div className="auth-container">Partner Link Listesi</div>
    )
}

export default PartnerLinks