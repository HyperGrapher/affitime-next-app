import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { trpc } from "../utils/trpc";

import "../styles/globals.css";
import Navbar from "../components/shared/Navbar";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Navbar />
      <div className="bg-slate-100 h-screen">
        <Component {...pageProps} />

      </div>
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
