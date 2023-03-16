import { getSession } from 'next-auth/react'
import { GetServerSideProps } from 'next/types'
import React from 'react'
import { AppRoutes } from '../../config/appRoutes'
import { UserRoles } from '../../interface/auth.interface'

const Fail = () => {
  return (
    <div className='auth-container'>

      <h1 className="text-2xl text-center font-bold text-red-600">
        Odeme Hatali
      </h1>
    </div>
  )
}

export default Fail


export const getServerSideProps: GetServerSideProps = async (context) => {

  // const session = await getSession(context)

  // if (!session) return {
  //     redirect: {
  //         destination: AppRoutes.SIGNIN,
  //         permanent: false
  //     }
  // }

  // if (session.role !== UserRoles.VENDOR) return {
  //     redirect: {
  //         destination: `/${session.role.toLowerCase()}/dashboard`,
  //         permanent: false
  //     }
  // }


  return {
      redirect: {
          destination: `/payments/failing`,
          permanent: false
      }
  }


}