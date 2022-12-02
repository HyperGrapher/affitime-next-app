/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { NextPage } from 'next'
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from 'next/router';
import { trpc } from '../utils/trpc';
import { deleteCookie, getCookie } from 'cookies-next';
import Link from 'next/link';
import { env } from '../env/client.mjs';



const Welcome: NextPage = () => {

    const router = useRouter()
    const {data, status} = useSession()

    const userCookie = getCookie('user');


    const logUserOut = () => {
        deleteCookie('user');
        signOut({redirect: true, callbackUrl: "/" })
      }
    
      


    if(status === 'loading') return <div>Loading</div>
    if(status === 'unauthenticated') return <div>unauthenticated</div>



    return (
        <div>
            <h2 className='text-4xl'>welcome</h2> 

            <pre>{JSON.stringify(data, null, 4)}</pre>
            <pre>{JSON.stringify(status, null, 4)}</pre>

            <div className="flex flex-col items-center gap-2">



            <button className="bg-red-500 py-4 px-12 text-slate-50" onClick={logUserOut}>Signout</button>
            <Link className="bg-green-500 py-4 px-12 text-slate-50" href={'/'}>Home</Link>
          </div>


          <div>
          <pre>{JSON.stringify(userCookie, null, 4)}</pre>
          </div>


        </div>
    )
}

export default Welcome