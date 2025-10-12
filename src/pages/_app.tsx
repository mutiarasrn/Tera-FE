import "@/styles/globals.css";
import "@meshsdk/react/styles.css";
import type { AppProps } from "next/app";
import { MeshProvider } from "@meshsdk/react";
import { WalletProvider } from "@/contexts/WalletContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MeshProvider>
      <WalletProvider>
        <Component {...pageProps} />
      </WalletProvider>
    </MeshProvider>
  );
}
