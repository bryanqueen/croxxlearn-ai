import axios from "axios";
import "@/styles/globals.css";
import { AuthProvider } from "@/auth/AuthContext";
import Header from "@/components/Header";


axios.defaults.withCredentials = true;

export default function App({ Component, pageProps }) {
  return (
      <AuthProvider>
        <Component {...pageProps} />
        
      </AuthProvider>
  );
}
