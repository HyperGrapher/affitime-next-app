import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { Toaster } from 'react-hot-toast';
import TopBarProgress from "react-topbar-progress-indicator";
import * as timeago from 'timeago.js';
import tr from 'timeago.js/lib/lang/tr';
import Navbar from "../components/shared/Navbar";
import Sidenav from "../components/shared/Sidenav";
import "../styles/globals.css";
import { trpc } from "../utils/trpc";
import NonAuthNavbar from "../components/shared/NonAuthNavbar";

timeago.register('tr', tr);

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {

  TopBarProgress.config({
    barColors: {
      "0": "#d163fc",
      "1.0": "#d863fc"
    },
    shadowBlur: 5
  });


  // The hex code for Very Peri #6667AB
  return (
    <SessionProvider session={session}>
      <Sidenav />
      <NonAuthNavbar />
      <Navbar />
      {/* Session cannot be retrived here */}
      <div className={"min-h-screen debug-screens"}>
        <Component {...pageProps} />
        <Toaster containerStyle={{
          top: 60,
          left: 20,
          bottom: 20,
          right: 20,
        }} />
      </div>
    </SessionProvider >
  );
};

export default trpc.withTRPC(MyApp);
