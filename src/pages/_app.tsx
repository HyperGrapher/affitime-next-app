/* eslint-disable @typescript-eslint/no-unused-vars */
import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { trpc } from "../utils/trpc";

import "../styles/globals.css";
import Sidenav from "../components/shared/Sidenav";
import MiniDrawer from "../components/shared/MiniDrawer";
import TopBarProgress from "react-topbar-progress-indicator";
import { ThemeProvider, createTheme } from "@mui/material/styles";

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

  const theme = createTheme({
    palette: {
      primary: {
        light: '#be75e8',
        main: '#6667AB', // The hex code for Very Peri #6667AB
        dark: '#4f0084',
        contrastText: '#fff',
      },
      secondary: {
        light: '#ff7961',
        main: '#f44336',
        dark: '#ba000d',
        contrastText: '#000',
      },
      // Paper propschages DrawerMenu backgroud
      background: { 
        paper: '#fff',
        default: "#fff"
      }
    },
  });


  return (
    <SessionProvider session={session}>
      <ThemeProvider theme={theme}>
        <MiniDrawer />
        <div className="bg-slate-100 min-h-screen pt-16">
          <Component {...pageProps} />
        </div>
      </ThemeProvider>
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
