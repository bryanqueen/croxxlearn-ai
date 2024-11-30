import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import BottomNavbar from '@/components/BottomNavbar';
import { FaUser, FaUniversity, FaCoins, FaUserFriends, FaEnvelope, FaPencilAlt, FaSave, FaTimes } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';

export default function ProfilePage() {
  const [user, setUser] = useState({
    name: '',
    email: '',
    // institution: '',
    credits: 0,
    referralCode: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user', {
          credentials: 'include'
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          console.error('Failed to fetch user data');
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prevUser => ({
      ...prevUser,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: user.name,
          institution: user.institution
        }),
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('An error occurred while updating profile');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header />
      <Toaster position="top-center" reverseOrder={false} />
      <main className="flex-grow flex items-center justify-center px-4 py-20 md:py-24">
        <div className="w-full max-w-2xl bg-gray-900 rounded-lg shadow-xl overflow-hidden">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-center mb-6">Your Profile</h1>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <ProfileField
                  icon={<FaUser className="text-3xl text-blue-400" />}
                  label="Name"
                  value={user.name}
                  name="name"
                  isEditing={isEditing}
                  onChange={handleInputChange}
                />
                {/* <ProfileField
                  icon={<FaUniversity className="text-3xl text-green-400" />}
                  label="Institution"
                  value={user.institution}
                  name="institution"
                  isEditing={isEditing}
                  onChange={handleInputChange}
                /> */}
                <ProfileField
                  icon={<FaCoins className="text-3xl text-yellow-400" />}
                  label="Credits"
                  value={`${user.credits} $croxx`}
                  isEditable={false}
                />
                <ProfileField
                  icon={<FaUserFriends className="text-3xl text-purple-400" />}
                  label="Referral Code"
                  value={user.referralCode}
                  isEditable={false}
                />
                <ProfileField
                  icon={<FaEnvelope className="text-3xl text-red-400" />}
                  label="Email"
                  value={user.email}
                  isEditable={false}
                  isEmail={true}
                />
              </div>
            </form>
          </div>
          <div className="px-8 py-4 bg-gray-800 flex justify-end">
            {isEditing ? (
              <>
                <button
                  onClick={handleSubmit}
                  className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-300 mr-4"
                >
                  <FaSave className="mr-2" />
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-300"
                >
                  <FaTimes className="mr-2" />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300"
              >
                <FaPencilAlt className="mr-2" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </main>
      <BottomNavbar />
    </div>
  );
}

function ProfileField({ icon, label, value, name, isEditing, onChange, isEditable = true, isEmail = false }) {
  const truncateEmail = (email) => {
    if (email.length <= 20) return email;
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 8) {
      return `${localPart}@${domain.slice(0, 3)}...${domain.slice(-3)}`;
    }
    return `${localPart.slice(0, 8)}...${localPart.slice(-3)}@${domain}`;
  };

  return (
    <div className="flex items-center space-x-4">
      {icon}
      <div className="flex-grow">
        <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
        {isEditable && isEditing ? (
          <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <p className="text-lg font-semibold" title={isEmail ? value : undefined}>
            {isEmail ? truncateEmail(value) : value}
          </p>
        )}
      </div>
    </div>
  );
}