/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import Link from 'next/link';
import type { GetServerSideProps } from "next";
import { type NextPage } from "next";
import { getSession, signOut, } from "next-auth/react";

// ? TEST EXIST
const Welcome: NextPage = () => {


  const logUserOut = () => {
    signOut({ redirect: true, callbackUrl: "/" })
  }

  return (
    <main className='auth-container'>

      <h1 className='text-4xl'>Test Page</h1>

      <div className="flex flex-col items-center gap-2">

        <button className="bg-red-500 py-4 px-12 text-slate-50" onClick={logUserOut}>Signout</button>
        <Link className="bg-green-500 py-4 px-12 text-slate-50" href={'/'}>Home Link</Link>
      </div>

    </main>
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