// pages/_app.tsx
import { AppProps } from "next/app";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { LanguageProvider } from "../context/LanguageContext"; // Giả sử bạn có context này
import { CartProvider } from "../context/CartContext";
import "../styles/globals.css";

import Header from "../components/header";
import Footer from "../components/Footer";

type MyAppProps = AppProps & {
  pageProps: {
    session?: Session;
  };
};

function MyApp({ Component, pageProps }: MyAppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <CartProvider>
        <LanguageProvider>
          <Header />
          <Component {...pageProps} />
          <Footer />
        </LanguageProvider>
      </CartProvider>
    </SessionProvider>
  );
}

export default MyApp;
