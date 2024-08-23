import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/auth/useAuth';
import Header from '@/components/Header';

const Login = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const response = await axios.post('/api/login', { email, password });

      if (response.data.success) {

        // Use the login function from useAuth
        login(response.data.token);
        
        // Redirect to a protected route or homepage
        window.location.href = '/welcome'; // Adjust the redirect as needed
      } else {
        setError(response.data.message || 'Invalid credentials.');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header/>
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6">Login to Croxxlearn AI</h2>
          {error && (
            <div className="mb-4 p-3 bg-red-600 text-white rounded">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-lg shadow-lg">
            <div className="mb-4">
              <label htmlFor="email" className="block mb-2">Email</label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                required 
                className="w-full p-3 border border-gray-700 rounded bg-gray-800 text-white focus:outline-none focus:border-blue-500" 
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block mb-2">Password</label>
              <input 
                id="password" 
                name="password" 
                type="password" 
                required 
                className="w-full p-3 border border-gray-700 rounded bg-gray-800 text-white focus:outline-none focus:border-blue-500" 
              />
            </div>
            <button 
              type="submit" 
              className="w-full p-3 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition duration-300 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </main>
      <footer className="p-4 border-t border-gray-800 text-center text-sm text-gray-500">
        © 2024 Croxxlearn AI. All rights reserved.
      </footer>
    </div>
  );
};

export default Login;
