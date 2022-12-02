import { NextPage } from 'next'
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from 'next/router';
import { trpc } from '../utils/trpc';

const Welcome: NextPage = () => {

    const router = useRouter()


    return (
        <div>welcome</div>
    )
}

export default Welcome