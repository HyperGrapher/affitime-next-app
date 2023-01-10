/* eslint-disable react-hooks/exhaustive-deps */
import type { GetServerSideProps } from "next";
import { type NextPage } from "next";
import { getSession } from "next-auth/react";
import TopBarProgress from "react-topbar-progress-indicator";
import { useEffect } from "react";
import NotificationList from '../../../components/_partner/notifications/NotificationList';
import PageCard from "../../../components/card/Card";
import { UserRoles } from '../../../interface/auth.interface';
import useNotificationStore from "../../../store/notifications.store";
import { trpc } from '../../../utils/trpc';
import { AppRoutes } from "../../../config/appRoutes";



const Notifications: NextPage = () => {

    const { data: notifs, status: sts, refetch: refetchNotifs } = trpc.notifications.getUnreadNotificationsForPartner.useQuery()
    const setUnread = useNotificationStore(store => store.setUnread)

    useEffect(() => {
        setUnread(notifs?.length ?? 0)

    }, [notifs])


    return (
        <div className="auth-container">
            {sts === "loading" && <TopBarProgress />}
            <PageCard>

                <div className="flex items-center mb-6">

                    <div className="ml-2">
                        <h2 className="font-bold text-xl text-slate-700">Bildirimler</h2>
                        {notifs && notifs?.length > 0
                            ?
                            (<small>Toplam {notifs?.length} adet bilriminiz var.</small>)
                            :
                            (<small>Bildiriminiz bulunmuyor </small>)
                        }
                    </div>

                </div>


                <section className="mb-4">

                    {notifs && notifs?.length > 0
                        ? <NotificationList prod={notifs} refetch={refetchNotifs} />
                        : null
                    }

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
            destination: AppRoutes.SIGNIN,
            permanent: false
        }
    }

    if (session.role !== UserRoles.PARTNER) return {
        redirect: {
            destination: `/${session.role.toLowerCase()}/dashboard`,
            permanent: false
        }
    }

    return { props: {} }

}
