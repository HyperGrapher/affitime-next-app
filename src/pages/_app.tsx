import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { trpc } from "../utils/trpc";

import "../styles/globals.css";
import Navbar from "../components/shared/Navbar";
import Navigation from "../components/shared/Navigation";
import TopBarProgress from "react-topbar-progress-indicator";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {

  TopBarProgress.config({
    barColors: {
      "0": "#fc6363",
      "1.0": "#0084ff"
    },
    shadowBlur: 5
  });

  return (
    <SessionProvider session={session}>
      <Navigation>
        <div className="bg-slate-100 h-screen w-full content-wrap">
          <Component {...pageProps} />

        </div>

        </Navigation>
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
