import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Header from '@/components/Header';
import Link from 'next/link';
import { FaEnvelope } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/forgot-password', { email });
      toast.success(res.data.message);
      router.push('/reset-password');
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header />
      <Toaster position="top-center" reverseOrder={false} />
      <main className="flex-grow flex flex-col items-center justify-center pt-32 p-4">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6">Forgot Password</h2>
          <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-lg shadow-lg">
            <div className="mb-4">
              <label htmlFor="email" className="block mb-2">Email</label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-3 pl-10 border border-gray-700 rounded bg-gray-800 text-white focus:outline-none focus:border-blue-500"
                />
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
            </div>
            <button 
              type="submit" 
              className="w-full p-3 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition duration-300 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
          <p className="mt-4 text-center">
            Remember your password? <Link href="/login" className="text-blue-500 hover:underline">Login</Link>
          </p>
        </div>
      </main>
      <footer className="p-4 border-t border-gray-800 text-center text-sm text-gray-500">
        © 2024 Croxxlearn AI. All rights reserved.
      </footer>
    </div>
  );
}