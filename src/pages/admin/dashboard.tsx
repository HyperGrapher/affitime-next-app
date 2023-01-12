
import type { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { AppRoutes } from "../../config/appRoutes";
import { UserRoles } from "../../interface/auth.interface";

const AdminDashboard = () => {
    return (
        <div className="auth-container">
            <h1 className='text-lg font-bold text-center'>Admin dashboard</h1>
        </div>
    )
}

export default AdminDashboard




export const getServerSideProps: GetServerSideProps = async (context) => {

    const session = await getSession(context)

    if (!session) return {
        redirect: {
            destination: AppRoutes.SIGNIN,
            permanent: false
        }
    }

    if (session.role !== UserRoles.ADMIN) return {
        redirect: {
            destination: `/${session.role.toLowerCase()}/dashboard`,
            permanent: false
        }
    }

    return { props: {} }

}
