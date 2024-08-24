import connectMongo from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import User from '@/model/User';

export default async function handler(req, res) {
  // Verify the JWT token from the request headers
  const token = req.headers.authorization?.split(' ')[1]; // Assumes 'Bearer <token>' format

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Verify and decode the token
    const decoded = await verifyToken(token);

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
      points: user.points || 0,
      referralCode: user.referralCode
    };

    res.status(200).json(userData);
  } catch (error) {
    console.error('Error in user API:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}