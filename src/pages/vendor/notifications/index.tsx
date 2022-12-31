/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { GetServerSideProps } from "next";
import { type NextPage, /*  NextApiRequest, InferGetServerSidePropsType  */ } from "next";
import { getSession } from "next-auth/react";
import TopBarProgress from "react-topbar-progress-indicator";
import PageCard from "../../../components/card/Card";
import NotificationList from '../../../components/_vendor/notifications/NotificationList';
import { UserRoles } from '../../../interface/auth.interface';
import { trpc } from '../../../utils/trpc';
import { HiPlus } from 'react-icons/hi'
import LinkButton from "../../../components/buttons/LinkButton";
import TimeAgo from "timeago-react";
import { formatDateTR } from "../../../utils/helpers";
import { notifyError } from "../../../utils/notifications";
import { useEffect } from "react";
import useNotificationStore from "../../../store/notifications.store";



const Notifications: NextPage = () => {

    const { data: notifs, refetch: refetchNotifs } = trpc.notifications.getUnreadNotificationsForVendor.useQuery()

    const setUnread = useNotificationStore(store => store.setUnread)

    useEffect(() => {
        setUnread(notifs?.length ?? 0)
    }, [notifs])

    const update = trpc.notifications.updateLinkNotificationByVendor.useMutation()

    function onConfirmOrDenyClick(id: string, confirmed: boolean): void {
        update.mutate({ id, confirmed }, {

            onSuccess(data, variables, context) {
                console.log(data);
            },
            onError(error, variables, context) {
                console.log(error);
                notifyError("Bir hata olustu")

            },
            onSettled: () => {
                console.log('settled');
                refetchNotifs()

            }
        })
    }

    return (
        <div className="auth-container">

            <div className="hidden mt-6 ">
                {notifs?.map(it => <div key={it.id} className="py-2 px-2 my-1 border flex space-x-4">


                    <div className="w-[30ch]">
                        <p>{it.product.title?.slice(0, 30)}..</p>

                    </div>

                    <div className="w-[30ch]">
                        <p>{it.product.id?.slice(0, 100)}</p>

                    </div>

                    <div className="w-[15ch]">

                        <TimeAgo
                            className="whitespace-nowrap"
                            title={formatDateTR(it.createdAt)}
                            datetime={it.createdAt as Date}
                            locale={'tr'}
                        />

                    </div>

                    <div className="w-[15ch] name font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-500">

                        {it.partner.username}
                    </div>

                    <button
                        onClick={() => onConfirmOrDenyClick(it.id, true)}
                        className="w-[10ch] text-sm rounded-md bg-gradient-to-r from-teal-500 to-blue-500 text-white px-2 py-1">Onayla</button>

                    <button
                        onClick={() => onConfirmOrDenyClick(it.id, false)}
                        className="w-[10ch] text-sm rounded-md bg-gradient-to-r from-red-500 to-red-700 text-white px-2 py-1">Reddet</button>

                </div>)}
            </div>


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

                    {/* <div>
                        {links?.map(ln => <div className="mb-4 border-2 px-2 py-4" key={ln.id}>
                            {ln?.id} - <small>{JSON.stringify(ln)}</small>

                        </div>)}
                    </div> */}

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

    if (session.role !== UserRoles.VENDOR) return {
        redirect: {
            destination: `/${session.role.toLowerCase()}/dashboard`,
            permanent: false
        }
    }

    return { props: { userId: session.id } }

}
