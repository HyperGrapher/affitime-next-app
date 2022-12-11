/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { trpc } from '../utils/trpc';
import Link from 'next/link';
import type { GetServerSideProps } from "next";
import { type NextPage, NextApiRequest, InferGetServerSidePropsType } from "next";
import { getSession, signIn, signOut, useSession } from "next-auth/react";
import TopBarProgress from "react-topbar-progress-indicator";
import { Container } from '@mui/material';



const Welcome: NextPage = () => {

  const { data, status: sessionStatus } = useSession()
  // const {data: userData} = trpc.auth.getSessionUser.useQuery()

  const logUserOut = () => {
    signOut({ redirect: true, callbackUrl: "/" })
  }


  return (
    <Container maxWidth="sm">
      {(sessionStatus === 'loading') && <TopBarProgress />}

      <main className='mx-auto ml-8'>
        <h2 className='text-4xl'>welcome</h2>

        <pre>{JSON.stringify(data, null, 4)}</pre>
        <pre>{JSON.stringify(sessionStatus, null, 4)}</pre>

        <div className="flex flex-col items-center gap-2">

          <button className="bg-red-500 py-4 px-12 text-slate-50" onClick={logUserOut}>Signout</button>
          <Link className="bg-green-500 py-4 px-12 text-slate-50" href={'/'}>Home</Link>
        </div>

      </main>
    </Container>
  )
}

export default Welcome

export const getServerSideProps: GetServerSideProps = async (context) => {

  const session = await getSession(context)

  if (!session) return {
    redirect: {
      destination: '/auth/signin',
      permanent: false
    }
  }

  return { props: { session } }

}