import type { GetServerSideProps } from 'next/types'
import Head from "next/head";

const Fail = () => {
  return (
    <div className='container bg-redx-100 mx-auto'>

      <Head>
        <title>Affitime | Bilgilendirme</title>
      </Head>

      <div className="mt-16 bg-yellow-50 py-8">
        <h1 className="text-3xl text-green-500 font-bold text-center">Tebrikler, Ödeme Başarılı</h1>
      </div>

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

  const {
		req,
    // res
	} = context;

  req.method = 'get'

  return {
      redirect: {
          destination: `/payments/failing`,
          permanent: false,

      }
  }


}