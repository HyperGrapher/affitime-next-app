/* eslint-disable react-hooks/exhaustive-deps */
import type { GetServerSideProps } from "next";
import { type NextPage } from "next";
import { getSession } from "next-auth/react";
import { useEffect } from "react";
import TopBarProgress from "react-topbar-progress-indicator";
import NotificationList from '../../../components/_vendor/notifications/NotificationList';
import PageCard from "../../../components/card/Card";
import { AppRoutes } from "../../../config/appRoutes";
import { UserRoles } from '../../../interface/auth.interface';
import useNotificationStore from "../../../store/notifications.store";
import { trpc } from '../../../utils/trpc';



const Notifications: NextPage = () => {

    const { data: notifs, status: sts, refetch: refetchNotifs } = trpc.notifications.getUnreadNotificationsForVendor.useQuery()

    const setUnread = useNotificationStore(store => store.setUnread)

    useEffect(() => {
        setUnread(notifs?.length ?? 0)
    }, [notifs])

    return (
        <div className="auth-container">
            {(sts === 'loading') && <TopBarProgress />}

            <PageCard>

                <div className="flex items-center mb-6">

                    <div className="ml-2">
                        <h2 className="font-bold text-xl text-slate-700">Bildirimler</h2>
                        {notifs && notifs?.length > 0 ? (
                            <small>
                                Toplam {notifs?.length} adet bilriminiz var.
                                <br />
                                Olusturulan affiliate linklerini onaylayın yada iptal edin.
                            </small>
                        ) : <small>
                            Bildiriminiz bulunmuyor
                        </small>}
                    </div>

                </div>


                <section className="mb-4">

                    {notifs && notifs?.length > 0
                        ? <NotificationList links={notifs} refetch={refetchNotifs} />
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

    return { props: { userId: session.id } }

}
