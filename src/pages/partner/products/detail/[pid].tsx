/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { useRouter } from 'next/router'
import type { GetServerSideProps } from "next";
import { type NextPage, /*  NextApiRequest, InferGetServerSidePropsType  */ } from "next";
import { getSession } from "next-auth/react";
import PageCard from "../../../../components/card/Card";
import { UserRoles } from '../../../../interface/auth.interface';
import { trpc } from '../../../../utils/trpc';
import { HiPlus } from 'react-icons/hi'
import LinkButton from "../../../../components/buttons/LinkButton";


const Detail: NextPage = () => {
    const router = useRouter()
    const { pid } = router.query


    return (
        <div className='auth-container'>
            Detail: {pid}
            
        </div>
    )
}

export default Detail