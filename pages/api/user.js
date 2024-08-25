import connectMongo from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import User from '@/model/User';

export default async function handler(req, res) {
  // Verify the JWT token from the cookies
  const token = req.cookies.authToken; 
  console.log('Token received:', token ? 'Yes' : 'No');

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Verify and decode the token
    const decoded = await verifyToken(token);
    console.log('Token verified, userId:', decoded.userId);

    // Connect to MongoDB
    await connectMongo();

    // Fetch user data from MongoDB using Mongoose
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prepare the user data to send back
    const userData = {
      name: user.name,
      credits: user.credits || 0,
      referralCode: user.referralCode
    };

    res.status(200).json(userData);
  } catch (error) {
    console.error('Error in user API:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}