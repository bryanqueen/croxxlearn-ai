import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import { FaUserFriends, FaCopy, FaCoins, FaWhatsapp } from 'react-icons/fa'; // Import icons
import toast, {Toaster} from 'react-hot-toast';
import BottomNavbar from '@/components/BottomNavbar';
import Link from 'next/link';
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
    const fetchUserData = async () => {
      try {
        const token = getCookie('authToken') || localStorage.getItem('authToken');
        
        if (!token) {
          router.push('/login');
          return;
        }
  
        const response = await fetch('/api/user', {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
  
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
          setReferralLink(`${baseUrl}/register?referralCode=${userData.referralCode}`);
        } else {
          if (response.status === 401) {
            localStorage.removeItem('authToken');
            router.push('/login');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
  
    fetchUserData();
  }, [router]);

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
    { label: 'Try CroxxChat', icon: '🤖', route: '/chatbot' },
    { label: 'Try CroxxQuiz', icon: '📝', route: '/quiz' },
    { label: 'Try CroxxDoc-Chat', icon: '📄', route: '/doc-chat' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header/>
      <Toaster position='top-center' reverseOrder={false}/>
      <main className="flex-grow flex flex-col items-center justify-center pt-20 md:pt-24 p-4">
        <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Welcome, {user.name}!</h2>
            <div className="flex items-center justify-between">
              <span className="text-md md:text-lg">Your Available Credit:</span>
              <span className="text-xl font-bold md:text-2xl">{user.credits} $croxx</span>
            </div>
            {/* <button
              onClick={() => router.push('/top-up')}
              className="mt-4 flex items-center justify-center w-full bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors duration-300"
            >
              <FaCoins className="mr-2" />
              Top Up Credits
            </button> */}
          </div>
          
          {/*Referral Section */}
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

          {/* WhatsApp Channel Section */}
            <div className="bg-green-600 rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <FaWhatsapp className="text-3xl text-white mr-3" />
              <h3 className="text-xl font-semibold">Join Our WhatsApp Channel</h3>
            </div>
            <p className="mb-4">Receive future updates on croxxlearn ai directly on WhatsApp!</p>
            <a 
              href="https://whatsapp.com/channel/0029VamQSUC3WHTPWqAUj621"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-white text-green-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors duration-300"
            >
              Join Now
            </a>
          </div>
          
          <h3 className="text-xl font-semibold mb-4">What would you like to try?</h3>
          <div className="grid gap-4 pb-12">
            {navigationButtons.map((button, index) => (
              <Link
                key={index}
                // onClick={() => router.push(button.route)}
                href={button.route}
                className="flex items-center justify-between bg-gray-900 hover:bg-gray-800 transition-colors duration-300 rounded-lg p-4 shadow-md"
              >
                <span className="flex items-center">
                  <span className="text-2xl mr-3">{button.icon}</span>
                  <span className="text-lg">{button.label}</span>
                </span>
                <span className="text-blue-400">→</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      {/* <footer className="p-4 border-t border-gray-800 text-center text-sm text-gray-500">
        © 2024 Croxxlearn AI. All rights reserved.
      </footer> */}
      <BottomNavbar/>
    </div>
  );
};

export default WelcomePage;