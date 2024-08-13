import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const WelcomePage = () => {
  const [user, setUser] = useState({ name: '', points: 0 });
  const router = useRouter();

  useEffect(() => {
    // Simulating user data fetch
    setUser({ name: 'Alex', points: 1250 });
  }, []);

  const navigationButtons = [
    { label: 'Try AI Chatbot', icon: '🤖', route: '/chatbot' },
    { label: 'Quiz Generator', icon: '📝', route: '/quiz-generator' },
    { label: 'PDF Generator', icon: '📄', route: '/pdf-generator' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <header className="p-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold">croxxlearn ai.</h1>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-3xl font-bold mb-2">Welcome, {user.name}!</h2>
            <div className="flex items-center justify-between">
              <span className="text-lg">Your Balance</span>
              <span className="text-2xl font-bold">{user.points} pts</span>
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