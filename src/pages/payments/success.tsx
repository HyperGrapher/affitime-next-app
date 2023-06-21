/* eslint-disable react-hooks/exhaustive-deps */
import Head from "next/head";
import Image from "next/image";
import { useRouter } from 'next/router';
import { useEffect } from "react";
import Loader from '../../assets/gif/loader.gif';
import { AppRoutes } from '../../config/appRoutes';
import type { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "../../server/db/client";
import { sendEmail } from '../../utils/send-email';

export const getServerSideProps: GetServerSideProps = async (context) => {

  const session = await getSession(context)

  if (!session) return {
    redirect: {
      destination: AppRoutes.SIGNIN,
      permanent: false
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { vendor_username: true, email: true }
  });

  if (!user) {
    return {
      redirect: {
        destination: AppRoutes.SIGNIN,
        permanent: false
      }
    }

  }

  const template = {
    email: {
      subject: "Üyelik Ödemesi Başarılı!",
      template: {
        id: 13533,
        variables: {
          brand_name: user.vendor_username,
          current_year: new Date().getUTCFullYear(),
        },
      },
      from: {
        name: "Affitime",
        email: "noreply@affitime.com",
      },
      to: [
        {
          email: user?.email,
          name: user.vendor_username,
        },
      ],
    },
  };

  await sendEmail(template);


  return { props: {} }

}

const Success = () => {
  const { replace } = useRouter()

  useEffect(() => {

    setTimeout(() => { replace(AppRoutes.VENDOR_DASHBOARD) }, 3000);

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
        <Image className="mt-16" width={60} height={60} src={Loader} alt="adada" />
      </div>

    </div>
  )
}

export default Success