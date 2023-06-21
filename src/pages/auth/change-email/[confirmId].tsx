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


const ChangeEmail = () => {
    return (
        <div>Change Email</div>
    )
}

export default ChangeEmail


export const getServerSideProps: GetServerSideProps = async (context) => {

    const session = await getSession(context)

    const confirmId = context.params?.confirmId as string

    if (!session || !confirmId) return {
        redirect: {
            destination: AppRoutes.SIGNIN,
            permanent: false
        }
    }

    const user = await prisma.user.findFirst({
        where: { confirmId },
        select: { id: true, email: true, nextEmail: true, role: true, }
    });

    if (!user) return {
        redirect: {
            destination: AppRoutes.SIGNIN,
            permanent: false
        }
    }

    if (user.nextEmail && user.nextEmail.includes('@')) {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                prevEmail: user.email,
                email: user.nextEmail,
                nextEmail: "",
                confirmId: ""
            }
        });
        return {
            redirect: {
                destination: `/${session.role.toLowerCase()}/dashboard`,
                permanent: false
            }
        }
    }

    /* 
        if (!user?.emailVerified) {
            await prisma.user.update({
                where: { id: confirmId },
                data: {
                    emailVerified: new Date(),
                }
            });
    
            const emailVerifyTemplate = {
                email: {
                    subject: "Hesabın Artık Aktif!",
                    template: {
                        id: user.role === 'PARTNER' ? 13526 : 13530,
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
    
     */
    return {
        redirect: {
            destination: `/${session.role.toLowerCase()}/dashboard`,
            permanent: false
        }
    }


    return { props: {} }
}