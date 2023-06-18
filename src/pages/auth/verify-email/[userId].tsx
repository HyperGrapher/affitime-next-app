import type { GetServerSideProps, NextPage } from 'next'
import { getSession, signIn } from "next-auth/react";
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AppRoutes } from '../../../config/appRoutes';
import TopBarProgress from 'react-topbar-progress-indicator';
import classNames from '../../../utils/classnames';
import { UserRoles } from '../../../interface/auth.interface';
import { trpc } from "../../../utils/trpc";
import { prisma } from "../../../server/db/client";
import { sendEmail } from '../../../utils/send-email';


const VerifyingEmail = () => {
    return (
        <div>VerifyingEmail</div>
    )
}

export default VerifyingEmail


export const getServerSideProps: GetServerSideProps = async (context) => {

    const session = await getSession(context)

    const id = context.params?.userId as string

    if (!session || !id) return {
        redirect: {
            destination: AppRoutes.SIGNIN,
            permanent: false
        }
    }

    const user = await prisma.user.findUnique({
        where: { id },
        select: { emailVerified: true, email: true, createdAt: true }
    });

    if (!user) return {
        redirect: {
            destination: AppRoutes.SIGNIN,
            permanent: false
        }
    }

    if (!user?.emailVerified) {
        await prisma.user.update({
            where: { id },
            data: {
                emailVerified: new Date(),
            }
        });

        const emailVerifyTemplate = {
            email: {
                subject: "Hesabın Artık Aktif!",
                template: {
                    id: 13526,
                    variables: {
                        current_year: new Date().getUTCFullYear(),
                    },
                },
                from: {
                    name: "Affitime",
                    email: "noreply@affitime.com",
                },
                to: [
                    {
                        email: user?.email,
                        name: '',
                    },
                ],
            },
        };

        await sendEmail(emailVerifyTemplate);

        return {
            redirect: {
                destination: `/${session.role.toLowerCase()}/dashboard?trial=true`,
                permanent: false
            }
        }

    }


    return {
        redirect: {
            destination: `/${session.role.toLowerCase()}/dashboard`,
            permanent: false
        }
    }


    return { props: {} }
}