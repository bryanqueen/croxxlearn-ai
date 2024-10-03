import { useState } from 'react';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import BottomNavbar from '@/components/BottomNavbar';
import { FaCoins } from 'react-icons/fa';

const TopUpPage = () => {
  const [credits, setCredits] = useState(100);
  const [amount, setAmount] = useState(500);
  const router = useRouter();

  const handleCreditChange = (e) => {
    const newCredits = parseInt(e.target.value);
    setCredits(newCredits);
    setAmount(newCredits * 5); // 100 credits = 500 naira
  };

  const handleAmountChange = (e) => {
    const newAmount = parseInt(e.target.value);
    setAmount(newAmount);
    setCredits(Math.floor(newAmount / 5)); // Round down to nearest whole credit
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would integrate with your chosen payment gateway
    console.log(`Purchasing ${credits} credits for ${amount} naira`);
    // After successful payment, update user's credits and redirect to welcome page
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center pt-20 md:pt-24 p-4">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold mb-6 text-center">Top Up 🤑</h1>
          <form onSubmit={handleSubmit} className="bg-gray-900 rounded-lg shadow-lg p-6">
            <div className="mb-4">
              <label htmlFor="credits" className="block text-sm font-medium mb-2">
                Number of $croxx
              </label>
              <input
                type="number"
                id="credits"
                value={credits}
                onChange={handleCreditChange}
                min="100"
                step="100"
                className="w-full bg-gray-800 rounded-md p-2 text-white"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="amount" className="block text-sm font-medium mb-2">
                Amount (in Naira)
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={handleAmountChange}
                min="500"
                step="500"
                className="w-full bg-gray-800 rounded-md p-2 text-white"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
            >
              <FaCoins className="inline mr-2" />
              Purchase Credits
            </button>
          </form>

        </div>
      </main>
      <BottomNavbar />
    </div>
  );
};

export default TopUpPage;