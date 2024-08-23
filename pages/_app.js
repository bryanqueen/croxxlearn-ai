import "@/styles/globals.css";
import { AuthProvider } from "@/auth/AuthContext";

export default function App({ Component, pageProps }) {
  return (
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
  );
}
