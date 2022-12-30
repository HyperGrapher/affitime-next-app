/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { GetServerSideProps } from "next";
import { type NextPage, /*  NextApiRequest, InferGetServerSidePropsType  */ } from "next";
import { getSession } from "next-auth/react";
import TopBarProgress from "react-topbar-progress-indicator";
import PageCard from "../../../components/card/Card";
import NotificationList from '../../../components/_partner/notifications/NotificationList';
import { UserRoles } from '../../../interface/auth.interface';
import { trpc } from '../../../utils/trpc';
import { HiPlus } from 'react-icons/hi'
import LinkButton from "../../../components/buttons/LinkButton";
import TimeAgo from "timeago-react";
import { formatDateTR } from "../../../utils/helpers";
import { notifyError } from "../../../utils/notifications";
import useNotificationStore from "../../../store/notifications.store";
import { useEffect } from "react";



const Notifications: NextPage = () => {

    const { data: notifs, status: notifStatus, refetch: refetchNotifs } = trpc.notifications.getUnreadNotificationsForPartner.useQuery()
    const setUnread = useNotificationStore(store => store.setUnread)

    useEffect(() => {
        setUnread(notifs?.length ?? 0)

    }, [notifs])


    return (
        <div className="auth-container">

            <PageCard>

                <div className="flex items-center mb-6">

                    <div className="ml-2">
                        <h2 className="font-bold text-xl text-slate-700">Bildirimler</h2>
                        {notifs && notifs?.length > 0 ?
                            (<small>
                                Toplam {notifs?.length} adet bilriminiz var.
                            </small>)
                            :
                            (<small>
                                Okunmamış bildirim bulunmuyor
                            </small>)}
                    </div>

                </div>


                <section className="mb-4">

                    {notifs && notifs?.length > 0
                        ? <NotificationList prod={notifs} refetch={refetchNotifs} />
                        : null}

                </section>


            </PageCard>

        </div>
    )
}

export default Notifications


export const getServerSideProps: GetServerSideProps = async (context) => {

    const session = await getSession(context)

    if (!session) return {
        redirect: {
            destination: '/auth/signin',
            permanent: false
        }
    }

    if (session.role !== UserRoles.PARTNER) return {
        redirect: {
            destination: `/${session.role.toLowerCase()}/dashboard`,
            permanent: false
        }
    }

    return { props: { userId: session.id } }

}
