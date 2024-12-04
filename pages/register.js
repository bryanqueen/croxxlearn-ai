import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { IoMdEye, IoMdEyeOff } from 'react-icons/io';
import { FcGoogle } from 'react-icons/fc';
import Header from '@/components/Header';
import { useAuth } from '@/auth/useAuth';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useMixpanel } from '../hooks/useMixpanel';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();
  const { continueWithGoogle } = useAuth();
  const { trackEvent, setUserProfile } = useMixpanel();

  useEffect(() => {
    if (router.query.referralCode) {
      setReferralCode(router.query.referralCode);
    }
  }, [router.query.referralCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/register', { name, email, password, referralCode });
      if (response.data.success) {
        console.log("userData:", response.data)
        trackEvent('sign_up', { 
          method: 'email', 
          has_referral: !!referralCode,
          user_id: response.data.userId // Assuming the API returns a userId
        });
        setUserProfile(response.data.userId, {
          $name: response.data.name,
          $email: response.data.email,
          method: 'email',
        })
        toast.success('Registration successful. Please check your email for OTP.');
        localStorage.setItem('verificationEmail', email);
        router.push('/verify-email');
      } else {
        toast.error(response.data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred during registration. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const success = await continueWithGoogle();
      if (success) {
        trackEvent('sign_up', { 
          method: 'google',
          // has_referral: !!referralCode
        });

        router.push('/welcome');
      } else {
        toast.error('Google sign-up failed. Please try again.');
      }
    } catch (error) {
      console.error('Google authentication failed', error);
      toast.error('An error occurred during Google sign-up. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Toaster position="top-center" reverseOrder={false} />
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6">Join Croxxlearn AI</h1>
          <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-lg shadow-lg">
            <div className="mb-4">
              <label htmlFor="name" className="block mb-2">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-gray-700 rounded bg-gray-800 text-white"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block mb-2">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-700 rounded bg-gray-800 text-white"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block mb-2">Password</label>
              <div className="relative">
                <input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-gray-700 rounded bg-gray-800 text-white focus:outline-none focus:border-blue-500"
                  required 
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <IoMdEye className="w-5 h-5 text-gray-400" />
                  ) : (
                    <IoMdEyeOff className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            <input 
              type="hidden" 
              name="referralCode" 
              value={referralCode} 
            />
            <button 
              type="submit" 
              className="w-full p-3 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition duration-300 disabled:opacity-50 mb-4"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          <div className="mt-4">
            <button 
              onClick={handleGoogleAuth}
              className="w-full p-3 bg-white text-gray-800 rounded font-bold hover:bg-gray-100 transition duration-300 flex items-center justify-center"
            >
              <FcGoogle className="mr-2" size={24} />
              Continue with Google
            </button>
          </div>
          <p className="mt-4 text-center">
            Already have an account? <Link href="/login" className="text-blue-500 hover:underline">Log In</Link>
          </p>
        </div>
      </main>
      <footer className="p-4 border-t border-gray-800 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Croxxlearn AI. All rights reserved.
      </footer>
    </div>
  );
};

export default Register;