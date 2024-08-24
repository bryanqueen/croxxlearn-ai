import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select, { useStateManager } from 'react-select';
import { useRouter } from 'next/router';
import {IoMdEye, IoMdEyeOff} from 'react-icons/io';
import Link from 'next/link';
import Header from '@/components/Header';

const institutions = [
  { value: 'university-of-lagos', label: 'University of Lagos' },
  { value: 'university-of-ibadan', label: 'University of Ibadan' },
  { value: 'obafemi-awolowo-university', label: 'Obafemi Awolowo University' },
  { value: 'ahmadu-bello-university', label: 'Ahmadu Bello University' },
  { value: 'university-of-nigeria-nsukka', label: 'University of Nigeria, Nsukka' },
  { value: 'covenant-university', label: 'Covenant University' },
  { value: 'federal-university-of-technology-minna', label: 'Federal University of Technology, Minna' },
  { value: 'university-of-ilorin', label: 'University of Ilorin' },
  { value: 'lagos-state-university', label: 'Lagos State University' },
  { value: 'babcock-university', label: 'Babcock University' },
  { value: 'yaba-college-of-technology', label: 'Yaba College of Technology' },
  { value: 'lagos-state-polytechnic', label: 'Lagos State Polytechnic' },
  { value: 'federal-polytechnic-ilaro', label: 'Federal Polytechnic, Ilaro' },
  { value: 'auchi-polytechnic', label: 'Auchi Polytechnic' },
  { value: 'the-polytechnic-ibadan', label: 'The Polytechnic, Ibadan' },
  { value: 'federal-polytechnic-nekede', label: 'Federal Polytechnic, Nekede' },
  { value: 'kaduna-polytechnic', label: 'Kaduna Polytechnic' },
  { value: 'federal-polytechnic-bida', label: 'Federal Polytechnic, Bida' },
  { value: 'kwara-state-polytechnic', label: 'Kwara State Polytechnic' },
  { value: 'federal-polytechnic-ede', label: 'Federal Polytechnic, Ede' },
  { value: 'adeyemi-college-of-education', label: 'Adeyemi College of Education' },
  { value: 'federal-college-of-education-zaria', label: 'Federal College of Education, Zaria' },
  { value: 'federal-college-of-education-abeokuta', label: 'Federal College of Education, Abeokuta' },
  { value: 'federal-college-of-education-kano', label: 'Federal College of Education, Kano' },
  { value: 'alvan-ikoku-federal-college-of-education', label: 'Alvan Ikoku Federal College of Education' },
  { value: 'college-of-education-ikere-ekiti', label: 'College of Education, Ikere-Ekiti' },
  { value: 'college-of-education-oyo', label: 'College of Education, Oyo' },
  { value: 'federal-college-of-education-akoka', label: 'Federal College of Education, Akoka' },
  { value: 'federal-college-of-education-kontagora', label: 'Federal College of Education, Kontagora' },
  { value: 'federal-college-of-education-obudu', label: 'Federal College of Education, Obudu' }
];

const Register = () => {
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState('')
  const router = useRouter();

  useEffect(() => {
    if(router.query.referralCode) {
      setReferralCode(router.query.referralCode)
    }
  }, [router.query.referralCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { name, email, password } = e.target.elements;

    try {
      const response = await axios.post('/api/register', {
        name: name.value,
        email: email.value,
        password: password.value,
        institution: selectedInstitution?.label,
        referralCode: referralCode
      });

      if (response.data.success) {
        // Handle successful registration (e.g., redirect to login)
        router.push('/login');
      }
    } catch (error) {
      console.error('Error registering:', error);
      setError(error.response?.data?.message || 'An error occurred during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header/>
      <main className="flex-grow flex flex-col items-center justify-center pt-32 p-4">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6">Join Croxxlearn AI</h2>
          {error && (
            <div className="mb-4 p-3 bg-red-600 text-white rounded">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-lg shadow-lg">
            <div className="mb-4">
              <label className="block mb-2">Name</label>
              <input type="text" name="name" className="w-full p-3 border border-gray-700 rounded bg-gray-800 text-white" required />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Email</label>
              <input type="email" name="email" className="w-full p-3 border border-gray-700 rounded bg-gray-800 text-white" required />
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
            <div className="mb-4">
              <label className="block mb-2">Institution</label>
              <Select
                options={institutions}
                value={selectedInstitution}
                onChange={setSelectedInstitution}
                className="text-black"
                classNamePrefix="select"
                isSearchable
              />
            </div>
            <input type='hidden' name="referralCode" value={referralCode}/>
            <button 
              type="submit" 
              className="w-full p-3 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition duration-300 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          <p className="mt-4 text-center">
            Already have an account? <Link href="/login" className="text-blue-500 hover:underline">Log In</Link>
          </p>
        </div>
      </main>
      <footer className="p-4 border-t border-gray-800 text-center text-sm text-gray-500">
        © 2024 Croxxlearn AI. All rights reserved.
      </footer>
    </div>
  );
};


export default Register;