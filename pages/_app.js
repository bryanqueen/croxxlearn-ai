import axios from "axios";
import "@/styles/globals.css";
import { AuthProvider } from "@/auth/AuthContext";
import { useMixpanel } from "@/hooks/useMixpanel";
import { useEffect } from "react";



axios.defaults.withCredentials = true;

export default function App({ Component, pageProps }) {
  const { trackEvent } = useMixpanel();

  useEffect(() => {
    trackEvent('app_initialized')
  },[trackEvent])
  return (
      <AuthProvider>
        <Component {...pageProps} />
        
      </AuthProvider>
  );
}
