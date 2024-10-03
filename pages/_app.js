import axios from "axios";
import "@/styles/globals.css";
import { AuthProvider } from "@/auth/AuthContext";



axios.defaults.withCredentials = true;

export default function App({ Component, pageProps }) {
  return (
      <AuthProvider>
        <Component {...pageProps} />
        
      </AuthProvider>
  );
}
