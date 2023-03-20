/* eslint-disable react-hooks/exhaustive-deps */
import Head from "next/head";
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AppRoutes } from '../../config/appRoutes';
import { useEffect } from "react";


const Success = () => {
  const { replace } = useRouter()

  useEffect(() => {

    setTimeout(() => {
      replace(AppRoutes.VENDOR_DASHBOARD)

    }, 1500);

  }, [])

  return (
    <div className='container bg-redx-100 mx-auto'>

      <Head>
        <title>Affitime | Bilgilendirme</title>
      </Head>

      <div className="mt-16 bg-yellow-50 py-8">
        <h1 className="text-3xl text-green-500 font-bold text-center">Tebrikler, Ödeme Başarılı</h1>
        <p className="text-lg text-center">
          <p>
            Dashboard&apos;a yönlendiriliyorsunuz.
          </p>
        </p>
      </div>

    </div>
  )
}

export default Success