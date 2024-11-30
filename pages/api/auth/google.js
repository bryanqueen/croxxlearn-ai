
import dbConnect from '@/lib/mongodb';
import User from '@/model/User';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  await dbConnect();

  const { name, email, googleId } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      // User exists, update Google ID if not present
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        name,
        email,
        googleId,
        isVerified: true, // Google accounts are considered verified
        referralCode: Math.random().toString(36).substr(2, 8).toUpperCase(),
      });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(500).json({ success: false, message: 'An error occurred during authentication' });
  }
}