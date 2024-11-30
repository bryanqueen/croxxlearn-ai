import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Header from '@/components/Header';
import { FaKey } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';

export default function VerifyEmail() {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem('verificationEmail');
    if (!storedEmail) {
      router.push('/register');
    } else {
      setEmail(storedEmail);
    }
  }, [router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/verify-email', { email, otp });
      toast.success(res.data.message);
      
      // Store the token in localStorage as a backup
      if (res.data.token) {
        localStorage.setItem('authToken', res.data.token);
      }
      
      localStorage.removeItem('verificationEmail');
      
      // Add a small delay before redirect to ensure cookie is set
      setTimeout(() => {
        router.push('/welcome');
      }, 100);
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendDisabled(true);
    setCountdown(60); // Disable resend for 60 seconds
    try {
      const res = await axios.post('/api/resend-verify-otp', { email });
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
      setResendDisabled(false);
      setCountdown(0);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* <Header /> */}
      <Toaster position="top-center" reverseOrder={false} />
      <main className="flex-grow flex flex-col items-center justify-center pt-32 p-4">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6">Verify Your Email</h2>
          <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-lg shadow-lg">
            <div className="mb-4">
              <label htmlFor="otp" className="block mb-2">Enter OTP</label>
              <div className="relative">
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="w-full p-3 pl-10 border border-gray-700 rounded bg-gray-800 text-white focus:outline-none focus:border-blue-500"
                />
                <FaKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
            </div>
            <button 
              type="submit" 
              className="w-full p-3 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition duration-300 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={handleResendOTP}
              disabled={resendDisabled}
              className="text-blue-500 hover:underline disabled:text-gray-500 disabled:no-underline"
            >
              {resendDisabled ? `Resend OTP (${countdown}s)` : 'Resend OTP'}
            </button>
          </div>
        </div>
      </main>
      <footer className="p-4 border-t border-gray-800 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Croxxlearn AI. All rights reserved.
      </footer>
    </div>
  );
}