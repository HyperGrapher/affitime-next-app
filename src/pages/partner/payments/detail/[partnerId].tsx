import type { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import TopBarProgress from 'react-topbar-progress-indicator';
import { AppRoutes } from '../../../../config/appRoutes';
import { UserRoles } from '../../../../interface/auth.interface';
import { trpc } from '../../../../utils/trpc';

// ! CANCELED FOR LATER
const PaymentDetail = ({ partnerId }: { partnerId: string }) => {


    const { data: x, status: sts } = trpc.payments.getLinkAndVisitDetailsOfPartner.useQuery({ partnerId }, {})

    return (
        <div className="auth-container">
            {sts === "loading" && <TopBarProgress />}
            <main className="mx-auto container min-h-screen px-2 pt-6">

                <div className="mb-2">
                    <h1 className="text-slate-600 font-bold text-2xl">
                        Ödeme Detayi
                    </h1>
                    <small className="text-slate-400 text-sm">
                        Ödeme detaylarınızı bu sayfada görüntüleyebilirsiiniz.
                    </small>
                </div>
                <pre>
                    {JSON.stringify(x, null, 4)}
                </pre>


            </main>
        </div>
    )
}

export default PaymentDetail


export const getServerSideProps: GetServerSideProps = async (context) => {

    const session = await getSession(context)
    const partnerId = context.params?.partnerId as string

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


    return { props: { partnerId } }

}
