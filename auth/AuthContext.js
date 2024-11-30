import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { initializeApp } from "firebase/app";
// import { getAnalytics }  from 'firebase/analytics'
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

axios.defaults.withCredentials = true;

// Initialize Firebase (replace with your config)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/api/check-auth');
      setIsAuthenticated(response.data.isAuthenticated);
      if (response.data.isAuthenticated) {
        setUser(response.data.user);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/login', { email, password });
      if (response.data.success) {
        setIsAuthenticated(true);
        setUser(response.data.user);
        document.cookie = `authToken=${response.data.token}; path=/; max-age=3600; SameSite=Lax`;
        return true;
      }
    } catch (error) {
      console.error('Login error:', error);
    }
    return false;
  };

  const register = async (name, email, password, referralCode) => {
    try {
      const response = await axios.post('/api/register', { name, email, password, referralCode });
      if (response.data.success) {
        setIsAuthenticated(true);
        setUser(response.data.user);
        document.cookie = `authToken=${response.data.token}; path=/; max-age=3600; SameSite=Lax`;
        return true;
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
    return false;
  };

  const continueWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const response = await axios.post('/api/auth/google', {
        name: user.displayName,
        email: user.email,
        googleId: user.uid,
      });
      if (response.data.success) {
        setIsAuthenticated(true);
        setUser(response.data.user);
        // Store the token in a cookie
        document.cookie = `authToken=${response.data.token}; path=/; max-age=3600; SameSite=Lax`;
        return true;
      }
    } catch (error) {
      console.error('Google authentication error:', error);
    }
    return false;
  };

  const logout = async () => {
    try {
      await axios.post('/api/logout');
      await signOut(auth);
      setIsAuthenticated(false);
      setUser(null);
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, continueWithGoogle, logout, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};