import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/auth/useAuth';
import Link from 'next/link';
import Header from '@/components/Header';
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { FcGoogle } from 'react-icons/fc';
import toast, { Toaster } from 'react-hot-toast';

const Login = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login,googleSignIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const success = await login(email, password);
      if (success) {
        // Add the delay here
        setTimeout(() => {
          router.push('/welcome');
        }, 100); // 100ms delay
        
      } else {
        setError('Invalid credentials.');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleSignIn = async () => {
    try {
      const success = await googleSignIn();
      if (success) {
        router.push('/welcome');
      } else {
        toast.error('Google sign-in failed. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred during Google sign-in. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* <Header/> */}
      <Toaster position="top-center" reverseOrder={false} />
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6">Welcome Back</h2>
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
              <div className="relative">
                <input 
                  id="password" 
                  name="password" 
                  type={showPassword ? "text" : "password"}
                  required 
                  className="w-full p-3 border border-gray-700 rounded bg-gray-800 text-white focus:outline-none focus:border-blue-500" 
                />
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <IoMdEye className='w-5 h-5 text-gray-800'/>
                  ) : (
                    <IoMdEyeOff className='w-5 h-5 text-gray-800'/>
                  )}
                </div>
              </div>
            </div>
            <div className='mb-4'>
            <Link href="/forgot-password" className="text-blue-500 hover:underline">forgot password?</Link>    
            </div>
            <button 
              type="submit" 
              className="w-full p-3 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition duration-300 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <div className="mt-4">
            <button 
              onClick={handleGoogleSignIn}
              className="w-full p-3 bg-white text-gray-800 rounded font-bold hover:bg-gray-100 transition duration-300 flex items-center justify-center"
            >
              <FcGoogle className="mr-2" size={24} />
              continue with Google
            </button>
          </div>
          <p className="mt-4 text-center">
            Don&apos;t have an account? <Link href="/register" className="text-blue-500 hover:underline">Create one</Link>
          </p>
        </div>
      </main>
      <footer className="p-4 border-t border-gray-800 text-center text-sm text-gray-500">
        © 2024 Croxxlearn AI. All rights reserved.
      </footer>
    </div>
  );
};

export default Login;
