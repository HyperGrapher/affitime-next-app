import type { GetServerSideProps, NextPage } from 'next'
import { getSession, signIn } from "next-auth/react";
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AppRoutes } from '../../config/appRoutes';
import TopBarProgress from 'react-topbar-progress-indicator';
import classNames from '../../utils/classnames';
import { UserRoles } from '../../interface/auth.interface';
import { trpc } from "../../utils/trpc";
import { prisma } from "../../server/db/client";
import Balancer from "react-wrap-balancer";
import Image from 'next/image'


const NotVerified = () => {
    return (
        <div className='grid place-items-center h-screen bg-slate-100'>


            <div className="px-4 bg-white rounded-lg max-w-xl w-full py-4 shadow-md border">

                <div className="mx-auto">
                    <Image
                        className='h-8 w-auto mx-auto my-3'
                        src="/logo-sm.png"
                        alt='Affitime Logo'
                        width={220}
                        height={60}
                    />
                </div>
                <h3 className='font-bold text-lg text-center mb-4'>E-posta adresini doğrulayın</h3>
                <p className='text-base text-center'>
                    <Balancer>
                        Kayıtlı E-posta adresinize gonderilen linke tıklayarak
                        E-posta adresinizi doğrulayın

                    </Balancer>
                </p>
            </div>

        </div>
    )
}

export default NotVerified


export const getServerSideProps: GetServerSideProps = async (context) => {

    const session = await getSession(context)

    if (!session) return {
        redirect: {
            destination: AppRoutes.SIGNIN,
            permanent: false
        }
    }

    const user = await prisma.user.findUnique({
        where: { id: session.id },
        select: { emailVerified: true, email: true, createdAt: true }
    });

    if (user?.emailVerified) {

        return {
            redirect: {
                destination: `/${session.role.toLowerCase()}/dashboard`,
                permanent: false
            }
        }

    }

    return { props: {} }
}