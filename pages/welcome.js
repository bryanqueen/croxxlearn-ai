import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import { FaUserFriends, FaCopy } from 'react-icons/fa'; // Import icons
import toast from 'react-hot-toast';
// import { getCookie } from 'cookies-next';

const WelcomePage = () => {
  const [user, setUser] = useState({ name: '', credits: 0, referralCode: '' });
  const [referralLink, setReferralLink] = useState('');
  const router = useRouter();


  const getCookie = (name) => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=');
      if (cookieName === name) {
        return decodeURIComponent(cookieValue);
      }
    }
    return null;
  };


  useEffect(() => {
          // Fetch real user data from the API
          const fetchUserData = async () => {
            try {
              console.log('Fetching user data...');
              console.log('All cookies:', document.cookie);
              const token = getCookie('authToken');
              console.log('Token from cookie:', token);
              
              if (!token) {
                console.error('No token found in cookie');
                router.push('/login');
                return;
              }
          
              console.log('Sending request to /api/user...');
              const response = await fetch('/api/user', {
                // headers: {
                //   'Authorization': `Bearer ${token}`
                // }
                credentials: 'include'
              });
          
              console.log('Response status:', response.status);
          
              if (response.ok) {
                const userData = await response.json();
                console.log('User data received:', userData);
                setUser(userData);
                const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
                setReferralLink(`${baseUrl}/register?referralCode=${userData.referralCode}`);
              } else {
                console.error('Failed to fetch user data');
                const errorData = await response.json();
                console.error('Error details:', errorData);
                if (response.status === 401) {
                  console.error('Unauthorized access, redirecting to login');
                  router.push('/login');
                }
              }
            } catch (error) {
              console.error('Error fetching user data:', error);
            }
          };

          fetchUserData()
  }, []);

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success('Link copied');
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Fallback method for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = referralLink;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success('Link copied');
      } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
        toast.error('Failed to copy link');
      }
      document.body.removeChild(textArea);
    }
  };

  const navigationButtons = [
    { label: 'Try AI Chatbot', icon: '🤖', route: '/chatbot' },
    { label: 'Try Quiz Generator', icon: '📝', route: '/quiz-generator' },
    { label: 'Try PDF Generator', icon: '📄', route: '/pdf-generator' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header/>
      <main className="flex-grow flex flex-col items-center justify-center pt-32 p-4">
        <div className="w-full max-w-md">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Welcome, {user.name}!</h2>
            <div className="flex items-center justify-between">
              <span className="text-md md:text-lg">Your Available Credit:</span>
              <span className="text-xl font-bold md:text-2xl">{user.credits} $croxx</span>
            </div>
          </div>
          
          {/* New Referral Section */}
          <div className="bg-gray-900 rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <FaUserFriends className="text-3xl text-blue-400 mr-3" />
              <h3 className="text-xl font-semibold">Refer Friends & Earn Credits</h3>
            </div>
            <p className="mb-4">Share your unique link and earn bonus credits when friends sign up!</p>
            <div className="flex items-center bg-gray-800 rounded p-2">
              <input 
                type="text" 
                value={referralLink} 
                readOnly 
                className="bg-transparent flex-grow outline-none text-sm truncate"
              />
              <button 
                onClick={copyReferralLink}
                className="ml-2 text-blue-400 hover:text-blue-300"
              >
                <FaCopy />
              </button>
            </div>
          </div>
          
          <h3 className="text-xl font-semibold mb-4">What would you like to do?</h3>
          <div className="grid gap-4">
            {navigationButtons.map((button, index) => (
              <button
                key={index}
                onClick={() => router.push(button.route)}
                className="flex items-center justify-between bg-gray-900 hover:bg-gray-800 transition-colors duration-300 rounded-lg p-4 shadow-md"
              >
                <span className="flex items-center">
                  <span className="text-2xl mr-3">{button.icon}</span>
                  <span className="text-lg">{button.label}</span>
                </span>
                <span className="text-blue-400">→</span>
              </button>
            ))}
          </div>
        </div>
      </main>
      <footer className="p-4 border-t border-gray-800 text-center text-sm text-gray-500">
        © 2024 Croxxlearn AI. All rights reserved.
      </footer>
    </div>
  );
};

export default WelcomePage;