/* eslint-disable react-hooks/exhaustive-deps */
import Head from "next/head";
import Image from "next/image";
import { useRouter } from 'next/router';
import { useEffect } from "react";
import Loaderx from '../../assets/gif/loader.gif';
import { AppRoutes } from '../../config/appRoutes';

const Success = () => {
  const { replace } = useRouter()

  useEffect(() => {

    setTimeout(() => {
      replace(AppRoutes.VENDOR_DASHBOARD)

    }, 2500);

  }, [])

  return (
    <div className='container bg-redx-100 mx-auto min-h-full'>

      <Head>
        <title>Affitime | Bilgilendirme</title>
      </Head>
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl md:text-3xl text-green-500 font-bold text-center">Tebrikler, Ödeme Başarılı</h1>
        <p className="text-base md:text-lg text-center">
          Dashboard&apos;a yönlendiriliyorsunuz.
        </p>
        <Image className="mt-16" width={60} height={60} src={Loaderx} alt="adada" />
      </div>

    </div>
  )
}

export default Success