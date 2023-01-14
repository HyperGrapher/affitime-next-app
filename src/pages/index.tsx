// import Container from "@mui/material/Container";
import type { GetServerSideProps } from "next";
import { type NextPage } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";

const Home: NextPage = () => {



  return <div className="absolute bg-white inset-0 z-50">
    <Head>
      <title>Affitime</title>
      <meta name="description" content="Affiliate uygulamasi" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <h1 className="text-center text-4xl mt-16">Affitime Server</h1>
  </div>

  // return (
  //   <Container maxWidth={'xl'}>
  //     <Head>
  //       <title>Affitime Anasayfa</title>
  //       <meta name="description" content="Affiliate uygulamasi" />
  //       <link rel="icon" href="/favicon.ico" />
  //     </Head>

  //   </Container>
  // );
};



export default Home;

export const getServerSideProps: GetServerSideProps = async (context) => {

  const session = await getSession(context)

  if (session) return {
    redirect: {
      destination: `/${session.role.toLowerCase()}/dashboard`,
      permanent: false
    }
  }


  return { props: {} }

}