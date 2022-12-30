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



const Notifications: NextPage = () => {

    const { data: links, status: notifStatus, refetch: refetchNotifs } = trpc.notifications.getUnreadNotificationsForVendor.useQuery()
    const update = trpc.notifications.updateLinkNotification.useMutation()

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
                {links?.map(it => <div key={it.id} className="py-2 px-2 my-1 border flex space-x-4">


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
                        {links && links?.length > 0 ? (
                            <small>
                                Toplam {links?.length} adet bilriminiz var.
                                <br />
                                Olusturulan affiliate linklerini onaylayin yada geri cevirin
                            </small>
                        ) : null}
                    </div>

                </div>


                <section className="mb-4">

                    {/* <div>
                        {links?.map(ln => <div className="mb-4 border-2 px-2 py-4" key={ln.id}>
                            {ln?.id} - <small>{JSON.stringify(ln)}</small>

                        </div>)}
                    </div> */}

                    {links && links?.length > 0
                        ? <NotificationList prod={links} refetch={refetchNotifs} />
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


const exmpJson = {
    "id": "clc1r4klu0000cq8o66x3e6w6",
    "product_id": "clbny7s6q0005cq9sj41r6om1",
    "partner_id": "clbxd7zv00007cqa8y1poev3a",
    "partner_user_id": "clbxd7zup0005cqa8os275dsl",
    "vendor_id": "clbjqz7kk0003cqns571g7ggc",
    "vendor_user_id": "clbjqz7k40000cqnsntrpxsft",
    "platform": null,
    "count": 0,
    "declined": 0,
    "repeated": 0,
    "active": true,
    "partnerConfirmed": true,
    "notified": false,
    "createdAt": "2022-12-24T09:41:03.186Z",
    "updatedAt": "2022-12-24T09:41:03.186Z",
    "product": {
        "id": "clbny7s6q0005cq9sj41r6om1",
        "title": "1974 Fender Stratocaster, Sunburst",
        "desc": "Wonderful 1974 Fender Stratocaster in three-tone Sunburst, with Rosewood fingerboard, large headstock, bullet trussrod, staggered pole pickups all in excellent condition complete with bridge cover and tremolo arm at a good price thanks to a replacement neck pickup.",
        "fullDesc": null,
        "price": 80800,
        "cookieLife": 60,
        "perClick": 4,
        "perClickType": "CASH",
        "perSale": 8,
        "perSaleType": "PERC",
        "vendor_profile_id": "clbjqz7kk0003cqns571g7ggc",
        "vendor_user_id": "clbjqz7k40000cqnsntrpxsft",
        "product_url": "https://www.vintageandrareguitars.com/products/1974-fender-stratocaster-sunburst",
        "image": "https://guitarpoint.de/app/uploads/products/1974-fender-stratocaster-3t-sunburst-mapleneck-3/Fender74Strat3tSBMN574421_18.jpg",
        "published": true,
        "active": true,
        "extra_info": null,
        "createdAt": "2022-12-14T17:50:43.826Z",
        "updatedAt": "2022-12-14T17:50:43.826Z"
    },
    "partner": {
        "username": "panter"
    }
}