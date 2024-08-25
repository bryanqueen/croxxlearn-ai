import { createContext, useState, useEffect } from 'react';
import axios from 'axios';


axios.defaults.withCredentials = true;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status on mount
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Make a request to an endpoint that checks if the user is authenticated
      const response = await axios.get('/api/check-auth');
      setIsAuthenticated(response.data.isAuthenticated);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/login', { email, password });
      console.log('Login response:', response)
      if (response.data.success) {
        setIsAuthenticated(true);
        //store the token
        document.cookie = `authToken=${response.data.token}; path=/; max-age=3600; SameSite=Lax`;
        return true;
      }
    } catch (error) {
      console.error('Login error:', error);
    }
    return false;
  };

  const logout = async () => {
    try {
      await axios.post('/api/logout');
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};