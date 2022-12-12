/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { GetServerSideProps } from "next";
import { type NextPage } from "next";
import { getSession, signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { UserRoles } from '../interface/auth.interface';
import { prisma } from "../server/db/client";
import { trpc } from "../utils/trpc";
import Container from "@mui/material/Container";
// import { Product, User, Vendor } from '@prisma/client';

const Home: NextPage = () => {

  const { data: secretMsg, isLoading: isLoadingSecret, } = trpc.auth.getSecretMessage.useQuery()
  const { data: sessionData, status: sessionStatus } = useSession();

  const logUserOut = () => {
    signOut({ redirect: true, callbackUrl: '/' })
  }

  // return <h1 className="text-center text-4xl pt-8">Affitime Server</h1>

  return (
    <Container maxWidth={'md'}>
      <Head>
        <title>Affitime Anasayfa</title>
        <meta name="description" content="Affiliate uygulamasi" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen  bg-slate-200">
        <div className="h-full mx-auto ">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-700 sm:text-[2rem]">
            {(sessionStatus === 'loading') ? "Loading.." : secretMsg} adad
          </h1>

          <div className="flex flex-col items-center gap-2 bg-purple-300">
            {/* <AuthShowcase /> */}
            <Link className="bg-green-500 py-2 text-sm px-6 text-slate-50" href={'/dashboard'}>dashboard</Link>
            <Link className="bg-indigo-500 py-2 text-sm px-6 text-slate-50" href={'/products'}>Products</Link>
            <Link className="bg-blue-500 py-2 text-sm px-6 text-slate-50" href={'/welcome'}>Welcome</Link>
            {sessionData ? <button className="bg-red-500 py-2 text-sm px-6 text-slate-50" onClick={logUserOut}>Signout</button> : <Link className="bg-orange-500 py-4 px-12 text-slate-50" href={'/auth/signin'}>Custom Login</Link>}

          </div>


          <div className='mt-6 text-white'>

          </div>
        </div>
      </main>
    </Container>
  );
};


export const getServerSideProps: GetServerSideProps = async (context) => {

  const session = await getSession(context)
  const query = context.query.id

  // ? DON'T Use api calls on getServerSideProps
  // const res = await fetch('http://localhost:3000/api/examples', {
  //     headers: {
  //       cookie: context.req.headers.cookie || "",
  //     },
  //   })
  // const veri = await res.json() ?? null

  if (!session) return {
    redirect: {
      destination: '/auth/signin',
      permanent: false
    }
  }

  if (session.role !== UserRoles.VENDOR) return {
    redirect: {
      destination: '/dashboard',
      permanent: false
    }
  }

  const data = await prisma.user.findMany({
    select: {
      id: true,
      role: true,
      email: true,
      image: true,
      password: false,
      pro: true,
      trial: true,
      active: true,
      emailVerified: true,
      vendor: true,
      partner: true,
    }
  });

  prisma.$disconnect()


  if (!data) return {
    redirect: {
      destination: '/dashboard',
      permanent: false
    }
  }

  return { props: { veri: JSON.parse(JSON.stringify(data)) } }

}

export default Home;

const AuthShowcase: React.FC = () => {
  const { data: sessionData, status: sessionStatus } = useSession();

  const { data: secretMessage } = trpc.auth.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined },
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        {secretMessage && <span> - {secretMessage}</span>}



        {sessionStatus === 'authenticated' ? <div className='mt-6 text-slate-700'>
          <pre>{JSON.stringify(sessionData, null, 4)}</pre>
          <br />
          <br />
          {JSON.stringify(sessionStatus, null, 4)}

        </div> : null}



      </p>
      <button
        className="rounded-full bg-white/10 hover:bg-white/20 px-10 py-3 font-semibold text-white no-underline transition"
        onClick={sessionData ? () => signOut() : () => signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};
