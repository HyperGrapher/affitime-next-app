/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { trpc } from "../utils/trpc";
import Container from "@mui/material/Container";

const Home: NextPage = () => {



  return <h1 className="text-center text-4xl mt-16">Affitime Server</h1>

  return (
    <Container maxWidth={'xl'}>
      <Head>
        <title>Affitime Anasayfa</title>
        <meta name="description" content="Affiliate uygulamasi" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
     
    </Container>
  );
};



export default Home;

