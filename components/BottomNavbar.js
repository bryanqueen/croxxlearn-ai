import React from 'react';
import { useRouter } from 'next/router';
import { Home, CreditCard, User } from 'lucide-react';

const BottomNavbar = () => {
  const router = useRouter();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-4 py-2 flex justify-around items-center">
      {/* <button
        onClick={() => router.push('/top-up')}
        className="p-2 rounded-full hover:bg-gray-800 transition duration-300"
      >
        <CreditCard className="w-6 h-6 text-gray-400" />
      </button> */}
      <button
        onClick={() => router.push('/welcome')}
        className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition duration-300"
      >
        <Home className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={() => router.push('/profile')}
        className="p-2 rounded-full hover:bg-gray-800 transition duration-300"
      >
        <User className="w-6 h-6 text-gray-400" />
      </button>
    </div>
  );
};

export default BottomNavbar;